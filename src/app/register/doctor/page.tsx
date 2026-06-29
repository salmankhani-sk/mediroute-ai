'use client';

import { useState } from 'react';
import { registerDoctor } from '@/app/actions/auth';

const SPECIALIST_OPTIONS = [
  'CARDIOLOGIST','PULMONOLOGIST','NEUROLOGIST','ORTHOPEDIC','GASTROENTEROLOGIST',
  'DERMATOLOGIST','PEDIATRICIAN','GYNECOLOGIST','UROLOGIST','ENT_SPECIALIST',
  'OPHTHALMOLOGIST','PSYCHIATRIST','ENDOCRINOLOGIST','NEPHROLOGIST','ONCOLOGIST',
  'GENERAL_PHYSICIAN','DENTIST','PHYSIOTHERAPIST','RADIOLOGIST','PATHOLOGIST',
];

const DEPARTMENT_OPTIONS = [
  'CARDIOLOGY','PULMONOLOGY','NEUROLOGY','ORTHOPEDICS','GASTROENTEROLOGY',
  'DERMATOLOGY','PEDIATRICS','GYNECOLOGY','UROLOGY','ENT','OPHTHALMOLOGY',
  'PSYCHIATRY','ENDOCRINOLOGY','NEPHROLOGY','ONCOLOGY','GENERAL_MEDICINE',
  'DENTAL','PHYSIOTHERAPY','RADIOLOGY','PATHOLOGY','EMERGENCY',
];

export default function DoctorRegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    specialistType: '', department: '', licenseNumber: '',
    qualification: '', experienceYears: 0, consultationFee: 0,
    bio: '', hospitalId: '',
  });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await registerDoctor(form);
    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Registration successful!' });
    } else {
      setMsg({ type: 'error', text: res.error || 'Registration failed.' });
    }
    setLoading(false);
  };

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as a Specialist Doctor</h1>
      <p className="text-gray-600 mb-8">Join MediRoute AI and connect with patients in Peshawar. Your profile will be reviewed before going live.</p>

      {msg && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" required value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} className={inputClass} placeholder="Dr. Muhammad Khan" />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" required value={form.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="doctor@example.com" />
          </div>
          <div>
            <label className={labelClass}>Password *</label>
            <input type="password" required minLength={8} value={form.password} onChange={e => handleChange('password', e.target.value)} className={inputClass} placeholder="Min 8 characters" />
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input type="tel" required value={form.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClass} placeholder="+92-300-1234567" />
          </div>
          <div>
            <label className={labelClass}>Specialist Type *</label>
            <select required value={form.specialistType} onChange={e => { handleChange('specialistType', e.target.value); handleChange('department', e.target.value.replace('_SPECIALIST','').replace('CARDIOLOGIST','CARDIOLOGY').replace('PULMONOLOGIST','PULMONOLOGY').replace('NEUROLOGIST','NEUROLOGY').replace('ORTHOPEDIC','ORTHOPEDICS').replace('GASTROENTEROLOGIST','GASTROENTEROLOGY').replace('DERMATOLOGIST','DERMATOLOGY').replace('PEDIATRICIAN','PEDIATRICS').replace('GYNECOLOGIST','GYNECOLOGY').replace('UROLOGIST','UROLOGY').replace('ENT_SPECIALIST','ENT').replace('OPHTHALMOLOGIST','OPHTHALMOLOGY').replace('PSYCHIATRIST','PSYCHIATRY').replace('ENDOCRINOLOGIST','ENDOCRINOLOGY').replace('NEPHROLOGIST','NEPHROLOGY').replace('ONCOLOGIST','ONCOLOGY').replace('GENERAL_PHYSICIAN','GENERAL_MEDICINE').replace('DENTIST','DENTAL').replace('PHYSIOTHERAPIST','PHYSIOTHERAPY').replace('RADIOLOGIST','RADIOLOGY').replace('PATHOLOGIST','PATHOLOGY')); }} className={inputClass}>
              <option value="">Select specialist type</option>
              {SPECIALIST_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Department (auto-set)</label>
            <input type="text" value={form.department.replace(/_/g,' ')} readOnly className={`${inputClass} bg-gray-50 text-gray-500`} />
          </div>
          <div>
            <label className={labelClass}>License Number *</label>
            <input type="text" required value={form.licenseNumber} onChange={e => handleChange('licenseNumber', e.target.value)} className={inputClass} placeholder="PMDC-12345" />
          </div>
          <div>
            <label className={labelClass}>Qualification *</label>
            <input type="text" required value={form.qualification} onChange={e => handleChange('qualification', e.target.value)} className={inputClass} placeholder="MBBS, FCPS (Cardiology)" />
          </div>
          <div>
            <label className={labelClass}>Experience (Years) *</label>
            <input type="number" required min={0} max={60} value={form.experienceYears} onChange={e => handleChange('experienceYears', parseInt(e.target.value)||0)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Consultation Fee (PKR) *</label>
            <input type="number" required min={0} value={form.consultationFee} onChange={e => handleChange('consultationFee', parseInt(e.target.value)||0)} className={inputClass} placeholder="1500" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Professional Bio</label>
          <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} className={inputClass} placeholder="Brief introduction about your expertise and approach..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg">
          {loading ? 'Submitting...' : '📋 Submit for Review'}
        </button>

        <p className="text-xs text-gray-400 text-center">Your profile will be reviewed by our admin team before appearing in search results.</p>
      </form>
    </div>
  );
}
