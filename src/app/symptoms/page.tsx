'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { analyzeSymptoms } from '@/app/actions/ai';
import { findNearestHospitals, findDoctorsBySpecialist, getAllDoctorsBySpecialty, saveUserLocation, getPatientSymptomHistory } from '@/app/actions/location';
import { bookAppointment } from '@/app/actions/appointments';
import { useAuth } from '@/components/ClientLayout';
import type { SymptomAnalysis } from '@/lib/ai-types';
import type { MapHospital } from '@/components/Map';
import {
  FaSearch, FaCheckCircle, FaExclamationCircle, FaHistory,
} from 'react-icons/fa';
import {
  FaUserDoctor, FaHospital, FaCalendarDays, FaXmark, FaTriangleExclamation, FaCircle, FaStarOfLife,
  FaLocationPin, FaMagnifyingGlass, FaChevronDown, FaChevronUp,
} from 'react-icons/fa6';
import { useGeolocation } from '@/lib/useGeolocation';

const MediRouteMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading map...</div>
    </div>
  ),
});

type AnalysisResult = SymptomAnalysis & { timestamp: number };

interface DoctorResult {
  id: string; userId: string; fullName: string; email: string;
  phone: string | null; specialistType: string; department: string;
  qualification: string; experienceYears: number; consultationFee: number;
  bio: string | null; hospitalName: string; hospitalAddress: string | null;
  hospitalLat: number | null; hospitalLng: number | null; distanceKm: number | null;
}

interface HistoryItem {
  id: string; symptoms: string; suspectedCondition: string | null;
  department: string | null; urgencyLevel: string | null;
  recommendedSpecialist: string | null; createdAt: string;
}

