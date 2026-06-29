import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';
import NotificationBell from '@/components/NotificationBell';
import MobileNav from '@/components/MobileNav';
import EmergencyButton from '@/components/EmergencyButton';
import { FaStarOfLife } from 'react-icons/fa6';

export const metadata: Metadata = {
  title: 'MediRoute AI — Find Doctors, Book Appointments & Get AI Medical Guidance | Peshawar',
  description:
    'MediRoute AI helps Peshawar patients find the right specialist, book instant appointments, get AI-powered symptom analysis, and discover nearby hospitals — all in one platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Medi<span className="text-primary-600">Route</span>
                </span>
              </a>

              <div className="flex items-center gap-3">
                <NotificationBell />
                <MobileNav />
              </div>

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="/symptoms" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  AI Symptom Check
                </a>
                <a href="/hospitals" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  Find Hospitals
                </a>
                <a href="/chatbot" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  MediBot AI
                </a>
                <a href="/appointments" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  My Appointments
                </a>
                <a href="/doctor" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  Doctor Panel
                </a>
                <a href="/admin" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                  Admin
                </a>
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
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1"><ClientLayout>{children}</ClientLayout></main>
        <EmergencyButton />

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                © 2026 MediRoute AI — Smart Healthcare Platform for Peshawar.
              </p>
              <p className="text-xs text-gray-500">
                <FaStarOfLife className="inline w-3.5 h-3.5 mr-1 text-amber-600" /> AI guidance is not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
