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
