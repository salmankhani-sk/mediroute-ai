import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medi-route-jwt-secret-change-in-production'
);

const COOKIE_NAME = 'medi-route-session';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone?: string | null;
}

// ─── Create JWT and set cookie ──────────────────────────────
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });

  return token;
}

// ─── Get session from cookie ─────────────────────────────────
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ─── Require authenticated session ───────────────────────────
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

// ─── Require specific role ───────────────────────────────────
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) throw new Error('FORBIDDEN');
  return session;
}

// ─── Destroy session (logout) ────────────────────────────────
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