export default function SymptomsPage() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [hospitals, setHospitals] = useState<MapHospital[]>([]);
  const [doctors, setDoctors] = useState<DoctorResult[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorResult[]>([]);
  const [bookingDoctor, setBookingDoctor] = useState<DoctorResult | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  const { location: userLocation, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // Load symptom history on mount
  useEffect(() => {
    if (user?.id) {
      getPatientSymptomHistory(user.id, 10).then(setHistory).catch(() => {});
    }
  }, [user?.id]);

  const handleUseHistoryItem = (item: HistoryItem) => {
    setSymptoms(item.symptoms);
    setShowHistory(false);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true); setError(''); setResult(null); setDoctors([]); setAllDoctors([]); setHospitals([]); setShowAllDoctors(false);

    try {
      const aiResponse = await analyzeSymptoms(symptoms.trim());
      if (!aiResponse.success) { setError(aiResponse.error); return; }
      const analysisResult: AnalysisResult = { ...aiResponse.data, timestamp: Date.now() };
      setResult(analysisResult);

      // Use geolocation or default
      const loc = userLocation || { lat: 34.0151, lng: 71.5249 };

      // Save user location to DB
      if (user?.id) {
        saveUserLocation(user.id, loc.lat, loc.lng).catch(() => {});
      }

      const [nearby, matchingDoctors, allSpecialtyDoctors] = await Promise.all([
        findNearestHospitals(loc.lat, loc.lng, 10),
        findDoctorsBySpecialist(aiResponse.data.recommendedSpecialist, loc.lat, loc.lng, 15),
        getAllDoctorsBySpecialty(aiResponse.data.recommendedSpecialist, loc.lat, loc.lng),
      ]);

      setHospitals(nearby.map(h => ({ id: h.id, name: h.name, latitude: h.latitude, longitude: h.longitude, address: h.address, distanceKm: h.distanceKm, departments: h.departments, phone: h.phone })));
      setDoctors(matchingDoctors);
      setAllDoctors(allSpecialtyDoctors);

      // Refresh history
      if (user?.id) {
        getPatientSymptomHistory(user.id, 10).then(setHistory).catch(() => {});
      }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }, [symptoms, user?.id, getLocation]);

  const handleBook = useCallback(async () => {
    if (!bookingDoctor || !bookingDate || !bookingTime) return;
    setBookingLoading(true); setBookingMsg('');
    const res = await bookAppointment({
      doctorProfileId: bookingDoctor.id,
      date: bookingDate, timeSlot: bookingTime, symptoms,
      urgencyLevel: result?.urgencyLevel,
    });
    if (res.success) { setBookingMsg('✅ Appointment booked! The doctor will confirm shortly.'); setBookingDoctor(null); setBookingDate(''); setBookingTime(''); }
    else setBookingMsg(res.error || 'Booking failed.');
    setBookingLoading(false);
  }, [bookingDoctor, bookingDate, bookingTime, symptoms, result]);

  const timeSlots = ['09:00-09:30','09:30-10:00','10:00-10:30','10:30-11:00','11:00-11:30','11:30-12:00','12:00-12:30','12:30-13:00','14:00-14:30','14:30-15:00','15:00-15:30','15:30-16:00','16:00-16:30','16:30-17:00'];
  const next7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]; });

  const doctorsToShow = showAllDoctors ? allDoctors : doctors;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker &amp; Doctor Finder</h1>
      <p className="text-gray-600 mb-8">Describe your symptoms — our AI finds the right specialist and nearby doctors you can book instantly.</p>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Symptom Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Describe your symptoms</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="e.g., I have had severe tooth pain since last week..." disabled={loading} />
              <button type="submit" disabled={loading || !symptoms.trim()}
                className="mt-4 w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>AI Analyzing...</span> : <span><FaSearch className="inline w-4 h-4 mr-1" />Analyze & Find Doctors</span>}
              </button>
            </form>

            {/* Location Status */}
            <div className="mt-3 flex items-center justify-between text-xs">
              {userLocation ? (
                <span className="text-green-600 flex items-center gap-1">
                  <FaLocationPin className="w-3 h-3" /> Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              ) : geoError ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <FaExclamationCircle className="w-3 h-3" /> {geoError}
                </span>
              ) : (
                <span className="text-gray-400">Using default location (Peshawar)</span>
              )}
              {!userLocation && (
                <button type="button" onClick={requestLocation} disabled={geoLoading}
                  className="text-primary-600 hover:text-primary-800 font-medium disabled:text-gray-400 flex items-center gap-1">
                  <FaLocationPin className="w-3 h-3" />
                  {geoLoading ? 'Getting location...' : 'Use My Location'}
                </button>
              )}
            </div>

            {/* Symptom History Toggle */}
            {history.length > 0 && (
              <button onClick={() => setShowHistory(!showHistory)}
                className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                <FaHistory className="w-3.5 h-3.5" />
                {showHistory ? 'Hide' : 'Show'} previous searches ({history.length})
                {showHistory ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>
            )}
            {showHistory && (
              <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
                {history.map(item => (
                  <button key={item.id} onClick={() => handleUseHistoryItem(item)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 border border-gray-100 transition-colors">
                    <span className="font-medium text-gray-800">{item.symptoms.substring(0, 80)}...</span>
                    {item.recommendedSpecialist && (
                      <span className="ml-2 text-primary-600">{item.recommendedSpecialist.replace(/_/g, ' ')}</span>
                    )}
                    <span className="ml-2 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

          {/* AI Result */}
          {result && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg></div><h2 className="text-lg font-bold text-gray-900">AI Analysis</h2></div>
              <UrgencyBadge level={result.urgencyLevel} />
              <div className="space-y-3 pt-2">
                <div><span className="text-xs font-medium text-gray-500 uppercase">Suspected Condition</span><p className="text-gray-900 font-medium">{result.suspectedCondition}</p></div>
                <div className="grid grid-cols-2 gap-4"><div><span className="text-xs font-medium text-gray-500 uppercase">Department</span><p className="text-gray-900 font-medium">{result.department.replace(/_/g,' ')}</p></div><div><span className="text-xs font-medium text-gray-500 uppercase">Specialist</span><p className="text-gray-900 font-medium">{result.recommendedSpecialist.replace(/_/g,' ')}</p></div></div>
                <div><span className="text-xs font-medium text-gray-500 uppercase">AI Reasoning</span><p className="text-gray-600 text-sm">{result.reasoning}</p></div>
                <div><span className="text-xs font-medium text-gray-500 uppercase">Recommended Actions</span><ul className="list-disc list-inside text-gray-600 text-sm space-y-1">{result.recommendedActions.map((a,i)=><li key={i}>{a}</li>)}</ul></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800"><FaStarOfLife className="inline w-3 h-3 mr-1" />{result.disclaimer}</div>
            </div>
          )}

          {/* Doctor List */}
          {doctorsToShow.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  <FaUserDoctor className="inline w-5 h-5 mr-2 text-primary-600" />
                  Available {result?.recommendedSpecialist.replace(/_/g,' ')}s
                  <span className="ml-2 text-green-600"><FaCheckCircle className="inline w-5 h-5" /></span>
                </h3>
                <span className="text-xs text-gray-500">{doctorsToShow.length} found</span>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {doctorsToShow.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          {doc.fullName}
                          <FaCheckCircle className="w-4 h-4 text-green-500" title="Doctor available" />
                        </h4>
                        <p className="text-xs text-gray-500">{doc.qualification}</p>
                      </div>
                      {doc.distanceKm !== null && <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"><FaLocationPin className="w-3 h-3" />{doc.distanceKm.toFixed(1)} km</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">{doc.experienceYears} yrs exp</span><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">PKR {doc.consultationFee}</span></div>
                    <p className="text-xs text-gray-500 mt-2"><FaHospital className="inline w-3.5 h-3.5 mr-1 text-gray-400" />{doc.hospitalName}{doc.hospitalAddress && ` — ${doc.hospitalAddress}`}</p>
                    <button onClick={() => setBookingDoctor(doc)} className="mt-3 w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"><FaCalendarDays className="inline w-3.5 h-3.5 mr-1" />Book Appointment</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show All Doctors button when there are more */}
          {doctors.length > 0 && allDoctors.length > doctors.length && (
            <button onClick={() => setShowAllDoctors(!showAllDoctors)}
              className="w-full bg-primary-50 text-primary-700 py-3 rounded-xl font-semibold hover:bg-primary-100 transition-colors text-sm border border-primary-200">
              <FaMagnifyingGlass className="inline w-4 h-4 mr-1" />
              {showAllDoctors ? 'Show Nearest Only' : `View All ${allDoctors.length} ${result?.recommendedSpecialist.replace(/_/g,' ')}s`}
            </button>
          )}

          {result && doctorsToShow.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <FaExclamationCircle className="inline w-4 h-4 mr-1" />
              No {result.recommendedSpecialist.replace(/_/g,' ')}s are currently available in our system. Check the map for nearby hospitals, or browse other specialists.
            </div>
          )}
        </div>

        {/* RIGHT: Map + Booking */}
        <div className="lg:col-span-3 space-y-6">
          {/* Booking Panel */}
          {bookingDoctor && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary-300">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900 text-lg"><FaCalendarDays className="inline w-5 h-5 mr-2 text-primary-600" />Book Appointment</h3><button onClick={() => setBookingDoctor(null)} title="Close" className="text-gray-400 hover:text-gray-600 text-xl"><FaXmark /></button></div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg"><p className="font-semibold text-gray-900">{bookingDoctor.fullName}</p><p className="text-sm text-gray-500">{bookingDoctor.specialistType.replace(/_/g,' ')} • {bookingDoctor.hospitalName}</p><p className="text-sm text-gray-500">Fee: PKR {bookingDoctor.consultationFee}</p></div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
              <div className="flex flex-wrap gap-2 mb-4">{next7Days.map(day => <button key={day} onClick={() => setBookingDate(day)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${bookingDate===day?'bg-primary-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{new Date(day).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</button>)}</div>
              {bookingDate && (<><label className="block text-sm font-semibold text-gray-700 mb-2">Select Time</label><div className="flex flex-wrap gap-2 mb-4 max-h-[150px] overflow-y-auto">{timeSlots.map(slot => <button key={slot} onClick={() => setBookingTime(slot)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${bookingTime===slot?'bg-primary-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{slot}</button>)}</div></>)}
              {bookingMsg && <div className={`p-3 rounded-lg text-sm mb-4 ${bookingMsg.startsWith('✅')?'bg-green-50 text-green-800':'bg-red-50 text-red-800'}`}>{bookingMsg}</div>}
              <button onClick={handleBook} disabled={!bookingDate||!bookingTime||bookingLoading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">{bookingLoading?'Booking...':`Confirm Booking — PKR ${bookingDoctor.consultationFee}`}</button>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900"><FaHospital className="inline w-4 h-4 mr-2 text-primary-600" />Nearby Hospitals &amp; Doctors in Peshawar</h3><p className="text-xs text-gray-500 mt-1">{hospitals.length>0?`${hospitals.length} hospitals • ${doctorsToShow.length} doctors found`:'Analyze symptoms to find nearby healthcare'}</p></div>
            {(userLocation||hospitals.length>0) ? <MediRouteMap hospitals={hospitals} userLocation={userLocation} height="600px" zoom={12} /> : <div className="h-[600px] bg-gray-100 flex items-center justify-center"><div className="text-center text-gray-400"><svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg><p className="text-sm">Enter your symptoms above to find healthcare near you</p></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function UrgencyBadge({ level }: { level: string }) {
  const s: Record<string,string> = { LOW:'bg-green-100 text-green-800 border-green-200', MEDIUM:'bg-yellow-100 text-yellow-800 border-yellow-200', HIGH:'bg-orange-100 text-orange-800 border-orange-200', EMERGENCY:'bg-red-100 text-red-800 border-red-200 animate-pulse' };
  const colors: Record<string,string> = { LOW:'text-green-600', MEDIUM:'text-yellow-600', HIGH:'text-orange-600', EMERGENCY:'text-red-600' };
  return <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${s[level]||s.LOW}`}><FaCircle className={`w-2.5 h-2.5 ${colors[level]||'text-gray-400'}`} /> {level==='EMERGENCY'?<span><FaTriangleExclamation className="inline w-3.5 h-3.5 mr-1" />EMERGENCY</span>:`${level} Urgency`}</div>;
}
