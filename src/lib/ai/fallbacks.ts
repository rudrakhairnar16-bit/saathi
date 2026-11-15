/**
 * AI Fallback Implementations — Saathi
 * Deterministic fallbacks when Gemini is unavailable or returns invalid output.
 * Every AI feature MUST have a fallback.
 */

import type {
  Barrier,
  Action,
  Language,
  Medicine,
  VisitNote,
  FastingPlan,
  FastingPlanEntry,
  Overlap,
  DrugClass,
  AISource,
} from '@/types';
import type { ClassificationResult, DecisionContext } from '@/lib/barrier/types';
import { classifyBarrierFallback, getFallbackEmergencyMessage } from '@/lib/barrier/classify.fallback';
import { makeDecision } from '@/lib/barrier/decide';
import { buildFastingPlan, getGuidanceDisplay } from '@/lib/fasting/buildPlan';
import { findOverlaps, normalizeIngredient } from '@/lib/overlap/checker';
import { v4 as uuidv4 } from 'uuid';
import type { DraftMedicine } from './schemas';

function generateId(): string {
  return uuidv4().slice(0, 8);
}

function nowISO(): string {
  return new Date().toISOString();
}

// ============================================================================
// Barrier Classification Fallback
// ============================================================================

export function classifyBarrierFallbackWrapper(
  text: string,
  language: Language,
  context?: DecisionContext
): ClassificationResult {
  return classifyBarrierFallback(text, language, context);
}

// ============================================================================
// Doctor Note Fallback
// ============================================================================

export interface DoctorNoteFallbackInput {
  elderId: string;
  rawText: string;
  language: Language;
  existingMedicines: Array<{
    name: string;
    activeIngredient: string;
    drugClass: DrugClass;
    doseText: string;
    times: string[];
    withFood: boolean;
    status: 'active' | 'draft';
    prescribedBy?: string;
  }>;
}

export function buildDoctorNoteFallback(input: DoctorNoteFallbackInput): {
  visitNote: VisitNote;
  simpleLines: string[];
  draftMedicines: DraftMedicine[];
  overlaps: Overlap[];
} {
  const { elderId, rawText, language, existingMedicines } = input;

  // Simple extraction: look for medicine-like patterns
  // This is a BASIC fallback - real extraction needs AI
  const lines = rawText.split(/[.\n]/).filter(l => l.trim().length > 0);

  // Generate 5 simple lines from the text
  const simpleLines: string[] = [];
  const textLower = rawText.toLowerCase();

  // Line 1: What the doctor said
  if (language === 'hi') {
    simpleLines.push('डॉक्टर ने नई दवाएं बताई हैं।');
  } else {
    simpleLines.push('Doctor has prescribed new medicines.');
  }

  // Line 2-4: Key points (simplified)
  if (textLower.includes('bp') || textLower.includes('blood pressure') || textLower.includes('रक्तचाप')) {
    simpleLines.push(language === 'hi' ? 'रक्तचाप (BP) की दवा शुरू/बदली गई है।' : 'Blood pressure medicine started/changed.');
  }
  if (textLower.includes('sugar') || textLower.includes('diabetes') || textLower.includes('शुगर') || textLower.includes('मधुमेह')) {
    simpleLines.push(language === 'hi' ? 'शुगर (मधुमेह) की दवा में बदलाव है।' : 'Diabetes medicine has been changed.');
  }
  if (textLower.includes('heart') || textLower.includes('दिल') || textLower.includes('cardiac')) {
    simpleLines.push(language === 'hi' ? 'दिल की दवा बताई गई है।' : 'Heart medicine prescribed.');
  }

  // Pad to 5 lines
  while (simpleLines.length < 5) {
    if (language === 'hi') {
      simpleLines.push('अपनी सभी दवाएं समय पर लें।');
      simpleLines.push('कुछ भी अजीब लगे तो डॉक्टर को बताएं।');
    } else {
      simpleLines.push('Take all medicines on time.');
      simpleLines.push('Tell your doctor if anything feels wrong.');
    }
  }

  // Truncate to exactly 5
  const finalLines = simpleLines.slice(0, 5);

  // No draft medicines extracted in fallback (too risky without AI)
  const draftMedicines: DraftMedicine[] = [];

  // Check overlaps with existing medicines
  const overlaps = findOverlaps(existingMedicines as Medicine[]);

  const visitNote: VisitNote = {
    id: generateId(),
    elderId,
    rawText,
    simpleLines: finalLines,
    draftMedicines: [],
    overlaps,
    source: 'fallback',
    createdAt: nowISO(),
  };

  return { visitNote, simpleLines: finalLines, draftMedicines: [], overlaps };
}

// ============================================================================
// Fasting Plan Fallback
// ============================================================================

export function buildFastingPlanFallback(
  elderId: string,
  occasion: string,
  date: string,
  medicines: Medicine[],
  language: Language
): { plan: FastingPlan; entries: FastingPlanEntry[] } {
  return buildFastingPlan({
    elderId,
    occasion: occasion as any,
    date,
    medicines,
    language,
  });
}

// ============================================================================
// Emergency Response Fallback
// ============================================================================

export function getEmergencyFallback(language: Language): {
  elderMessage: string;
  caregiverAlert: string;
  doctorNote: string;
} {
  return {
    elderMessage: getFallbackEmergencyMessage(language),
    caregiverAlert: 'URGENT: Red-flag symptom reported. Emergency protocol activated.',
    doctorNote: 'Patient reported red-flag symptom (chest pain, fainting, breathlessness, or stroke signs). Immediate clinical review required.',
  };
}

// ============================================================================
// Rate Limit Fallback Response
// ============================================================================

export function getRateLimitFallback(language: Language): {
  message: string;
  retryAfter: number;
} {
  return {
    message: language === 'hi'
      ? 'थोड़ी देर में फिर कोशिश करें। सर्वर व्यस्त है।'
      : 'Please try again in a moment. Server is busy.',
    retryAfter: 30, // seconds
  };
}

// ============================================================================
// Generic AI Error Fallback
// ============================================================================

export function getGenericAIFallback(language: Language): string {
  return language === 'hi'
    ? 'थोड़ी दिक्कत आ गई। फिर से कोशिश करते हैं।'
    : 'Something went wrong. Let\'s try again.';
}