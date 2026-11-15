/**
 * Gemini AI Client — Saathi
 * Server-only. All AI calls go through this client with validation and fallbacks.
 */

import { GoogleGenAI } from '@google/genai';
import type { Language, AISource, DrugClass, MedicineStatus, Medicine } from '@/types';
import {
  BarrierClassificationSchema,
  DoctorNoteSchema,
  FastingPlanSchema,
  validateBarrierClassification,
  validateDoctorNote,
  validateFastingPlan,
  BARRIER_CLASSIFICATION_INSTRUCTIONS,
  DOCTOR_NOTE_INSTRUCTIONS,
  FASTING_PLAN_INSTRUCTIONS,
} from './schemas';
import type { DraftMedicine } from './schemas';
import {
  classifyBarrierFallbackWrapper,
  buildDoctorNoteFallback,
  buildFastingPlanFallback,
  getEmergencyFallback,
  getRateLimitFallback,
  getGenericAIFallback,
} from './fallbacks';
import { aiRateLimiterCheck } from '@/lib/security/rateLimit';

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ============================================================================
// Client Initialization
// ============================================================================

function getClient(): GoogleGenAI | null {
  if (!GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

// ============================================================================
// Barrier Classification
// ============================================================================

export interface ClassifyBarrierInput {
  text: string;
  language: Language;
  context?: {
    doseTime: string;
    previousSkips: number;
    barrierHistory: string[];
  };
}

export async function classifyBarrier(
  input: ClassifyBarrierInput,
  ip?: string
): Promise<{
  category: string;
  confidence: number;
  redFlag: boolean;
  source: AISource;
  reasoning?: string;
}> {
  // Rate limit check
  if (ip) {
    const { allowed, retryAfter } = aiRateLimiterCheck(ip);
    if (!allowed) {
      const fallback = getRateLimitFallback(input.language);
      throw new Error(`RATE_LIMITED|${retryAfter}|${fallback.message}`);
    }
  }

  const client = getClient();
  if (!client) {
    // No API key - use fallback
    const fallback = classifyBarrierFallbackWrapper(input.text, input.language, input.context as any);
    return { ...fallback, source: 'fallback' };
  }

  try {
    const prompt = `${BARRIER_CLASSIFICATION_INSTRUCTIONS}

Patient text: "${input.text}"
Language: ${input.language}
Dose time: ${input.context?.doseTime || 'unknown'}
Previous skips (7 days): ${input.context?.previousSkips || 0}
Recent barriers: ${input.context?.barrierHistory?.join(', ') || 'none'}

Output JSON only.`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: BarrierClassificationSchema,
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validation = validateBarrierClassification(parsed);

    if (validation.success) {
      return { ...validation.data, source: 'gemini' };
    }

    // Validation failed - use fallback
    console.warn('[AI] Barrier classification validation failed:', validation.error);
    const fallback = classifyBarrierFallbackWrapper(input.text, input.language, input.context as any);
    return { ...fallback, source: 'fallback' };
  } catch (error) {
    console.error('[AI] Barrier classification error:', error);
    const fallback = classifyBarrierFallbackWrapper(input.text, input.language, input.context as any);
    return { ...fallback, source: 'fallback' };
  }
}

// ============================================================================
// Doctor Note Processing
// ============================================================================

export interface ProcessDoctorNoteInput {
  elderId: string;
  text: string;
  language: Language;
  existingMedicines: Array<{
    name: string;
    activeIngredient: string;
    drugClass: DrugClass;
    doseText: string;
    times: string[];
    withFood: boolean;
    status: MedicineStatus;
    prescribedBy: string;
  }>;
}

export async function processDoctorNote(
  input: ProcessDoctorNoteInput,
  ip?: string
): Promise<{
  simpleLines: string[];
  draftMedicines: DraftMedicine[];
  source: AISource;
}> {
  if (ip) {
    const { allowed, retryAfter } = aiRateLimiterCheck(ip);
    if (!allowed) {
      const fallback = getRateLimitFallback(input.language);
      throw new Error(`RATE_LIMITED|${retryAfter}|${fallback.message}`);
    }
  }

  const client = getClient();
  if (!client) {
    const fallback = buildDoctorNoteFallback({
      elderId: input.elderId,
      rawText: input.text,
      language: input.language,
      existingMedicines: input.existingMedicines.map(m => ({
        name: m.name,
        activeIngredient: m.activeIngredient,
        drugClass: m.drugClass,
        doseText: m.doseText,
        times: m.times,
        withFood: m.withFood,
        status: m.status,
        prescribedBy: m.prescribedBy,
      })),
    });
    return {
      simpleLines: fallback.simpleLines,
      draftMedicines: fallback.draftMedicines,
      source: 'fallback',
    };
  }

  try {
    const medicinesContext = input.existingMedicines.length > 0
      ? `\nExisting medicines: ${JSON.stringify(input.existingMedicines.map(m => ({
          name: m.name,
          activeIngredient: m.activeIngredient,
          drugClass: m.drugClass,
          doseText: m.doseText,
          times: m.times,
          withFood: m.withFood,
          status: m.status,
          prescribedBy: m.prescribedBy,
        })))}`
      : '';

    const prompt = `${DOCTOR_NOTE_INSTRUCTIONS}

Doctor text: "${input.text}"
Language: ${input.language}
${medicinesContext}

Output JSON only.`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: DoctorNoteSchema,
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validation = validateDoctorNote(parsed);

    if (validation.success) {
      return {
        simpleLines: validation.data.simpleLines,
        draftMedicines: validation.data.draftMedicines,
        source: 'gemini',
      };
    }

    console.warn('[AI] Doctor note validation failed:', validation.error);
    const fallback = buildDoctorNoteFallback({
      elderId: input.elderId,
      rawText: input.text,
      language: input.language,
      existingMedicines: input.existingMedicines.map(m => ({
        name: m.name,
        activeIngredient: m.activeIngredient,
        drugClass: m.drugClass,
        doseText: m.doseText,
        times: m.times,
        withFood: m.withFood,
        status: m.status,
        prescribedBy: m.prescribedBy,
      })),
    });
    return {
      simpleLines: fallback.simpleLines,
      draftMedicines: fallback.draftMedicines,
      source: 'fallback',
    };
  } catch (error) {
    console.error('[AI] Doctor note error:', error);
    const fallback = buildDoctorNoteFallback({
      elderId: input.elderId,
      rawText: input.text,
      language: input.language,
      existingMedicines: input.existingMedicines.map(m => ({
        name: m.name,
        activeIngredient: m.activeIngredient,
        drugClass: m.drugClass,
        doseText: m.doseText,
        times: m.times,
        withFood: m.withFood,
        status: m.status,
        prescribedBy: m.prescribedBy,
      })),
    });
    return {
      simpleLines: fallback.simpleLines,
      draftMedicines: fallback.draftMedicines,
      source: 'fallback',
    };
  }
}

// ============================================================================
// Fasting Plan Enhancement
// ============================================================================

export interface EnhanceFastingPlanInput {
  elderId: string;
  occasion: string;
  date: string;
  medicines: Array<{
    id: string;
    name: string;
    drugClass: string;
    guidance: 'with_food' | 'empty_stomach_ok' | 'ask_doctor';
    reason: string;
    askDoctor: string;
  }>;
  language: Language;
}

export async function enhanceFastingPlan(
  input: EnhanceFastingPlanInput,
  ip?: string
): Promise<{
  entries: Array<{
    medicineId: string;
    guidance: 'with_food' | 'empty_stomach_ok' | 'ask_doctor';
    reason: string;
    askDoctor: string;
  }>;
  source: AISource;
}> {
  if (ip) {
    const { allowed, retryAfter } = aiRateLimiterCheck(ip);
    if (!allowed) {
      const fallback = getRateLimitFallback(input.language);
      throw new Error(`RATE_LIMITED|${retryAfter}|${fallback.message}`);
    }
  }

  const client = getClient();
  if (!client) {
    const fallback = buildFastingPlanFallback(
      input.elderId,
      input.occasion,
      input.date,
      input.medicines as any,
      input.language
    );
    return { entries: fallback.entries, source: 'fallback' };
  }

  try {
    const prompt = `${FASTING_PLAN_INSTRUCTIONS}

Occasion: ${input.occasion}
Date: ${input.date}
Language: ${input.language}
Medicines with deterministic guidance:
${JSON.stringify(input.medicines, null, 2)}

Output JSON only.`;

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: FastingPlanSchema,
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validation = validateFastingPlan(parsed);

    if (validation.success) {
      return { entries: validation.data.entries, source: 'gemini' };
    }

    console.warn('[AI] Fasting plan validation failed:', validation.error);
    const fallback = buildFastingPlanFallback(
      input.elderId,
      input.occasion,
      input.date,
      input.medicines as any,
      input.language
    );
    return { entries: fallback.entries, source: 'fallback' };
  } catch (error) {
    console.error('[AI] Fasting plan error:', error);
    const fallback = buildFastingPlanFallback(
      input.elderId,
      input.occasion,
      input.date,
      input.medicines as any,
      input.language
    );
    return { entries: fallback.entries, source: 'fallback' };
  }
}

// ============================================================================
// Emergency Response (No AI - deterministic)
// ============================================================================

export function getEmergencyResponse(language: Language) {
  return getEmergencyFallback(language);
}

// ============================================================================
// Generic AI Error Helper
// ============================================================================

export function getAIErrorMessage(language: Language): string {
  return getGenericAIFallback(language);
}