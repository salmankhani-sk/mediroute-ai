'use server';

import Groq from 'groq-sdk';
import { SymptomAnalysisSchema, type SymptomAnalysis, type ChatMessage } from '@/lib/ai-types';
import prisma from '@/lib/db';

// ─── Rate Limiter (in-memory, per-IP) ───────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;   // max requests
const RATE_LIMIT_WINDOW = 60_000; // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── Groq Client (server-side only, API key never exposed) ───
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const PRIMARY_MODEL = process.env.GROQ_MODEL_PRIMARY || 'llama-3.3-70b-versatile';
const FAST_MODEL = process.env.GROQ_MODEL_FAST || 'llama-3.1-8b-instant';

// ─── System Prompt: Clinical Symptom Analyzer ────────────────
const SYMPTOM_SYSTEM_PROMPT = `You are an expert AI medical triage assistant for the "Medi Route AI" platform operating in Peshawar, Pakistan.

Your role is to analyze patient-reported symptoms and provide structured clinical guidance. You are NOT a replacement for a doctor.

RULES:
1. Analyze symptoms and identify the most likely medical department needed.
2. Assign an urgency triage level based on symptom severity.
3. Recommend the appropriate specialist type.
4. Provide clear reasoning and actionable next steps.
5. ALWAYS include a medical disclaimer.

URGENCY TRIAGE GUIDELINES:
- LOW: Minor symptoms (mild headache, common cold, minor rash, fatigue)
- MEDIUM: Persistent symptoms (fever >3 days, moderate pain, recurring issues)
- HIGH: Serious symptoms (severe pain, breathing difficulty, chest discomfort, high fever with vomiting)
- EMERGENCY: Life-threatening (chest pain with sweating, stroke signs, severe bleeding, unconsciousness)

DEPARTMENTS & SPECIALISTS:
- CARDIOLOGY → CARDIOLOGIST (heart, chest pain, palpitations, BP)
- PULMONOLOGY → PULMONOLOGIST (breathing, lungs, cough, asthma)
- NEUROLOGY → NEUROLOGIST (headaches, seizures, numbness, dizziness)
- ORTHOPEDICS → ORTHOPEDIC (bone, joint, fracture, back pain)
- GASTROENTEROLOGY → GASTROENTEROLOGIST (stomach, digestion, liver)
- DERMATOLOGY → DERMATOLOGIST (skin, rashes, allergies)
- PEDIATRICS → PEDIATRICIAN (children under 14)
- GYNECOLOGY → GYNECOLOGIST (women's health, pregnancy)
- UROLOGY → UROLOGIST (urinary, kidney stones)
- ENT → ENT_SPECIALIST (ear, nose, throat)
- OPHTHALMOLOGY → OPHTHALMOLOGIST (eyes, vision)
- PSYCHIATRY → PSYCHIATRIST (mental health, anxiety, depression)
- ENDOCRINOLOGY → ENDOCRINOLOGIST (diabetes, thyroid, hormones)
- NEPHROLOGY → NEPHROLOGIST (kidneys, dialysis)
- ONCOLOGY → ONCOLOGIST (cancer, tumors)
- GENERAL_MEDICINE → GENERAL_PHYSICIAN (general health, fever, flu)
- EMERGENCY → EMERGENCY (life-threatening conditions)

OUTPUT FORMAT: You MUST respond with ONLY a valid JSON object, no markdown, no backticks:
{
  "suspectedCondition": "brief description",
  "department": "CARDIOLOGY",
  "urgencyLevel": "MEDIUM",
  "recommendedSpecialist": "CARDIOLOGIST",
  "reasoning": "detailed clinical reasoning based on symptoms",
  "recommendedActions": ["action 1", "action 2"],
  "disclaimer": "This is AI-generated guidance, not a medical diagnosis. Please consult a doctor."
}`;

