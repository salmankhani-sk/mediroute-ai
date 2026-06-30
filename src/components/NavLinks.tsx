'use client';

import { useAuth } from '@/lib/AuthProvider';
import Link from 'next/link';

export default function NavLinks() {
  const { user, loading, logout } = useAuth();

  // Don't flash the wrong links while loading
  if (loading) {
    return (
      <>
        <span className="text-gray-400 text-sm font-medium">AI Symptom Check</span>
        <span className="text-gray-400 text-sm font-medium">Find Hospitals</span>
        <span className="text-gray-400 text-sm font-medium">MediBot AI</span>
      </>
    );
  }

  const isLoggedIn = !!user;
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* ─── Public: always visible ─── */}
      <a href="/symptoms" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
        AI Symptom Check
      </a>
      <a href="/hospitals" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
        Find Hospitals
      </a>
      <a href="/chatbot" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
        MediBot AI
      </a>

      {/* ─── Patient only ─── */}
      {isPatient && (
        <a href="/appointments" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
          My Appointments
        </a>
      )}

      {/* ─── Doctor only ─── */}
      {isDoctor && (
        <a href="/doctor" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
          Doctor Panel
        </a>
      )}

      {/* ─── Admin only ─── */}
      {isAdmin && (
        <a href="/admin" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
          Admin
        </a>
      )}

      {/* ─── Logged-out only ─── */}
      {!isLoggedIn && (
        <>
          <a href="/register/doctor" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
            Register as Doctor
          </a>
          <a href="/login" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
            Login
          </a>
          <a
            href="/register"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Patient Sign Up
          </a>
        </>
      )}

      {/* ─── Logged-in: show user name + logout ─── */}
      {isLoggedIn && (
        <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200">
          <span className="text-sm text-gray-500">
            {user!.fullName}
            {isDoctor && <span className="ml-1 text-xs text-primary-600">(Doctor)</span>}
            {isAdmin && <span className="ml-1 text-xs text-amber-600">(Admin)</span>}
          </span>
          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-red-500 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}
