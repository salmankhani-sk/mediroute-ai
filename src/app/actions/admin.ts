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
    const [
      totalDoctors, totalPatients, totalHospitals, totalAppointments,
      pendingAppts, confirmedAppts, completedAppts, cancelledAppts,
      pendingDoctors,
    ] = await Promise.all([
      prisma.doctorProfile.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.hospital.count({ where: { isApproved: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.doctorProfile.count({ where: { isApproved: false } }),
    ]);
    return {
      totalDoctors, totalPatients, totalHospitals, totalAppointments,
      pendingAppts, confirmedAppts, completedAppts, cancelledAppts,
      pendingDoctors,
    };
  } catch { return null; }
}

// ─── Appointments per Doctor ──────────────────────────────
export async function getAppointmentsPerDoctor() {
  try {
    await requireRole('ADMIN');
    const results = await prisma.appointment.groupBy({
      by: ['doctorId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const doctorIds = results.map(r => r.doctorId);
    const doctors = await prisma.doctorProfile.findMany({
      where: { id: { in: doctorIds } },
      include: { user: { select: { fullName: true } } },
    });
    const doctorMap = new Map(doctors.map(d => [d.id, { name: d.user.fullName, specialty: d.specialistType }]));

    return results.map(r => ({
      doctorId: r.doctorId,
      doctorName: doctorMap.get(r.doctorId)?.name || 'Unknown',
      specialty: doctorMap.get(r.doctorId)?.specialty || 'N/A',
      totalAppointments: r._count.id,
    }));
  } catch { return []; }
}

// ─── Appointments Status per Doctor ──────────────────────
export async function getAppointmentStatusPerDoctor() {
  try {
    await requireRole('ADMIN');
    const doctors = await prisma.doctorProfile.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { fullName: true } },
        appointments: { select: { status: true } },
      },
      orderBy: { user: { fullName: 'asc' } },
    });

    return doctors.map(d => {
      const statusCounts: Record<string, number> = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 };
      d.appointments.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
      return {
        doctorId: d.id,
        doctorName: d.user.fullName,
        specialty: d.specialistType,
        totalPatients: d.appointments.length,
        ...statusCounts,
      };
    });
  } catch { return []; }
}

// ─── Recent Appointments ─────────────────────────────────
export async function getRecentAppointments(limit = 20) {
  try {
    await requireRole('ADMIN');
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: { include: { user: { select: { fullName: true } } } },
        patient: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return appointments.map(a => ({
      id: a.id,
      patientName: a.patient.fullName,
      patientEmail: a.patient.email,
      doctorName: a.doctor.user.fullName,
      date: a.date.toISOString().split('T')[0],
      timeSlot: a.timeSlot,
      status: a.status,
      consultationType: a.consultationType,
    }));
  } catch { return []; }
}

// ─── Doctor List with patient counts ────────────────────
export async function getDoctorsWithPatientCounts() {
  try {
    await requireRole('ADMIN');
    const doctors = await prisma.doctorProfile.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { appointments: { _count: 'desc' } },
    });
    return doctors.map(d => ({
      id: d.id,
      name: d.user.fullName,
      email: d.user.email,
      specialty: d.specialistType,
      totalAppointments: d._count.appointments,
      isAvailable: d.isAvailable,
    }));
  } catch { return []; }
}

// ─── Users with Locations ───────────────────────────────
export async function getUsersWithLocations() {
  try {
    await requireRole('ADMIN');
    const users = await prisma.user.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    return users;
  } catch { return []; }
}

// ─── Users Count with Location ──────────────────────────
export async function getLocationStats() {
  try {
    await requireRole('ADMIN');
    const [totalUsers, withLocation] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { latitude: { not: null }, longitude: { not: null } } }),
    ]);
    return { totalUsers, withLocation };
  } catch { return { totalUsers: 0, withLocation: 0 }; }
}
