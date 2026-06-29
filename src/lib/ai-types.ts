import { z } from 'zod';

// ─── AI Symptom Analysis Output ────────────────────────
export const SymptomAnalysisSchema = z.object({
  suspectedCondition: z.string(),
  department: z.enum([
    'CARDIOLOGY', 'PULMONOLOGY', 'NEUROLOGY', 'ORTHOPEDICS',
    'GASTROENTEROLOGY', 'DERMATOLOGY', 'PEDIATRICS', 'GYNECOLOGY',
    'UROLOGY', 'ENT', 'OPHTHALMOLOGY', 'PSYCHIATRY',
    'ENDOCRINOLOGY', 'NEPHROLOGY', 'ONCOLOGY', 'GENERAL_MEDICINE',
    'DENTAL', 'PHYSIOTHERAPY', 'RADIOLOGY', 'PATHOLOGY', 'EMERGENCY',
  ]),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  recommendedSpecialist: z.enum([
    'CARDIOLOGIST', 'PULMONOLOGIST', 'NEUROLOGIST', 'ORTHOPEDIC',
    'GASTROENTEROLOGIST', 'DERMATOLOGIST', 'PEDIATRICIAN', 'GYNECOLOGIST',
    'UROLOGIST', 'ENT_SPECIALIST', 'OPHTHALMOLOGIST', 'PSYCHIATRIST',
    'ENDOCRINOLOGIST', 'NEPHROLOGIST', 'ONCOLOGIST', 'GENERAL_PHYSICIAN',
    'DENTIST', 'PHYSIOTHERAPIST', 'RADIOLOGIST', 'PATHOLOGIST',
  ]),
  reasoning: z.string(),
  recommendedActions: z.array(z.string()),
  disclaimer: z.string(),
});

export type SymptomAnalysis = z.infer<typeof SymptomAnalysisSchema>;

// ─── Chatbot Message ───────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── Hospital with Distance ────────────────────────────
export interface HospitalWithDistance {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  departments: string[];
  distanceKm: number;
}
