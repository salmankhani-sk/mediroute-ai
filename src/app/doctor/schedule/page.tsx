'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';
import { getDoctorSchedules, saveDoctorSchedule } from '@/app/actions/doctor';
import { FaCalendarDays, FaFloppyDisk, FaCheck, FaXmark } from 'react-icons/fa6';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Record<number, { start: string; end: string; active: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'DOCTOR')) { router.push('/login'); return; }
    if (!authLoading && user?.role === 'DOCTOR') loadSchedules();
  }, [authLoading, user]);

  async function loadSchedules() {
    const data = await getDoctorSchedules();
    const map: Record<number, any> = {};
    data.forEach((s: any) => { map[s.dayOfWeek] = { start: s.startTime, end: s.endTime, active: s.isActive }; });
    // Fill empty days
    for (let i = 0; i < 7; i++) { if (!map[i]) map[i] = { start: '09:00', end: '17:00', active: true }; }
    setSchedules(map);
  }

  async function handleSave() {
    setSaving(true); setMsg('');
    const data = Object.entries(schedules).map(([day, s]) => ({
      dayOfWeek: parseInt(day), startTime: s.start, endTime: s.end, isActive: s.active,
    }));
    const res = await saveDoctorSchedule(data);
    setMsg(res.success ? 'Schedule saved successfully!' : 'Failed to save.');
    setSaving(false);
  }

  function updateDay(day: number, field: string, value: string | boolean) {
    setSchedules(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  if (authLoading || !user) return <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"/></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2"><FaCalendarDays className="inline w-7 h-7 mr-2 text-primary-600" />Manage Your Schedule</h1>
      <p className="text-gray-600 mb-8">Set your weekly availability for patient appointments.</p>

      {msg && <div className={`p-3 rounded-lg text-sm mb-4 ${msg.startsWith('Schedule') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{msg}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {DAYS.map((dayName, i) => {
          const s = schedules[i] || { start: '09:00', end: '17:00', active: true };
          return (
            <div key={i} className={`p-4 flex items-center gap-4 ${!s.active ? 'opacity-50' : ''}`}>
              <label className="flex items-center gap-2 min-w-[100px]">
                <input type="checkbox" checked={s.active} onChange={e => updateDay(i, 'active', e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-gray-900">{dayName}</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="time" value={s.start} onChange={e => updateDay(i, 'start', e.target.value)}
                  disabled={!s.active}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
                <span className="text-gray-400">to</span>
                <input type="time" value={s.end} onChange={e => updateDay(i, 'end', e.target.value)}
                  disabled={!s.active}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="mt-6 w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 transition-colors">
        {saving ? 'Saving...' : <span><FaFloppyDisk className="inline w-4 h-4 mr-1" />Save Schedule</span>}
      </button>
    </div>
  );
}
