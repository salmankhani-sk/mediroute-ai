'use server';

import prisma from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function getPendingDoctors() {
  try {
    await requireRole('ADMIN');
    const doctors = await prisma.doctorProfile.findMany({
      where: { isApproved: false },
      include: { user: { select: { fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return doctors.map(d => ({
      id: d.id,
      fullName: d.user.fullName, email: d.user.email, phone: d.user.phone,
      specialistType: d.specialistType, qualification: d.qualification,
      licenseNumber: d.licenseNumber, experienceYears: d.experienceYears,
      consultationFee: d.consultationFee,
    }));
  } catch { return []; }
}

export async function approveDoctor(doctorId: string) {
  try {
    await requireRole('ADMIN');
    await prisma.doctorProfile.update({ where: { id: doctorId }, data: { isApproved: true } });
    return { success: true };
  } catch { return { success: false }; }
}

export async function rejectDoctor(doctorId: string) {
  try {
    await requireRole('ADMIN');
    await prisma.doctorProfile.delete({ where: { id: doctorId } });
    return { success: true };
  } catch { return { success: false }; }
}

export async function getAdminStats() {
  try {
    await requireRole('ADMIN');
    const [totalDoctors, totalPatients, totalHospitals, totalAppointments] = await Promise.all([
      prisma.doctorProfile.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.hospital.count({ where: { isApproved: true } }),
      prisma.appointment.count(),
    ]);
    return { totalDoctors, totalPatients, totalHospitals, totalAppointments };
  } catch { return null; }
}
