'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/symptoms', label: 'AI Symptom Check' },
    { href: '/hospitals', label: 'Find Hospitals' },
    { href: '/chatbot', label: 'MediBot AI' },
    { href: '/appointments', label: 'My Appointments' },
    { href: '/doctor', label: 'Doctor Panel' },
    { href: '/admin', label: 'Admin' },
    { href: '/register/doctor', label: 'Register as Doctor' },
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Patient Sign Up', highlight: true },
  ];

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
            {links.map(l => (
              <Link key={l.href} href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  l.highlight ? 'bg-primary-600 text-white hover:bg-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
