'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerPatient } from '@/app/actions/auth';

export default function PatientRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [msg, setMsg] = useState<{ type: 'success'|'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const res = await registerPatient(form);
    if (res.success) {
      setMsg({ type: 'success', text: 'Registration successful! Redirecting to login...' });
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMsg({ type: 'error', text: res.error || 'Registration failed.' });
    }
    setLoading(false);
  };

  const cls = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Patient Sign Up</h1>
      <p className="text-gray-600 mb-8 text-center">Create your MediRoute AI account and start finding specialists.</p>

      {msg && <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type==='success'?'bg-green-50 text-green-800 border border-green-200':'bg-red-50 text-red-800 border border-red-200'}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div><label className={lbl}>Full Name *</label><input type="text" required value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} className={cls} placeholder="Ahmed Khan" /></div>
        <div><label className={lbl}>Email *</label><input type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className={cls} placeholder="ahmed@example.com" /></div>
        <div><label className={lbl}>Password *</label><input type="password" required minLength={8} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className={cls} placeholder="Min 8 characters" /></div>
        <div><label className={lbl}>Phone (optional)</label><input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} className={cls} placeholder="+92-300-1234567" /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 transition-colors">{loading?'Creating Account...':'Create Account'}</button>
        <p className="text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="text-primary-600 font-medium hover:underline">Login</Link></p>
        <p className="text-center text-sm text-gray-500">Are you a doctor? <Link href="/register/doctor" className="text-primary-600 font-medium hover:underline">Register as Specialist</Link></p>
      </form>
    </div>
  );
}
