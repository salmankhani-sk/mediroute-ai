'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';

  const closeMenu = () => setOpen(false);

  const linkClass = 'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100';
  const highlightClass = 'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700';

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3 space-y-1">
            {/* ─── Public ─── */}
            <Link href="/symptoms" onClick={closeMenu} className={linkClass}>AI Symptom Check</Link>
            <Link href="/hospitals" onClick={closeMenu} className={linkClass}>Find Hospitals</Link>
            <Link href="/chatbot" onClick={closeMenu} className={linkClass}>MediBot AI</Link>

            {/* ─── Patient ─── */}
            {isPatient && (
              <Link href="/appointments" onClick={closeMenu} className={linkClass}>My Appointments</Link>
            )}

            {/* ─── Doctor ─── */}
            {isDoctor && (
              <Link href="/doctor" onClick={closeMenu} className={linkClass}>Doctor Panel</Link>
            )}

            {/* ─── Admin ─── */}
            {isAdmin && (
              <Link href="/admin" onClick={closeMenu} className={linkClass}>Admin</Link>
            )}

            {/* ─── Logged-out ─── */}
            {!isLoggedIn && (
              <>
                <hr className="my-2" />
                <Link href="/register/doctor" onClick={closeMenu} className={linkClass}>Register as Doctor</Link>
                <Link href="/login" onClick={closeMenu} className={linkClass}>Login</Link>
                <Link href="/register" onClick={closeMenu} className={highlightClass}>Patient Sign Up</Link>
              </>
            )}

            {/* ─── Logged-in user info + logout ─── */}
            {isLoggedIn && (
              <>
                <hr className="my-2" />
                <div className="px-4 py-2 text-sm text-gray-500">
                  {user!.fullName}
                  {isDoctor && <span className="ml-1 text-xs text-primary-600">(Doctor)</span>}
                  {isAdmin && <span className="ml-1 text-xs text-amber-600">(Admin)</span>}
                </div>
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
