'use client';

export default function EmergencyButton() {
  return (
    <a
      href="tel:1122"
      className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-red-700 transition-all animate-pulse flex items-center gap-2 text-sm font-bold"
      title="Call Emergency 1122"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-9.9a5 5 0 010 7.072M9.172 4.172a9 9 0 00-3.536 13.364M6.343 6.343a5 5 0 00-1.414 8.486M12 2v2m0 16v2m10-10h2M2 12H0" />
      </svg>
      EMERGENCY 1122
    </a>
  );
}
