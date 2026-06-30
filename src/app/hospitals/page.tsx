'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaHospital, FaLocationPin, FaPhone, FaTriangleExclamation } from 'react-icons/fa6';
import { findNearestHospitals } from '@/app/actions/location';
import type { MapHospital } from '@/components/Map';

const MediRouteMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center"><div className="text-gray-400 animate-pulse">Loading map...</div></div>,
});

const DEPTS = ['CARDIOLOGY','PULMONOLOGY','NEUROLOGY','ORTHOPEDICS','GASTROENTEROLOGY','DERMATOLOGY','PEDIATRICS','GYNECOLOGY','UROLOGY','ENT','OPHTHALMOLOGY','PSYCHIATRY','ENDOCRINOLOGY','NEPHROLOGY','ONCOLOGY','GENERAL_MEDICINE','DENTAL','PHYSIOTHERAPY','RADIOLOGY','PATHOLOGY','EMERGENCY'];

const DEFAULT_LOC = { lat: 34.0151, lng: 71.5249 };

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<MapHospital[]>([]);
  const [filtered, setFiltered] = useState<MapHospital[]>([]);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Load hospitals based on location
  useEffect(() => {
    (async () => {
      const loc = userLoc || DEFAULT_LOC;
      const data = await findNearestHospitals(loc.lat, loc.lng, 50);
      const mapped: MapHospital[] = data.map(h => ({
        id: h.id, name: h.name, latitude: h.latitude, longitude: h.longitude,
        address: h.address, distanceKm: h.distanceKm, departments: h.departments, phone: h.phone,
      }));
      setHospitals(mapped);
      setFiltered(mapped);
      setLoading(false);
    })();
  }, [userLoc]);

  useEffect(() => {
    let f = hospitals;
    if (search) f = f.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) f = f.filter(h => h.departments?.includes(deptFilter));
    setFiltered(f);
  }, [search, deptFilter, hospitals]);

  // Simple, direct geolocation — no hook complexity
  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.');
      setUserLoc(DEFAULT_LOC);
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log('✅ Got real GPS location:', loc);
        setUserLoc(loc);
        setGeoLoading(false);
        setGeoError('');
      },
      (err) => {
        console.warn('❌ Geolocation error:', err.code, err.message);
        if (err.code === 1) {
          setGeoError('Permission denied. Please allow location in browser settings.');
        } else if (err.code === 2) {
          setGeoError('Location unavailable. Using default.');
        } else if (err.code === 3) {
          setGeoError('Request timed out. Using default.');
        } else {
          setGeoError('Could not get location. Using default.');
        }
        setUserLoc(DEFAULT_LOC);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2"><FaHospital className="inline w-7 h-7 mr-2 text-primary-600" />Hospitals in Peshawar</h1>
      <p className="text-gray-600 mb-4">Find the nearest hospital with the right department for your needs.</p>

      {/* Location Status + Button */}
      <div className="flex items-center gap-3 mb-6 text-sm">
        {userLoc && !geoError && userLoc.lat !== DEFAULT_LOC.lat ? (
          <span className="text-green-600 flex items-center gap-1 font-medium">
            <FaLocationPin className="w-4 h-4" /> Using your real location ({userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)})
          </span>
        ) : (
          <button type="button" onClick={handleGetLocation} disabled={geoLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors text-sm">
            <FaLocationPin className="w-4 h-4" />
            {geoLoading ? 'Detecting GPS...' : '📍 Use My Location'}
          </button>
        )}
        {geoError && (
          <span className="text-amber-600 flex items-center gap-1 text-xs">
            <FaTriangleExclamation className="w-3 h-3" /> {geoError}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"/><p className="text-gray-500">Loading hospitals...</p></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900"><FaLocationPin className="inline w-4 h-4 mr-1 text-red-500" />Hospital Map</h3>
                <p className="text-xs text-gray-500">{filtered.length} hospitals shown</p>
              </div>
              <MediRouteMap hospitals={filtered} userLocation={userLoc && userLoc.lat !== DEFAULT_LOC.lat ? userLoc : null} height="550px" zoom={12} centerOnUser={true} />
            </div>
          </div>

          {/* Right: Filters + List */}
          <div className="space-y-4">
            {/* Search */}
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search hospitals..." className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />

            {/* Department Filter */}
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">All Departments</option>
              {DEPTS.map(d => <option key={d} value={d}>{d.replace(/_/g,' ')}</option>)}
            </select>

            {/* Hospital Cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(h => (
                <div key={h.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all">
                  <h3 className="font-semibold text-gray-900 text-sm">{h.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{h.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{h.distanceKm.toFixed(1)} km</span>
                    {h.phone && <span className="text-xs text-gray-500"><FaPhone className="inline w-3 h-3 mr-1" />{h.phone}</span>}
                  </div>
                  {h.departments && h.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.departments.slice(0,5).map(d => <span key={d} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{d.replace(/_/g,' ')}</span>)}
                      {h.departments.length > 5 && <span className="text-[10px] text-gray-400">+{h.departments.length-5} more</span>}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No hospitals match your filters.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
