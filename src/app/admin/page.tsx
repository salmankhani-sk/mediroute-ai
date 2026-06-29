'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';
import { getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats } from '@/app/actions/admin';
import { FaShieldHalved, FaClock, FaEnvelope, FaPhone, FaCheck, FaXmark } from 'react-icons/fa6';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'ADMIN') loadData();
  }, [authLoading, user]);

  async function loadData() {
    const [p, s] = await Promise.all([getPendingDoctors(), getAdminStats()]);
    setPending(p); setStats(s); setLoading(false);
  }

  async function handleApprove(id: string) { await approveDoctor(id); loadData(); }
  async function handleReject(id: string) { await rejectDoctor(id); loadData(); }

  if (authLoading || loading) return <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"/></div>;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2"><FaShieldHalved className="inline w-7 h-7 mr-2 text-primary-600" />Admin Panel</h1>
      <p className="text-gray-600 mb-8">Manage doctors, hospitals, and view platform analytics.</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Doctors" value={stats.totalDoctors} />
          <StatCard label="Total Patients" value={stats.totalPatients} />
          <StatCard label="Total Hospitals" value={stats.totalHospitals} />
          <StatCard label="Appointments" value={stats.totalAppointments} />
        </div>
      )}

      {/* Pending Doctor Approvals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900"><FaClock className="inline w-5 h-5 mr-2 text-yellow-600" />Pending Doctor Approvals</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">{pending.length} pending</span>
        </div>
        {pending.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No pending approvals.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map(doc => (
              <div key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.fullName}</h3>
                    <p className="text-sm text-gray-500">{doc.specialistType.replace(/_/g,' ')} • {doc.qualification}</p>
                    <p className="text-xs text-gray-400">License: {doc.licenseNumber} • {doc.experienceYears} yrs exp • PKR {doc.consultationFee}</p>
                    <p className="text-xs text-gray-500 mt-1"><FaEnvelope className="inline w-3 h-3 mr-1" /> {doc.email} • <FaPhone className="inline w-3 h-3 mr-1" /> {doc.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(doc.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"><FaCheck className="inline w-3.5 h-3.5 mr-1" />Approve</button>
                    <button onClick={() => handleReject(doc.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200"><FaXmark className="inline w-3.5 h-3.5 mr-1" />Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string|number }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
