/**
 * Build Fasting Plan — Saathi Vrat-Roza-Tyohar Planner
 * Pure function: given occasion and medicines, returns a draft fasting plan.
 * AI CANNOT lower risk levels set by deterministic rules.
 */

import type {
  Medicine,
  FastingPlan,
  FastingPlanEntry,
  Occasion,
  DrugClass,
  FastingGuidance,
  Language,
  AISource,
} from '@/types';
import {
  getDrugClassRule,
  getDefaultGuidance,
  getDoctorQuestion,
  getReasoning,
  isHighRiskDrugClass,
  OCCASIONS,
  DRUG_CLASS_RULES,
} from './rules';
import { v4 as uuidv4 } from 'uuid';

// Re-export for testing
export { getDefaultGuidance, isHighRiskDrugClass, DRUG_CLASS_RULES } from './rules';

function generateId(): string {
  return uuidv4().slice(0, 8);
}

function nowISO(): string {
  return new Date().toISOString();
}

// ============================================================================
// Main Build Function (Pure)
// ============================================================================

export interface BuildFastingPlanInput {
  elderId: string;
  occasion: Occasion;
  date: string; // YYYY-MM-DD
  medicines: Medicine[]; // Only active medicines
  language: Language;
}

export interface BuildFastingPlanOutput {
  plan: FastingPlan;
  entries: FastingPlanEntry[];
}

/**
 * Builds a fasting plan from medicines and occasion.
 * Pure function — no I/O, no AI calls.
 * Deterministic rules set the floor; AI can only enhance phrasing/questions.
 */
export function buildFastingPlan(input: BuildFastingPlanInput): BuildFastingPlanOutput {
  const { elderId, occasion, date, medicines, language } = input;

  const entries: FastingPlanEntry[] = medicines
    .filter(m => m.status === 'active')
    .map(medicine => {
      const drugClass = medicine.drugClass;
      const guidance = getDefaultGuidance(drugClass, occasion);
      const reason = getReasoning(drugClass, occasion);
      const askDoctor = getDoctorQuestion(drugClass, occasion);

      // HIGH RISK OVERRIDE: AI can enhance but NEVER lower guidance
      // If drug class is high risk, guidance is ALWAYS 'ask_doctor'
      // (already enforced by rules, but double-checking)
      const finalGuidance = isHighRiskDrugClass(drugClass) ? 'ask_doctor' : guidance;

      return {
        medicineId: medicine.id,
        guidance: finalGuidance,
        reason,
        askDoctor,
      };
    });

  const plan: FastingPlan = {
    id: generateId(),
    elderId,
    occasion,
    date,
    entries,
    status: 'draft',
    source: 'fallback',
  };

  return { plan, entries };
}

// ============================================================================
// Occasion Helper
// ============================================================================

export function getOccasionInfo(occasion: Occasion) {
  return OCCASIONS[occasion];
}

export function getOccasionLabel(occasion: Occasion, language: Language): string {
  return language === 'hi' ? OCCASIONS[occasion].labelHi : OCCASIONS[occasion].label;
}

export function getOccasionDescription(occasion: Occasion, language: Language): string {
  return OCCASIONS[occasion].description;
}

// ============================================================================
// Guidance Display Helpers
// ============================================================================

export interface GuidanceDisplay {
  label: string;
  labelHi: string;
  icon: string;
  color: string; // Tailwind color class
  description: string;
  descriptionHi: string;
}

export const GUIDANCE_DISPLAY: Record<FastingGuidance, GuidanceDisplay> = {
  with_food: {
    label: 'Take with Food',
    labelHi: 'भोजन के साथ लें',
    icon: '🍽️',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Take this medicine with a meal or substantial snack.',
    descriptionHi: 'इस दवा को भोजन या भरपूर नाश्ते के साथ लें।',
  },
  empty_stomach_ok: {
    label: 'Empty Stomach OK',
    labelHi: 'खाली पेट ले सकते हैं',
    icon: '✅',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Can be taken without food. Take with water if allowed.',
    descriptionHi: 'बिना भोजन के ली जा सकती है। अगर पानी की अनुमति है तो पानी के साथ लें।',
  },
  ask_doctor: {
    label: 'Ask Your Doctor',
    labelHi: 'डॉक्टर से पूछें',
    icon: '🩺',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'High-risk medicine. MUST confirm with your doctor before fasting.',
    descriptionHi: 'उच्च जोखिम वाली दवा। उपवास से पहले डॉक्टर से पुष्टि अनिवार्य है।',
  },
};

export function getGuidanceDisplay(guidance: FastingGuidance, language: Language): GuidanceDisplay {
  const display = GUIDANCE_DISPLAY[guidance];
  return {
    ...display,
    label: language === 'hi' ? display.labelHi : display.label,
    description: language === 'hi' ? display.descriptionHi : display.description,
  };
}