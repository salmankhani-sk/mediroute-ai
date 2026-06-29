'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDoctorAppointments, updateAppointmentStatus, toggleDoctorAvailability, getDoctorStats } from '@/app/actions/appointments';
import { useAuth } from '@/components/ClientLayout';
import { FaUserDoctor, FaCalendarDays, FaCheck, FaXmark, FaCircleCheck, FaCircle, FaCircleXmark } from 'react-icons/fa6';

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'DOCTOR')) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'DOCTOR') loadData();
  }, [authLoading, user]);

  async function loadData() {
    const [apps, s] = await Promise.all([getDoctorAppointments(), getDoctorStats()]);
    setAppointments(apps);
    setStats(s);
    setLoading(false);
  }

  async function handleStatus(id: string, status: string) {
    await updateAppointmentStatus(id, status);
    loadData();
  }

  async function handleToggle() {
    const r = await toggleDoctorAvailability();
    if (r.success) setAvailable(r.isAvailable);
  }

  if (authLoading || loading) return <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"/></div>;
  if (!user || user.role !== 'DOCTOR') return null;

  const statusColors: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800', COMPLETED: 'bg-blue-100 text-blue-800' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"><FaUserDoctor className="inline w-8 h-8 mr-2 text-primary-600" />Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.fullName}</p>
        </div>
        <button onClick={handleToggle} className={`px-6 py-3 rounded-xl font-semibold transition-colors ${available ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
          {available ? <><FaCircleCheck className="inline w-5 h-5 mr-1 text-green-600" /> Available</> : <><FaCircleXmark className="inline w-5 h-5 mr-1 text-red-600" /> Offline</>}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Appts" value={stats.total} />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="Confirmed" value={stats.confirmed} color="green" />
          <StatCard label="Earnings" value={`PKR ${stats.totalEarnings}`} color="purple" />
        </div>
      )}

      {/* Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900"><FaCalendarDays className="inline w-5 h-5 mr-2 text-primary-600" />Your Appointments</h2>
        </div>
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No appointments yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map(app => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.patientName}</h3>
                    <p className="text-sm text-gray-500">{new Date(app.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })} • {app.timeSlot}</p>
                    {app.symptoms && <p className="text-xs text-gray-400 mt-1">Symptoms: {app.symptoms}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>{app.status}</span>
                </div>
                {app.status === 'PENDING' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleStatus(app.id, 'CONFIRMED')} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"><FaCheck className="inline w-3 h-3 mr-1" />Confirm</button>
                    <button onClick={() => handleStatus(app.id, 'CANCELLED')} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200"><FaXmark className="inline w-3 h-3 mr-1" />Cancel</button>
                  </div>
                )}
                {app.status === 'CONFIRMED' && (
                  <button onClick={() => handleStatus(app.id, 'COMPLETED')} className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"><FaCircleCheck className="inline w-3 h-3 mr-1" />Mark Completed</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string|number; color?: string }) {
  const c = color === 'green' ? 'text-green-600' : color === 'purple' ? 'text-purple-600' : 'text-gray-900';
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${c}`}>{value}</div>
    </div>
  );
}
