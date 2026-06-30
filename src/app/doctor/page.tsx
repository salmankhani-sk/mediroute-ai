'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDoctorAppointments, updateAppointmentStatus, toggleDoctorAvailability, getDoctorStats } from '@/app/actions/appointments';
import { getDoctorAvailabilities, saveDoctorAvailability, deleteDoctorAvailability, getDoctorAppointmentsForDate } from '@/app/actions/doctor';
import { useAuth } from '@/components/ClientLayout';
import {
  FaUserDoctor, FaCalendarDays, FaCheck, FaXmark, FaCircleCheck, FaCircle, FaCircleXmark,
  FaChevronLeft, FaChevronRight, FaClock, FaTrashCan, FaPlus,
} from 'react-icons/fa6';

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // General
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAvail, setSelectedAvail] = useState<any>(null);
  const [dayAppointments, setDayAppointments] = useState<any[]>([]);

  // Edit form
  const [editStart, setEditStart] = useState('09:00');
  const [editEnd, setEditEnd] = useState('17:00');
  const [editAvailable, setEditAvailable] = useState(true);
  const [savingAvail, setSavingAvail] = useState(false);
  const [availMsg, setAvailMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'DOCTOR')) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'DOCTOR') loadData();
  }, [authLoading, user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [apps, s] = await Promise.all([getDoctorAppointments(), getDoctorStats()]);
    setAppointments(apps);
    setStats(s);
    setLoading(false);
  }, []);

  const loadCalendar = useCallback(async (month: Date) => {
    const monthStr = month.toISOString().slice(0, 7);
    const avails = await getDoctorAvailabilities(monthStr);
    setAvailabilities(avails);
  }, []);

  useEffect(() => { loadCalendar(currentMonth); }, [currentMonth, loadCalendar]);

  const handleSelectDate = useCallback(async (dateStr: string) => {
    setSelectedDate(dateStr);
    const avail = availabilities.find(a => a.date.slice(0, 10) === dateStr);
    if (avail) {
      setSelectedAvail(avail);
      setEditStart(avail.startTime);
      setEditEnd(avail.endTime);
      setEditAvailable(avail.isAvailable);
    } else {
      setSelectedAvail(null);
      setEditStart('09:00');
      setEditEnd('17:00');
      setEditAvailable(true);
    }
    const dayApps = await getDoctorAppointmentsForDate(dateStr);
    setDayAppointments(dayApps);
  }, [availabilities]);

  async function handleStatus(id: string, status: string) {
    await updateAppointmentStatus(id, status);
    loadData();
  }

  async function handleToggle() {
    const r = await toggleDoctorAvailability();
    if (r.success) setAvailable(r.isAvailable);
  }

  async function handleSaveAvailability() {
    if (!selectedDate) return;
    setSavingAvail(true); setAvailMsg('');
    const res = await saveDoctorAvailability(selectedDate, editStart, editEnd, editAvailable);
    setAvailMsg(res.success ? '✅ Availability saved!' : 'Failed to save.');
    setSavingAvail(false);
    if (res.success) loadCalendar(currentMonth);
  }

  async function handleDeleteAvailability() {
    if (!selectedDate) return;
    const res = await deleteDoctorAvailability(selectedDate);
    if (res.success) {
      setSelectedAvail(null);
      setAvailMsg('🗑️ Availability removed.');
      loadCalendar(currentMonth);
    }
  }

  // ─── Calendar helpers ───
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const availMap = new Map(availabilities.map(a => [a.date.slice(0, 10), a]));

  if (authLoading || loading) return <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"/></div>;
  if (!user || user.role !== 'DOCTOR') return null;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800', COMPLETED: 'bg-blue-100 text-blue-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900"><FaUserDoctor className="inline w-8 h-8 mr-2 text-primary-600" />Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.fullName}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/doctor/schedule"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
            <FaClock className="inline w-4 h-4 mr-1" /> Weekly Schedule
          </Link>
          <button onClick={handleToggle} className={`px-6 py-3 rounded-xl font-semibold transition-colors ${available ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
            {available ? <><FaCircleCheck className="inline w-5 h-5 mr-1" /> Available</> : <><FaCircleXmark className="inline w-5 h-5 mr-1" /> Offline</>}
          </button>
        </div>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ─── Calendar ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                <FaCalendarDays className="inline w-5 h-5 mr-2 text-primary-600" />
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} title="Previous month" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><FaChevronLeft /></button>
                <button onClick={nextMonth} title="Next month" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><FaChevronRight /></button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const avail = availMap.get(dateStr);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;

                let bg = 'hover:bg-gray-100';
                if (isSelected) bg = 'bg-primary-600 text-white';
                else if (avail?.isAvailable) bg = 'bg-green-50 border border-green-300';
                else if (avail && !avail.isAvailable) bg = 'bg-red-50 border border-red-200';

                return (
                  <button key={day}
                    onClick={() => handleSelectDate(dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${bg}`}>
                    <span className={`font-medium ${isToday && !isSelected ? 'text-primary-600 font-bold' : ''}`}>{day}</span>
                    {avail?.isAvailable && !isSelected && (
                      <FaCircleCheck className="w-2.5 h-2.5 text-green-500 mt-0.5" />
                    )}
                    {avail && !avail.isAvailable && !isSelected && (
                      <FaXmark className="w-2.5 h-2.5 text-red-400 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-50 border border-green-300" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Unavailable</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-600" /> Selected</span>
            </div>
          </div>
        </div>

        {/* ─── Right Panel: Edit Availability + Appointments ─── */}
        <div className="space-y-6">
          {/* Selected Date Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a date'}
            </h3>

            {!selectedDate ? (
              <p className="text-sm text-gray-400">Click a date on the calendar to set your availability.</p>
            ) : (
              <div className="space-y-4">
                {/* Availability toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editAvailable}
                    onChange={e => setEditAvailable(e.target.checked)}
                    className="w-5 h-5 rounded text-green-600 focus:ring-green-500" />
                  <span className="text-sm font-medium text-gray-700">Available on this date</span>
                </label>

                {editAvailable && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                      <input type="time" value={editStart} onChange={e => setEditStart(e.target.value)} title="Start time"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                      <input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} title="End time"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                )}

                {availMsg && (
                  <div className={`text-sm p-2 rounded-lg ${availMsg.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {availMsg}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveAvailability} disabled={savingAvail}
                    className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-700 disabled:bg-gray-300 transition-colors">
                    {savingAvail ? 'Saving...' : <><FaPlus className="inline w-3.5 h-3.5 mr-1" />Save Availability</>}
                  </button>
                  {selectedAvail && (
                    <button onClick={handleDeleteAvailability}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Remove">
                      <FaTrashCan className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Appointments for selected date */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">
                  <FaCalendarDays className="inline w-4 h-4 mr-2 text-primary-600" />
                  Appointments ({dayAppointments.length})
                </h3>
              </div>
              {dayAppointments.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No appointments on this date.</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                  {dayAppointments.map(app => (
                    <div key={app.id} className="p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{app.patient.fullName}</p>
                          <p className="text-xs text-gray-500">{app.timeSlot}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => { handleStatus(app.id, 'CONFIRMED'); handleSelectDate(selectedDate); }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"><FaCheck className="inline w-3 h-3 mr-0.5" />Confirm</button>
                          <button onClick={() => { handleStatus(app.id, 'CANCELLED'); handleSelectDate(selectedDate); }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200"><FaXmark className="inline w-3 h-3 mr-0.5" />Cancel</button>
                        </div>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button onClick={() => { handleStatus(app.id, 'COMPLETED'); handleSelectDate(selectedDate); }}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"><FaCircleCheck className="inline w-3 h-3 mr-0.5" />Complete</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const c = color === 'green' ? 'text-green-600' : color === 'purple' ? 'text-purple-600' : 'text-gray-900';
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${c}`}>{value}</div>
    </div>
  );
}
