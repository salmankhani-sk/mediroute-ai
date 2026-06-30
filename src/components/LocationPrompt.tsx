'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { saveUserLocation } from '@/app/actions/location';
import { FaLocationPin, FaXmark, FaCheck } from 'react-icons/fa6';

const STORAGE_KEY = 'mediroute_location_prompted';

export default function LocationPrompt() {
  const { user, loading: authLoading } = useAuth();
  const [show, setShow] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    // Don't show while auth is loading
    if (authLoading) return;

    // Check if already prompted in this browser
    const alreadyPrompted = localStorage.getItem(STORAGE_KEY);
    if (alreadyPrompted === 'granted' || alreadyPrompted === 'denied') return;

    // Show prompt after a short delay
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, [authLoading]); // Only depend on authLoading, runs once auth is ready

  async function handleAllow() {
    if (!navigator.geolocation) {
      setStatus('denied');
      localStorage.setItem(STORAGE_KEY, 'denied');
      setTimeout(() => setShow(false), 2000);
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Store location in localStorage for all users
        localStorage.setItem('mediroute_user_lat', lat.toString());
        localStorage.setItem('mediroute_user_lng', lng.toString());

        // Save to DB if user is logged in
        if (user?.id) {
          await saveUserLocation(user.id, lat, lng).catch(() => {});
        }

        setStatus('granted');
        localStorage.setItem(STORAGE_KEY, 'granted');
        setGettingLocation(false);
        setTimeout(() => setShow(false), 2000);
      },
      () => {
        setStatus('denied');
        localStorage.setItem(STORAGE_KEY, 'denied');
        setGettingLocation(false);
        setTimeout(() => setShow(false), 2500);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  function handleDeny() {
    setStatus('denied');
    localStorage.setItem(STORAGE_KEY, 'denied');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className={`rounded-2xl shadow-2xl border p-4 ${
        status === 'granted'
          ? 'bg-green-50 border-green-300'
          : status === 'denied'
          ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-gray-200'
      }`}>
        {status === 'idle' && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <FaLocationPin className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Share your location?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                MediRoute uses your location to find nearby doctors and hospitals near you.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAllow}
                  disabled={gettingLocation}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:bg-gray-300 transition-colors"
                >
                  {gettingLocation ? 'Detecting...' : 'Allow'}
                </button>
                <button
                  onClick={handleDeny}
                  className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button onClick={handleDeny} className="text-gray-400 hover:text-gray-600 shrink-0" title="Dismiss">
              <FaXmark className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'granted' && (
          <div className="flex items-center gap-3">
            <FaCheck className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-800">Location saved! Finding nearby doctors...</span>
          </div>
        )}

        {status === 'denied' && (
          <div className="flex items-center gap-3">
            <FaLocationPin className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-800">Using default location (Peshawar). You can update this anytime.</span>
          </div>
        )}
      </div>
    </div>
  );
}
