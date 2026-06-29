'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/ClientLayout';
import { getPatientAppointments, cancelAppointment } from '@/app/actions/appointments';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading) loadData(); }, [authLoading]);

  async function loadData() {
    if (!user) { setLoading(false); return; }
    const data = await getPatientAppointments();
    setApps(data); setLoading(false);
  }

  async function handleCancel(id: string) { await cancelAppointment(id); loadData(); }

  if (authLoading || loading) return <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"/></div>;

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Login to View</h2>
        <p className="text-gray-500 mb-6">Sign in to see your booked appointments.</p>
        <Link href="/login" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700">Login</Link>
      </div>
    </div>
  );

  const sc: Record<string,string> = { PENDING:'bg-yellow-100 text-yellow-800', CONFIRMED:'bg-green-100 text-green-800', CANCELLED:'bg-red-100 text-red-800', COMPLETED:'bg-blue-100 text-blue-800' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
      <p className="text-gray-600 mb-8">Track your appointments with specialists.</p>
      {apps.length===0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-400">No appointments yet. <Link href="/symptoms" className="text-primary-600 hover:underline">Book one now.</Link></p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{a.doctorName}</h3>
                <p className="text-sm text-gray-500">{a.doctorSpecialty?.replace(/_/g,' ')} • {a.hospitalName}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(a.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} • {a.timeSlot}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc[a.status]}`}>{a.status}</span>
                {(a.status==='PENDING'||a.status==='CONFIRMED') && <button onClick={()=>handleCancel(a.id)} className="text-xs text-red-600 hover:underline">Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
