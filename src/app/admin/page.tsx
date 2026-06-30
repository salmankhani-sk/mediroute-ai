'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';
import {
  getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats,
  getAppointmentStatusPerDoctor, getRecentAppointments, getDoctorsWithPatientCounts,
  getUsersWithLocations, getLocationStats,
} from '@/app/actions/admin';
import {
  FaShieldHalved, FaClock, FaEnvelope, FaPhone, FaCheck, FaXmark,
  FaUserDoctor, FaUserInjured, FaHospital, FaCalendarCheck,
  FaCircle, FaChevronDown, FaChevronUp, FaSpinner, FaLocationPin, FaMapPin,
} from 'react-icons/fa6';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [doctorBreakdown, setDoctorBreakdown] = useState<any[]>([]);
  const [recentAppts, setRecentAppts] = useState<any[]>([]);
  const [doctorList, setDoctorList] = useState<any[]>([]);
  const [usersWithLocation, setUsersWithLocation] = useState<any[]>([]);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'ADMIN') loadData();
  }, [authLoading, user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, s, db, ra, dl, ul, ls] = await Promise.all([
      getPendingDoctors(), getAdminStats(), getAppointmentStatusPerDoctor(),
      getRecentAppointments(15), getDoctorsWithPatientCounts(),
      getUsersWithLocations(), getLocationStats(),
    ]);
    setPending(p); setStats(s); setDoctorBreakdown(db); setRecentAppts(ra); setDoctorList(dl);
    setUsersWithLocation(ul); setLocationStats(ls);
    setLoading(false);
  }, []);

  async function handleApprove(id: string) { await approveDoctor(id); loadData(); }
  async function handleReject(id: string) { await rejectDoctor(id); loadData(); }

  if (authLoading || loading) return (
    <div className="text-center py-20">
      <FaSpinner className="animate-spin w-10 h-10 text-primary-600 mx-auto" />
      <p className="text-gray-500 mt-3">Loading admin dashboard...</p>
    </div>
  );
  if (!user || user.role !== 'ADMIN') return null;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        <FaShieldHalved className="inline w-7 h-7 mr-2 text-primary-600" />Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">Platform overview, doctor management, and appointment analytics.</p>

      {/* ─── Overview Stats ─── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FaUserDoctor className="w-5 h-5" />} label="Approved Doctors" value={stats.totalDoctors} color="text-primary-600" />
          <StatCard icon={<FaUserInjured className="w-5 h-5" />} label="Patients" value={stats.totalPatients} color="text-blue-600" />
          <StatCard icon={<FaHospital className="w-5 h-5" />} label="Hospitals" value={stats.totalHospitals} color="text-green-600" />
          <StatCard icon={<FaCalendarCheck className="w-5 h-5" />} label="Total Appointments" value={stats.totalAppointments} color="text-purple-600" />
        </div>
      )}

      {/* ─── Appointment Status Breakdown ─── */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Appointment Status Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: stats.pendingAppts, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { label: 'Confirmed', value: stats.confirmedAppts, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Completed', value: stats.completedAppts, color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Cancelled / No-Show', value: stats.cancelledAppts, color: 'bg-red-50 border-red-200 text-red-700' },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-4 border ${item.color}`}>
                <div className="text-xs font-medium opacity-80">{item.label}</div>
                <div className="text-2xl font-bold mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Pending Doctor Approvals ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            <FaClock className="inline w-5 h-5 mr-2 text-yellow-600" />Pending Doctor Approvals
          </h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">{pending.length} pending</span>
        </div>
        {pending.length === 0 ? (
          <div className="p-12 text-center text-gray-400">✅ No pending approvals — all caught up!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map(doc => (
              <div key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.fullName}</h3>
                    <p className="text-sm text-gray-500">{doc.specialistType.replace(/_/g, ' ')} • {doc.qualification}</p>
                    <p className="text-xs text-gray-400">License: {doc.licenseNumber} • {doc.experienceYears} yrs exp • PKR {doc.consultationFee}</p>
                    <p className="text-xs text-gray-500 mt-1"><FaEnvelope className="inline w-3 h-3 mr-1" /> {doc.email} • <FaPhone className="inline w-3 h-3 mr-1" /> {doc.phone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleApprove(doc.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"><FaCheck className="inline w-3.5 h-3.5 mr-1" />Approve</button>
                    <button onClick={() => handleReject(doc.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"><FaXmark className="inline w-3.5 h-3.5 mr-1" />Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Patients per Doctor ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            <FaUserDoctor className="inline w-5 h-5 mr-2 text-primary-600" />Doctors & Patient Appointments
          </h2>
          <p className="text-sm text-gray-500 mt-1">How many patients each doctor has, broken down by status.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Specialty</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center"><FaCircle className="inline w-2 h-2 text-yellow-500 mr-1" />Pending</th>
                <th className="px-6 py-3 text-center"><FaCircle className="inline w-2 h-2 text-blue-500 mr-1" />Confirmed</th>
                <th className="px-6 py-3 text-center"><FaCircle className="inline w-2 h-2 text-green-500 mr-1" />Completed</th>
                <th className="px-6 py-3 text-center"><FaCircle className="inline w-2 h-2 text-red-500 mr-1" />Cancelled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctorBreakdown.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No appointment data yet.</td></tr>
              ) : (
                doctorBreakdown.map(d => (
                  <tr key={d.doctorId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{d.doctorName}</td>
                    <td className="px-6 py-3 text-gray-500">{d.specialty.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3 text-center font-bold text-gray-900">{d.totalPatients}</td>
                    <td className="px-6 py-3 text-center">{d.PENDING > 0 ? <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">{d.PENDING}</span> : '-'}</td>
                    <td className="px-6 py-3 text-center">{d.CONFIRMED > 0 ? <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{d.CONFIRMED}</span> : '-'}</td>
                    <td className="px-6 py-3 text-center">{d.COMPLETED > 0 ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">{d.COMPLETED}</span> : '-'}</td>
                    <td className="px-6 py-3 text-center">{d.CANCELLED > 0 ? <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">{d.CANCELLED}</span> : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Recent Appointments ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            <FaCalendarCheck className="inline w-5 h-5 mr-2 text-purple-600" />Recent Appointments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAppts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No recent appointments.</td></tr>
              ) : (
                recentAppts.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{a.patientName}</div>
                      <div className="text-xs text-gray-400">{a.patientEmail}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{a.doctorName}</td>
                    <td className="px-6 py-3 text-gray-600">{a.date}</td>
                    <td className="px-6 py-3 text-gray-600">{a.timeSlot}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{a.consultationType.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status] || 'bg-gray-100 text-gray-800'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Doctor Availability ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            <FaUserDoctor className="inline w-5 h-5 mr-2 text-primary-600" />All Doctors — Quick View
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Specialty</th>
                <th className="px-6 py-3 text-center">Total Appts</th>
                <th className="px-6 py-3 text-center">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctorList.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No approved doctors yet.</td></tr>
              ) : (
                doctorList.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-400">{d.email}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{d.specialty.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3 text-center font-semibold text-gray-900">{d.totalAppointments}</td>
                    <td className="px-6 py-3 text-center">
                      {d.isAvailable
                        ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Available</span>
                        : <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">Unavailable</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── User Locations ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            <FaMapPin className="inline w-5 h-5 mr-2 text-primary-600" />User Locations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {locationStats ? `${locationStats.withLocation} of ${locationStats.totalUsers} users have shared their location` : 'Loading...'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Coordinates</th>
                <th className="px-6 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersWithLocation.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users have shared location yet.</td></tr>
              ) : (
                usersWithLocation.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{u.fullName}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'DOCTOR' ? 'bg-primary-100 text-primary-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{u.phone || '—'}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <FaLocationPin className="w-3 h-3 text-green-500" />
                        {u.latitude?.toFixed(4)}, {u.longitude?.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400">
                      {new Date(u.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
