'use client';

import { useState, useCallback } from 'react';

interface GeoLocation {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

const DEFAULT_LOCATION: GeoLocation = { lat: 34.0151, lng: 71.5249 }; // Peshawar

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track if we already got real GPS (not default fallback)
  const [gotRealLocation, setGotRealLocation] = useState(false);

  const requestLocation = useCallback(() => {
    // Don't re-request if we already have real GPS location
    if (gotRealLocation) return;

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using default.');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    // Clear any previous denial from localStorage so browser can re-prompt
    localStorage.removeItem('mediroute_location_prompted');

    // Try directly — browser will show its own permission prompt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(loc);
        setGotRealLocation(true);
        setError(null);
        setLoading(false);

        // Store in localStorage for other components
        localStorage.setItem('mediroute_user_lat', loc.lat.toString());
        localStorage.setItem('mediroute_user_lng', loc.lng.toString());
        localStorage.setItem('mediroute_location_prompted', 'granted');
      },
      (err) => {
        console.warn('Geolocation error:', err.code, err.message);
        let msg = 'Could not get your location. Using default (Peshawar).';
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            msg = 'Location permission denied. Check browser settings to enable.';
            break;
          case 2: // POSITION_UNAVAILABLE
            msg = 'Location unavailable. Using default (Peshawar).';
            break;
          case 3: // TIMEOUT
            msg = 'Location request timed out. Using default (Peshawar).';
            break;
        }
        setError(msg);
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0, // Always get fresh location
      },
    );
  }, [gotRealLocation]);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
    setGotRealLocation(true);
    setError(null);
  }, []);

  return { location, loading, error, requestLocation, setManualLocation };
}
