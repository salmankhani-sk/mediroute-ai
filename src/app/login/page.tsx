'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState<{ type: 'success'|'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const res = await loginUser(form);
    if (res.success) {
      setMsg({ type: 'success', text: `Welcome back, ${res.user!.fullName}!` });
      const redirects: Record<string, string> = { DOCTOR: '/doctor', ADMIN: '/admin', PATIENT: '/symptoms' };
      // Delay to ensure cookie is set before navigation
      setTimeout(() => {
        window.location.href = redirects[res.user!.role] || '/symptoms';
      }, 500);
    } else {
      setMsg({ type: 'error', text: res.error || 'Login failed.' });
    }
    setLoading(false);
  };

  const cls = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
      <p className="text-gray-600 mb-8 text-center">Login to your MediRoute AI account.</p>

      {msg && <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type==='success'?'bg-green-50 text-green-800 border border-green-200':'bg-red-50 text-red-800 border border-red-200'}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className={cls} placeholder="ahmed@example.com" /></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Password</label><input type="password" required value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className={cls} placeholder="Your password" /></div>
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 transition-colors">{loading?'Logging in...':'Login'}</button>
        <p className="text-center text-sm text-gray-500">Don't have an account? <Link href="/register" className="text-primary-600 font-medium hover:underline">Sign Up</Link></p>
      </form>
    </div>
  );
}
