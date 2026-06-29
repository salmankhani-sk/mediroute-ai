'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaHospital, FaLocationDot, FaPhone } from 'react-icons/fa6';
import { findNearestHospitals } from '@/app/actions/location';
import type { MapHospital } from '@/components/Map';

const MediRouteMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center"><div className="text-gray-400 animate-pulse">Loading map...</div></div>,
});

const DEPTS = ['CARDIOLOGY','PULMONOLOGY','NEUROLOGY','ORTHOPEDICS','GASTROENTEROLOGY','DERMATOLOGY','PEDIATRICS','GYNECOLOGY','UROLOGY','ENT','OPHTHALMOLOGY','PSYCHIATRY','ENDOCRINOLOGY','NEPHROLOGY','ONCOLOGY','GENERAL_MEDICINE','DENTAL','PHYSIOTHERAPY','RADIOLOGY','PATHOLOGY','EMERGENCY'];

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<MapHospital[]>([]);
  const [filtered, setFiltered] = useState<MapHospital[]>([]);
  const [userLoc, setUserLoc] = useState<{lat:number;lng:number}|null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    (async () => {
      let loc = { lat: 34.0151, lng: 71.5249 };
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch { /* fallback */ }
      }
      setUserLoc(loc);
      const data = await findNearestHospitals(loc.lat, loc.lng, 50);
      const mapped: MapHospital[] = data.map(h => ({
        id: h.id, name: h.name, latitude: h.latitude, longitude: h.longitude,
        address: h.address, distanceKm: h.distanceKm, departments: h.departments, phone: h.phone,
      }));
      setHospitals(mapped);
      setFiltered(mapped);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let f = hospitals;
    if (search) f = f.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) f = f.filter(h => h.departments?.includes(deptFilter));
    setFiltered(f);
  }, [search, deptFilter, hospitals]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2"><FaHospital className="inline w-7 h-7 mr-2 text-primary-600" />Hospitals in Peshawar</h1>
      <p className="text-gray-600 mb-8">Find the nearest hospital with the right department for your needs.</p>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"/><p className="text-gray-500">Loading hospitals...</p></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900"><FaLocationDot className="inline w-4 h-4 mr-1 text-red-500" />Hospital Map</h3>
                <p className="text-xs text-gray-500">{filtered.length} hospitals shown</p>
              </div>
              <MediRouteMap hospitals={filtered} userLocation={userLoc} height="550px" zoom={12} centerOnUser={true} />
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
