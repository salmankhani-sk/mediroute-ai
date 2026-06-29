'use server';

import prisma from '@/lib/db';
import { PESHAWAR_HOSPITALS } from '@/lib/hospitals';
import type { HospitalWithDistance } from '@/lib/ai-types';

// ─── Haversine Formula ──────────────────────────────────────
// Calculates great-circle distance between two lat/lng points in KM
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Find Nearest Hospitals ─────────────────────────────────
export async function findNearestHospitals(
  userLat: number,
  userLng: number,
  limit: number = 10,
): Promise<HospitalWithDistance[]> {
  // Fetch all approved hospitals (Peshawar-focused)
  const hospitals = await prisma.hospital.findMany({
    where: {
      isApproved: true,
      city: { contains: 'Peshawar', mode: 'insensitive' },
    },
  });

  // Calculate distance for each hospital
  const withDistance: HospitalWithDistance[] = hospitals.map((h) => ({
    ...h,
    distanceKm: haversineDistance(userLat, userLng, h.latitude, h.longitude),
  }));

  // Sort by distance ascending and limit
  return withDistance
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

// ─── Get Hospital by Department ─────────────────────────────
export async function getHospitalsByDepartment(
  department: string,
  userLat?: number,
  userLng?: number,
): Promise<HospitalWithDistance[]> {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: {
        isApproved: true,
        departments: { has: department as any },
      },
      include: {
        doctors: {
          where: { isApproved: true, isAvailable: true },
          select: { id: true, specialistType: true, user: { select: { fullName: true } } },
        },
      },
    });

    const result: HospitalWithDistance[] = hospitals.map((h) => ({
      id: h.id, name: h.name, address: h.address, city: h.city,
      latitude: h.latitude, longitude: h.longitude, phone: h.phone,
      departments: h.departments,
      distanceKm: userLat && userLng
        ? haversineDistance(userLat, userLng, h.latitude, h.longitude) : 0,
    }));

    return result.sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (error) {
    console.error('getHospitalsByDepartment error:', error);
    return [];
  }
}

// ─── Find Doctors by Specialist Type (Near User) ────────────
export async function findDoctorsBySpecialist(
  specialistType: string,
  userLat?: number,
  userLng?: number,
  limit: number = 10,
) {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: { isApproved: true, isAvailable: true, specialistType: specialistType as any },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        hospital: { select: { id: true, name: true, latitude: true, longitude: true, address: true } },
      },
      take: limit,
    });

    return doctors.map((d) => ({
      id: d.id, userId: d.userId, fullName: d.user.fullName, email: d.user.email,
      phone: d.user.phone, specialistType: d.specialistType, department: d.department,
      qualification: d.qualification, experienceYears: d.experienceYears,
      consultationFee: d.consultationFee, bio: d.bio,
      hospitalName: d.hospital?.name || 'Independent Practitioner',
      hospitalAddress: d.hospital?.address || null,
      hospitalLat: d.hospital?.latitude || null,
      hospitalLng: d.hospital?.longitude || null,
      distanceKm: userLat && userLng && d.hospital
        ? haversineDistance(userLat, userLng, d.hospital.latitude, d.hospital.longitude) : null,
    })).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  } catch (error) {
    console.error('findDoctorsBySpecialist error:', error);
    return [];
  }
}

export async function getDoctorById(doctorId: string) {
  try {
    const d = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        hospital: { select: { id: true, name: true, latitude: true, longitude: true, address: true } },
        schedules: true,
      },
    });
    if (!d) return null;
    return {
      id: d.id, userId: d.userId, fullName: d.user.fullName, email: d.user.email,
      phone: d.user.phone, specialistType: d.specialistType, department: d.department,
      qualification: d.qualification, experienceYears: d.experienceYears,
      consultationFee: d.consultationFee, bio: d.bio,
      hospitalName: d.hospital?.name || null,
      hospitalAddress: d.hospital?.address || null,
      schedules: d.schedules.map(s => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })),
    };
  } catch (error) {
    console.error('getDoctorById error:', error);
    return null;
  }
}

