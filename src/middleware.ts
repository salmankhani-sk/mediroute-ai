import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medi-route-jwt-secret-change-in-production'
);

const COOKIE_NAME = 'medi-route-session';

async function getSessionUser(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; fullName: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionUser(request);

  // ─── Routes that require login ──────────────────────
  const authRequired = ['/appointments', '/doctor', '/admin'];

  // ─── Routes that require PATIENT role ───────────────
  const patientOnly = ['/appointments'];

  // ─── Routes that require DOCTOR role ────────────────
  const doctorOnly = ['/doctor', '/doctor/schedule'];

  // ─── Routes that require ADMIN role ─────────────────
  const adminOnly = ['/admin'];

  // ─── Routes only for logged-out users ───────────────
  const guestOnly = ['/login', '/register', '/register/doctor'];

  // Check if path starts with any protected prefix
  const needsAuth = authRequired.some(p => pathname.startsWith(p));
  const needsPatient = patientOnly.some(p => pathname.startsWith(p));
  const needsDoctor = doctorOnly.some(p => pathname.startsWith(p));
  const needsAdmin = adminOnly.some(p => pathname.startsWith(p));
  const needsGuest = guestOnly.some(p => pathname.startsWith(p));

  // Redirect to login if auth required but not logged in
  if (needsAuth && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if patient-only and not a patient
  if (needsPatient && user && user.role !== 'PATIENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect to home if doctor-only and not a doctor
  if (needsDoctor && user && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect to home if admin-only and not an admin
  if (needsAdmin && user && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect to home if guest-only but already logged in
  if (needsGuest && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/appointments/:path*',
    '/doctor/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/register/doctor',
  ],
};
