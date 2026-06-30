'use server';

import prisma from '@/lib/db';
import { requireRole, requireSession } from '@/lib/session';

export async function getDoctorSchedules() {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return [];
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return [];
    return prisma.doctorSchedule.findMany({ where: { doctorId: doctor.id } });
  } catch { return []; }
}

export async function saveDoctorSchedule(schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return { success: false };
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return { success: false };

    // Delete existing and recreate
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctorSchedule.createMany({
      data: schedules.map(s => ({
        doctorId: doctor.id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, isActive: s.isActive,
      })),
    });
    return { success: true };
  } catch { return { success: false }; }
}

// ─── Date-Specific Availability ───────────────────────────

export async function getDoctorAvailabilities(month?: string) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return [];
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return [];

    // Default to current month
    const now = month ? new Date(month + '-01') : new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { date: 'asc' },
    });
  } catch { return []; }
}

export async function saveDoctorAvailability(
  date: string,
  startTime: string,
  endTime: string,
  isAvailable: boolean,
) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return { success: false };
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return { success: false };

    const dateObj = new Date(date);

    await prisma.doctorAvailability.upsert({
      where: { doctorId_date: { doctorId: doctor.id, date: dateObj } },
      update: { startTime, endTime, isAvailable },
      create: { doctorId: doctor.id, date: dateObj, startTime, endTime, isAvailable },
    });

    return { success: true };
  } catch (error) {
    console.error('saveDoctorAvailability error:', error);
    return { success: false };
  }
}

export async function deleteDoctorAvailability(date: string) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return { success: false };
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return { success: false };

    await prisma.doctorAvailability.deleteMany({
      where: { doctorId: doctor.id, date: new Date(date) },
    });

    return { success: true };
  } catch { return { success: false }; }
}

export async function getDoctorAppointmentsForDate(date: string) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return [];
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return [];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: {
        patient: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: { timeSlot: 'asc' },
    });
  } catch { return []; }
}
