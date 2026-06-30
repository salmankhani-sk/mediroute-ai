'use server';

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createSession, destroySession, getSession } from '@/lib/session';

// ─── Validation Schemas ────────────────────────────────────
const emailSchema = z.string().email('Invalid email format').max(255);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
const phoneSchema = z.string().max(20).optional();
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);

export async function registerDoctor(input: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  specialistType: string;
  department: string;
  licenseNumber: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  hospitalId?: string;
  clinicName?: string;
  clinicLat?: number;
  clinicLng?: number;
}) {
  try {
    // Validate inputs
    const parsed = z.object({
      fullName: nameSchema,
      email: emailSchema,
      password: passwordSchema,
      phone: z.string().min(1, 'Phone is required').max(20),
      specialistType: z.string().min(1, 'Specialist type is required'),
      department: z.string().min(1, 'Department is required'),
      licenseNumber: z.string().min(1, 'License number is required').max(50),
      qualification: z.string().min(1, 'Qualification is required').max(200),
      experienceYears: z.number().min(0).max(60),
      consultationFee: z.number().min(0),
      bio: z.string().max(1000).optional(),
      hospitalId: z.string().optional(),
      clinicName: z.string().max(200).optional(),
      clinicLat: z.number().min(-90).max(90).optional(),
      clinicLng: z.number().min(-180).max(180).optional(),
    }).safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || 'Invalid input.' };
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    // Check license number
    const existingLicense = await prisma.doctorProfile.findUnique({
      where: { licenseNumber: input.licenseNumber },
    });
    if (existingLicense) {
      return { success: false, error: 'This license number is already registered.' };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user + doctor profile in a transaction
    const doctorData: any = {
      userId: '',
      specialistType: input.specialistType as any,
      department: input.department as any,
      licenseNumber: input.licenseNumber,
      qualification: input.qualification,
      experienceYears: input.experienceYears,
      consultationFee: input.consultationFee,
      bio: input.bio || null,
      isApproved: false,
    };
    if (input.hospitalId) doctorData.hospitalId = input.hospitalId;
    if (input.clinicName) doctorData.clinicName = input.clinicName;
    if (input.clinicLat != null) doctorData.clinicLat = input.clinicLat;
    if (input.clinicLng != null) doctorData.clinicLng = input.clinicLng;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone,
          role: 'DOCTOR',
        },
      });

      doctorData.userId = user.id;

      const doctorProfile = await tx.doctorProfile.create({
        data: doctorData,
      });

      return { user, doctorProfile };
    });

    return {
      success: true,
      message: 'Registration submitted successfully! Your profile is pending admin approval.',
      doctorId: result.doctorProfile.id,
    };
  } catch (error: any) {
    console.error('Doctor registration error:', error);
    const message = error?.code === 'P2002'
      ? 'This license number or email is already in use.'
      : error?.message || 'Registration failed. Please try again.';
    return { success: false, error: message };
  }
}

// ─── Patient Registration ──────────────────────────────────
export async function registerPatient(input: {
  fullName: string; email: string; password: string; phone?: string;
}) {
  try {
    // Validate inputs
    const parsed = z.object({
      fullName: nameSchema,
      email: emailSchema,
      password: passwordSchema,
      phone: phoneSchema,
    }).safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || 'Invalid input.' };
    }
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.user.create({
      data: {
        email: input.email, passwordHash, fullName: input.fullName,
        phone: input.phone || null, role: 'PATIENT',
      },
    });
    return { success: true, message: 'Account created successfully!' };
  } catch (error) {
    console.error('Patient registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

// ─── Login ─────────────────────────────────────────────────
export async function loginUser(input: { email: string; password: string }) {
  try {
    const parsed = z.object({
      email: emailSchema,
      password: z.string().min(1, 'Password is required'),
    }).safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) return { success: false, error: 'Invalid email or password.' };

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) return { success: false, error: 'Invalid email or password.' };

    // Create JWT session cookie
    await createSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
    });

    return {
      success: true,
      user: {
        id: user.id, fullName: user.fullName, email: user.email,
        role: user.role, phone: user.phone,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// ─── Logout ─────────────────────────────────────────────────
export async function logoutUser() {
  await destroySession();
  return { success: true };
}

// ─── Get Current User ───────────────────────────────────────
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;
    return session;
  } catch {
    return null;
  }
}