// ─── Analyze Symptoms (Primary Model) ───────────────────────
export async function analyzeSymptoms(
  symptoms: string,
  patientAge?: number,
  patientGender?: string,
): Promise<{ success: true; data: SymptomAnalysis } | { success: false; error: string }> {
  try {
    // Rate limiting
    if (!checkRateLimit('symptoms')) {
      return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
    }
    const userMessage = [
      'Patient Symptoms:',
      symptoms,
      patientAge ? `Age: ${patientAge}` : '',
      patientGender ? `Gender: ${patientGender}` : '',
      '',
      'Analyze these symptoms and provide a structured JSON response.',
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      messages: [
        { role: 'system', content: SYMPTOM_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return { success: false, error: 'No response from AI model.' };
    }

    // Parse and validate the JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return { success: false, error: 'AI returned invalid JSON. Please try again.' };
    }

    const validated = SymptomAnalysisSchema.safeParse(parsed);

    if (!validated.success) {
      console.error('AI validation error:', validated.error.flatten());
      return {
        success: false,
        error: 'AI response format issue. Please rephrase your symptoms and try again.',
      };
    }

    // Optionally log the analysis to DB (non-blocking)
    prisma.symptomAnalysis
      .create({
        data: {
          symptoms,
          suspectedCondition: validated.data.suspectedCondition,
          department: validated.data.department,
          urgencyLevel: validated.data.urgencyLevel,
          recommendedSpecialist: validated.data.recommendedSpecialist,
          aiResponse: rawContent,
        },
      })
      .catch((err) => console.error('Failed to log symptom analysis:', err));

    return { success: true, data: validated.data };
  } catch (error) {
    console.error('Groq API error:', error);
    return {
      success: false,
      error: 'AI service temporarily unavailable. Please try again in a moment.',
    };
  }
}

// ─── Medical Chatbot (Fast Model) ───────────────────────────
const CHATBOT_SYSTEM_PROMPT = `You are "MediBot", a helpful and friendly medical assistant for patients in Peshawar, Pakistan.

Your purpose is to:
- Answer general healthcare questions in simple Urdu/English
- Provide health tips and preventive care advice
- Guide patients on which specialist to see for specific symptoms
- Explain common medical terms in easy language
- Remind users that you are NOT a doctor and they should consult a professional

RULES:
1. Keep responses concise (3-5 sentences max unless explaining something complex).
2. Be warm and reassuring in tone.
3. For serious symptoms, ALWAYS advise visiting a hospital immediately.
4. Never prescribe medication or dosages.
5. If asked about emergencies, direct them to call 1122 (Pakistan emergency) or visit the nearest hospital ER.
6. You may respond in Roman Urdu if the user writes in Roman Urdu.`;

export async function medicalChatbot(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  try {
    if (!checkRateLimit('chatbot')) {
      return 'I am receiving too many requests right now. Please wait a moment and try again.';
    }
    const messages: ChatMessage[] = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 512,
    });

    return completion.choices[0]?.message?.content || 'I apologize, I could not process that. Please try again.';
  } catch (error) {
    console.error('Groq chatbot error:', error);
    return 'I am having trouble connecting. Please try again shortly.';
  }
}

// ─── Specialist Recommendation (Lightweight) ────────────────
export async function recommendSpecialist(
  symptoms: string,
): Promise<{ specialist: string; department: string; reasoning: string }> {
  try {
    if (!checkRateLimit('specialist')) {
      return { specialist: 'GENERAL_PHYSICIAN', department: 'GENERAL_MEDICINE', reasoning: 'Rate limit reached. Please try again shortly.' };
    }
    const completion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a medical triage assistant. Given patient symptoms, recommend the best specialist type and department. Respond with ONLY valid JSON: {"specialist": "CARDIOLOGIST", "department": "CARDIOLOGY", "reasoning": "..."}`,
        },
        { role: 'user', content: `Symptoms: ${symptoms}` },
      ],
      temperature: 0.3,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response');

    return JSON.parse(content);
  } catch (error) {
    console.error('Specialist recommendation error:', error);
    return {
      specialist: 'GENERAL_PHYSICIAN',
      department: 'GENERAL_MEDICINE',
      reasoning: 'Please consult a general physician for initial assessment.',
    };
  }
}
