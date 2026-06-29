'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireSession, getSession } from '@/lib/session';

export type BookAppointmentInput = {
  doctorProfileId: string;
  hospitalId?: string;
  date: string;
  timeSlot: string;
  symptoms?: string;
  aiAdvice?: string;
  urgencyLevel?: string;
  consultationType?: 'IN_PERSON' | 'VIDEO' | 'PHONE';
};

export async function bookAppointment(input: BookAppointmentInput) {
  try {
    // Get patient from session (no more hardcoded demo-patient!)
    const session = await requireSession();
    if (session.role !== 'PATIENT') {
      return { success: false, error: 'Only patients can book appointments.' };
    }

    // Check if the time slot is already booked
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorProfileId,
        date: new Date(input.date),
        timeSlot: input.timeSlot,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    if (existing) {
      return { success: false, error: 'This time slot is already booked. Please choose another.' };
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.id,
        doctorId: input.doctorProfileId,
        hospitalId: input.hospitalId || null,
        date: new Date(input.date),
        timeSlot: input.timeSlot,
        symptoms: input.symptoms || null,
        aiAdvice: input.aiAdvice || null,
        urgencyLevel: (input.urgencyLevel as any) || null,
        consultationType: input.consultationType || 'IN_PERSON',
        status: 'PENDING',
      },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true } },
            hospital: { select: { name: true, address: true } },
          },
        },
        patient: { select: { fullName: true, email: true } },
      },
    });

    // Create notification for the patient
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: 'Appointment Booked',
        message: `Your appointment with ${appointment.doctor.user.fullName} on ${input.date} at ${input.timeSlot} is pending confirmation.`,
        type: 'APPOINTMENT',
      },
    });

    revalidatePath('/appointments');

    return { success: true, data: appointment };
  } catch (error) {
    console.error('Booking error:', error);
    return { success: false, error: 'Failed to book appointment. Please try again.' };
  }
}

export async function getPatientAppointments() {
  try {
    const session = await getSession();
    if (!session) return [];
    const appointments = await prisma.appointment.findMany({
      where: { patientId: session.id },
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            hospital: { select: { name: true, address: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return appointments.map((a) => ({
      id: a.id,
      doctorName: a.doctor.user.fullName,
      doctorSpecialty: a.doctor.specialistType,
      hospitalName: a.doctor.hospital?.name || 'N/A',
      date: a.date.toISOString(),
      timeSlot: a.timeSlot,
      status: a.status,
      symptoms: a.symptoms,
      urgencyLevel: a.urgencyLevel,
      notes: a.notes,
    }));
  } catch (error) {
    console.error('getPatientAppointments error:', error);
    return [];
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const session = await requireSession();
    // Verify ownership
    const app = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!app || app.patientId !== session.id) {
      return { success: false, error: 'Not authorized to cancel this appointment.' };
    }
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('cancelAppointment error:', error);
    return { success: false, error: 'Failed to cancel appointment.' };
  }
}

// ─── Doctor Dashboard Actions ──────────────────────────────
export async function getDoctorAppointments() {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return [];

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return [];

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: { select: { fullName: true, email: true, phone: true } },
        doctor: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return appointments.map(a => ({
      id: a.id, patientName: a.patient.fullName, patientPhone: a.patient.phone,
      date: a.date.toISOString(), timeSlot: a.timeSlot, status: a.status,
      symptoms: a.symptoms, urgencyLevel: a.urgencyLevel,
    }));
  } catch (error) {
    console.error('getDoctorAppointments error:', error);
    return [];
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return { success: false, error: 'Unauthorized.' };

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    const app = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!doctor || !app || app.doctorId !== doctor.id) {
      return { success: false, error: 'Not authorized.' };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any },
    });

    // Notify patient
    const statusLabel: Record<string, string> = { CONFIRMED: 'confirmed', CANCELLED: 'cancelled', COMPLETED: 'completed' };
    await prisma.notification.create({
      data: {
        userId: app.patientId,
        title: `Appointment ${statusLabel[status] || 'updated'}`,
        message: `Your appointment on ${app.date.toISOString().split('T')[0]} has been ${statusLabel[status] || 'updated'} by the doctor.`,
        type: 'APPOINTMENT',
      },
    });

    revalidatePath('/doctor');
    return { success: true };
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

export async function toggleDoctorAvailability() {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return { success: false, error: 'Unauthorized.' };

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return { success: false, error: 'Doctor profile not found.' };

    const updated = await prisma.doctorProfile.update({
      where: { id: doctor.id },
      data: { isAvailable: !doctor.isAvailable },
    });

    return { success: true, isAvailable: updated.isAvailable };
  } catch (error) {
    console.error('toggleDoctorAvailability error:', error);
    return { success: false, error: 'Failed to update availability.' };
  }
}

export async function getDoctorStats() {
  try {
    const session = await requireSession();
    if (session.role !== 'DOCTOR') return null;

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.id } });
    if (!doctor) return null;

    const [total, today, confirmed, earnings] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: doctor.id } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, date: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, status: 'COMPLETED' } }),
    ]);

    return { total, today, confirmed, completed: earnings, totalEarnings: earnings * doctor.consultationFee };
  } catch (error) {
    console.error('getDoctorStats error:', error);
    return null;
  }
}