// ─── Seed Hospitals into DB ─────────────────────────────────
export async function seedHospitals(): Promise<{ count: number }> {
  try {
    const existing = await prisma.hospital.count();
    if (existing > 0) return { count: existing };
    await prisma.hospital.createMany({
      data: PESHAWAR_HOSPITALS.map((h) => ({ ...h, city: 'Peshawar', isApproved: true })),
    });
    return { count: PESHAWAR_HOSPITALS.length };
  } catch (error) {
    console.error('seedHospitals error:', error);
    return { count: 0 };
  }
}

// ─── Fetch ALL Hospitals from OpenStreetMap (Overpass API) ──
// Free, no API key needed. Queries all hospitals within 20km of Peshawar.

interface OSMHospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  type: string; // hospital, clinic, etc.
}

export async function fetchOSMHospitals(
  userLat: number = 34.0151,
  userLng: number = 71.5249,
): Promise<OSMHospital[]> {
  try {
    const radius = 20000; // 20km radius around Peshawar
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="hospital"](around:${radius},${userLat},${userLng});
        node["amenity"="clinic"](around:${radius},${userLat},${userLng});
        way["amenity"="hospital"](around:${radius},${userLat},${userLng});
        way["amenity"="clinic"](around:${radius},${userLat},${userLng});
      );
      out center;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour

    if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

    const data = await res.json();
    const hospitals: OSMHospital[] = [];

    for (const el of data.elements) {
      const tags = el.tags || {};
      // Skip if no name
      if (!tags.name) continue;

      const lat = el.lat || el.center?.lat;
      const lng = el.lon || el.center?.lon;
      if (!lat || !lng) continue;

      // Build address from OSM tags
      const addrParts = [
        tags['addr:street'],
        tags['addr:city'] || 'Peshawar',
      ].filter(Boolean);

      hospitals.push({
        id: `osm-${el.id}`,
        name: tags.name,
        latitude: lat,
        longitude: lng,
        address: addrParts.length > 0 ? addrParts.join(', ') : 'Peshawar',
        phone: tags.phone || tags['contact:phone'] || null,
        type: tags.amenity || 'hospital',
      });
    }

    // Deduplicate by name (OSM may have both node and way for same hospital)
    const seen = new Set<string>();
    const unique = hospitals.filter(h => {
      const key = h.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('fetchOSMHospitals error:', error);
    return [];
  }
}

// ─── Merge DB + OSM Hospitals with Distance ─────────────────
export async function getAllHospitalsWithDistance(
  userLat: number,
  userLng: number,
): Promise<HospitalWithDistance[]> {
  // Fetch both sources in parallel
  const [dbHospitals, osmHospitals] = await Promise.all([
    prisma.hospital.findMany({ where: { isApproved: true } }).catch(() => []),
    fetchOSMHospitals(userLat, userLng),
  ]);

  // Map DB hospitals
  const dbMapped: HospitalWithDistance[] = dbHospitals.map(h => ({
    id: h.id,
    name: h.name,
    address: h.address,
    city: h.city,
    latitude: h.latitude,
    longitude: h.longitude,
    phone: h.phone,
    departments: h.departments,
    distanceKm: haversineDistance(userLat, userLng, h.latitude, h.longitude),
  }));

  // Map OSM hospitals (merge with DB ones if same name)
  const dbNames = new Set(dbMapped.map(h => h.name.toLowerCase().trim()));
  const osmMapped: HospitalWithDistance[] = osmHospitals
    .filter(h => !dbNames.has(h.name.toLowerCase().trim()))
    .map(h => ({
      id: h.id,
      name: h.name,
      address: h.address,
      city: 'Peshawar',
      latitude: h.latitude,
      longitude: h.longitude,
      phone: h.phone,
      departments: [],
      distanceKm: haversineDistance(userLat, userLng, h.latitude, h.longitude),
    }));

  // Combine and sort by distance
  return [...dbMapped, ...osmMapped]
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
