/**
 * Zod Response Schemas — Saathi AI Layer
 * Strict validation for all Gemini responses. Invalid = fallback.
 */

import { z } from 'zod';
import type { Barrier, Action, Language, FastingGuidance, Occasion, DrugClass } from '@/types';

// ============================================================================
// Barrier Classification Schema
// ============================================================================

export const BarrierClassificationSchema = z.object({
  category: z.enum([
    'forgot',
    'side_effect',
    'feels_better',
    'cost_or_stock',
    'swallowing',
    'fear_or_belief',
    'other',
  ] as [Barrier, ...Barrier[]]),
  confidence: z.number().min(0).max(1),
  redFlag: z.boolean(),
  reasoning: z.string().max(200).optional(),
});

export type BarrierClassification = z.infer<typeof BarrierClassificationSchema>;

// ============================================================================
// Doctor Note Schema
// ============================================================================

export const DraftMedicineSchema = z.object({
  name: z.string().min(1).max(100),
  activeIngredient: z.string().min(1).max(100),
  drugClass: z.enum([
    'insulin',
    'sulfonylurea',
    'metformin',
    'antihypertensive',
    'anticoagulant',
    'statin',
    'analgesic',
    'other',
  ] as [DrugClass, ...DrugClass[]]),
  doseText: z.string().min(1).max(50),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).min(1).max(6),
  withFood: z.boolean(),
  prescribedBy: z.string().max(100),
  status: z.literal('draft'),
});

export const DoctorNoteSchema = z.object({
  simpleLines: z.array(z.string().max(160)).length(5),
  draftMedicines: z.array(DraftMedicineSchema).max(10),
  language: z.enum(['en', 'hi']),
});

export type DoctorNoteResponse = z.infer<typeof DoctorNoteSchema>;
export type DraftMedicine = z.infer<typeof DraftMedicineSchema>;

// ============================================================================
// Fasting Plan Schema
// ============================================================================

export const FastingPlanEntrySchema = z.object({
  medicineId: z.string().min(1),
  guidance: z.enum(['with_food', 'empty_stomach_ok', 'ask_doctor'] as [FastingGuidance, ...FastingGuidance[]]),
  reason: z.string().max(300),
  askDoctor: z.string().max(300),
});

export const FastingPlanSchema = z.object({
  occasion: z.enum([
    'ekadashi',
    'navratri',
    'roza',
    'paryushan',
    'karva_chauth',
    'custom',
  ] as [Occasion, ...Occasion[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(FastingPlanEntrySchema).min(1),
  status: z.literal('draft'),
  language: z.enum(['en', 'hi']),
});

export type FastingPlanResponse = z.infer<typeof FastingPlanSchema>;
export type FastingPlanEntryResponse = z.infer<typeof FastingPlanEntrySchema>;

// ============================================================================
// Schema Validation Helpers
// ============================================================================

export function validateBarrierClassification(data: unknown): { success: true; data: BarrierClassification } | { success: false; error: string } {
  const result = BarrierClassificationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export function validateDoctorNote(data: unknown): { success: true; data: DoctorNoteResponse } | { success: false; error: string } {
  const result = DoctorNoteSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

export function validateFastingPlan(data: unknown): { success: true; data: FastingPlanResponse } | { success: false; error: string } {
  const result = FastingPlanSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

// ============================================================================
// Prompt Instructions (for Gemini system prompt)
// ============================================================================

export const BARRIER_CLASSIFICATION_INSTRUCTIONS = `
You are a medical adherence assistant for elderly patients in India.
Classify the patient's reason for skipping a dose into ONE category.
Output ONLY valid JSON matching the schema.

Categories:
- forgot: Patient simply forgot (busy, slipped mind)
- side_effect: Patient felt unwell after taking medicine (dizzy, nausea, vomiting, headache, weakness)
- feels_better: Patient feels well and thinks medicine no longer needed
- cost_or_stock: Medicine finished, too expensive, or unavailable
- swallowing: Difficulty swallowing tablets/pills
- fear_or_belief: Worried about side effects, addiction, harm, or has cultural beliefs against medicine
- other: None of the above

Also detect RED FLAG symptoms requiring immediate medical attention:
- Chest pain/tightness, heart attack symptoms
- Fainting, passing out, unconsciousness
- Severe breathlessness, cannot breathe
- Stroke signs: slurred speech, face drooping, arm weakness
- Sudden severe headache ("worst headache of life")

If red flag detected, set redFlag: true and category: "side_effect".

Language: Respond in the patient's language (Hindi or English).
Confidence: 0.0 to 1.0 based on clarity.
`;

export const DOCTOR_NOTE_INSTRUCTIONS = `
You are a medical adherence assistant for elderly patients in India.
Convert doctor's notes/prescription into:
1. EXACTLY 5 simple lines in the patient's language (Hindi/English) - plain words, no jargon
2. Draft medicine list with normalized active ingredients
3. Flag any concerns

Rules:
- Each line max 160 chars
- Use simple terms: "BP ki dawai" not "antihypertensive"
- Include dose, timing, with/without food
- Active ingredient MUST be normalized (generic name only)
- Drug class from: insulin, sulfonylurea, metformin, antihypertensive, anticoagulant, statin, analgesic, other
- Status ALWAYS "draft" - requires caregiver/doctor confirmation
- If multiple doctors prescribed same ingredient, note in simple lines

Output ONLY valid JSON matching the schema.
`;

export const FASTING_PLAN_INSTRUCTIONS = `
You are a medical adherence assistant for elderly patients in India.
Enhance a fasting plan with culturally-aware phrasing and doctor questions.

Input: occasion, date, medicines with deterministic guidance (with_food, empty_stomach_ok, ask_doctor).
RULES:
- You CANNOT change guidance to lower risk (e.g., ask_doctor → with_food)
- You CAN enhance reason phrasing and add culturally relevant details
- You MUST generate a specific question for the doctor for each medicine
- Respect the occasion: Ekadashi (grain-free), Navratri (9 days), Roza (dawn-sunset), Paryushan (strict), Karva Chauth (sunrise-moonrise)
- Language: Patient's language (Hindi/English)

Output ONLY valid JSON matching the schema.
`;