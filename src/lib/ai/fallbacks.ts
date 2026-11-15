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

  // Line 2-4: Key points (simplified) - use a set to avoid duplicates
  const addedLines = new Set<string>();

  if (textLower.includes('bp') || textLower.includes('blood pressure') || textLower.includes('रक्तचाप')) {
    const line = language === 'hi' ? 'रक्तचाप (BP) की दवा शुरू/बदली गई है।' : 'Blood pressure medicine started/changed.';
    if (!addedLines.has(line)) { simpleLines.push(line); addedLines.add(line); }
  }
  if (textLower.includes('sugar') || textLower.includes('diabetes') || textLower.includes('शुगर') || textLower.includes('मधुमेह')) {
    const line = language === 'hi' ? 'शुगर (मधुमेह) की दवा में बदलाव है।' : 'Diabetes medicine has been changed.';
    if (!addedLines.has(line)) { simpleLines.push(line); addedLines.add(line); }
  }
  if (textLower.includes('heart') || textLower.includes('दिल') || textLower.includes('cardiac')) {
    const line = language === 'hi' ? 'दिल की दवा बताई गई है।' : 'Heart medicine prescribed.';
    if (!addedLines.has(line)) { simpleLines.push(line); addedLines.add(line); }
  }

  // Pad to 5 lines with unique generic lines
  const genericLines = language === 'hi'
    ? ['अपनी सभी दवाएं समय पर लें।', 'कुछ भी अजीब लगे तो डॉक्टर को बताएं।', 'दवा लेना न भूलें।', 'खाना खाने के बाद दवा लें।', 'पानी के साथ दवा निगलें।']
    : ['Take all medicines on time.', 'Tell your doctor if anything feels wrong.', 'Do not forget your medicine.', 'Take medicine after eating.', 'Swallow medicine with water.'];

  for (const line of genericLines) {
    if (simpleLines.length >= 5) break;
    if (!addedLines.has(line)) { simpleLines.push(line); addedLines.add(line); }
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
  medicines: Array<{ id: string; name: string; drugClass: string; guidance: string; reason: string; askDoctor: string }>,
  language: Language
): { plan: FastingPlan; entries: FastingPlanEntry[] } {
  // Convert the AI input format back to the buildPlan input format
  const planInput = {
    elderId,
    occasion: occasion as any,
    date,
    medicines: medicines.map(m => ({
      id: m.id,
      elderId,
      name: m.name,
      activeIngredient: m.name, // fallback
      drugClass: m.drugClass as any,
      doseText: '',
      times: [],
      withFood: false,
      prescribedBy: 'Unknown',
      status: 'active' as const,
    })),
    language,
  };
  return buildFastingPlan(planInput);
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