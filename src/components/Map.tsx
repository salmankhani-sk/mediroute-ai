'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { FaLocationPin, FaPhone } from 'react-icons/fa6';
import type { HospitalWithDistance } from '@/lib/ai-types';

// ─── Fix Leaflet Default Icon Issue ─────────────────────────
// Leaflet's default marker icons break in bundlers; fix globally
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Custom marker colors by urgency ────────────────────────
const emergencyIcon = L.icon({
  ...defaultIcon.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
});

const userLocationIcon = L.icon({
  ...defaultIcon.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
});

// ─── Types ──────────────────────────────────────────────────
export interface MapHospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceKm: number;
  departments?: string[];
  phone?: string | null;
}

interface MapProps {
  hospitals: MapHospital[];
  userLocation?: { lat: number; lng: number } | null;
  centerOnUser?: boolean;
  selectedHospitalId?: string | null;
  height?: string;
  zoom?: number;
}

// ─── FlyToSelected ──────────────────────────────────────────
function FlyToSelected({
  hospitals,
  selectedId,
  userLocation,
}: {
  hospitals: MapHospital[];
  selectedId: string | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const hospital = hospitals.find((h) => h.id === selectedId);
      if (hospital) {
        map.flyTo([hospital.latitude, hospital.longitude], 15, { duration: 1.5 });
      }
    }
  }, [selectedId, hospitals, map]);

  return null;
}

// ─── Map Component ──────────────────────────────────────────
export default function MediRouteMap({
  hospitals,
  userLocation,
  centerOnUser = true,
  selectedHospitalId = null,
  height = '500px',
  zoom = 13,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine center: user location first, then first hospital, then Peshawar center
  const center = centerOnUser && userLocation
    ? [userLocation.lat, userLocation.lng] as [number, number]
    : hospitals.length > 0
      ? [hospitals[0].latitude, hospitals[0].longitude] as [number, number]
      : [34.0151, 71.5249] as [number, number]; // Peshawar center fallback

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full bg-gray-100 rounded-xl flex items-center justify-center"
      >
        <div className="text-gray-400 animate-pulse">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className="rounded-xl z-0"
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap Tiles (Free, no API key needed!) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Location Marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="text-sm font-semibold text-blue-700">
              <FaLocationPin className="inline w-4 h-4 mr-1 text-blue-600" />Your Location
            </div>
          </Popup>
        </Marker>
      )}

      {/* Hospital Markers */}
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          position={[hospital.latitude, hospital.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-bold text-base text-gray-900">{hospital.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{hospital.address}</p>

              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {hospital.distanceKm.toFixed(1)} km away
                </span>
              </div>

              {hospital.departments && hospital.departments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hospital.departments.slice(0, 4).map((dept) => (
                    <span key={dept}
                      className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                    >
                      {dept.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {hospital.departments.length > 4 && (
                    <span className="text-xs text-gray-400">
                      +{hospital.departments.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {hospital.phone && (
                <p className="text-xs text-gray-500 mt-2">
                  <FaPhone className="inline w-3 h-3 mr-1" />{hospital.phone}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Fly to selected hospital */}
      <FlyToSelected
        hospitals={hospitals}
        selectedId={selectedHospitalId}
        userLocation={userLocation}
      />
    </MapContainer>
  );
}
