/**
 * Shared types for Saathi — Elderly Medication Companion
 * All data is fictional. IDs are strings (readable slugs in memory, UUID in Supabase).
 */

// ============================================================================
// Core Enums & Unions
// ============================================================================

/** User role in the system */
export type Role = 'elder' | 'caregiver' | 'doctor';

/** Supported languages for UI and AI responses */
export type Language = 'en' | 'hi';

/** Barrier categories — the reason a dose was skipped */
export type Barrier =
  | 'forgot'
  | 'side_effect'
  | 'feels_better'
  | 'cost_or_stock'
  | 'swallowing'
  | 'fear_or_belief'
  | 'other';

/** Fasting occasions supported */
export type Occasion =
  | 'ekadashi'
  | 'navratri'
  | 'roza'
  | 'paryushan'
  | 'karva_chauth'
  | 'custom';

/** Guidance level for a medicine during fasting */
export type FastingGuidance = 'with_food' | 'empty_stomach_ok' | 'ask_doctor';

/** Drug classes that drive fasting rules */
export type DrugClass =
  | 'insulin'
  | 'sulfonylurea'
  | 'metformin'
  | 'antihypertensive'
  | 'anticoagulant'
  | 'statin'
  | 'analgesic'
  | 'other';

/** Medicine status: active = confirmed, draft = pending confirmation */
export type MedicineStatus = 'active' | 'draft';

/** Dose event status */
export type DoseStatus = 'pending' | 'taken' | 'skipped';

/** Alert severity levels */
export type AlertLevel = 'info' | 'warning' | 'urgent';

/** Fasting plan status */
export type PlanStatus = 'draft' | 'confirmed';

/** AI response source */
export type AISource = 'gemini' | 'fallback';

// ============================================================================
// Action Types (Barrier Engine Output)
// ============================================================================

export interface Action {
  /** Message shown to the elder */
  elderMessage: string;
  /** Optional alert sent to caregiver */
  caregiverAlert?: string;
  /** Optional note for doctor */
  doctorNote?: string;
  /** Optional reminder time shift in minutes */
  reminderShiftMinutes?: number;
  /** Optional refill alert for caregiver */
  refillAlert?: string;
}

// ============================================================================
// Entity Types
// ============================================================================

export interface Person {
  id: string;
  role: Role;
  name: string;
  language: Language;
  elderId?: string; // For caregivers/doctors: the elder they follow
}

export interface Medicine {
  id: string;
  elderId: string;
  name: string;
  activeIngredient: string; // Normalized lowercase, for overlap checks
  drugClass: DrugClass;
  doseText: string; // e.g., "500 mg"
  times: string[]; // e.g., ["08:00", "20:00"]
  withFood: boolean;
  prescribedBy: string; // Doctor name
  status: MedicineStatus;
}

export interface DoseEvent {
  id: string;
  medicineId: string;
  elderId: string;
  scheduledAt: string; // ISO string
  status: DoseStatus;
  actedAt?: string; // ISO string
}

export interface SkipReport {
  id: string;
  doseEventId: string;
  elderId: string;
  rawText: string; // Max 500 chars, sanitized
  language: Language;
  category: Barrier;
  confidence: number; // 0 to 1
  redFlag: boolean; // Severe symptom detected
  action: Action;
  source: AISource;
  createdAt: string; // ISO string
}

export interface VisitNote {
  id: string;
  elderId: string;
  rawText: string; // What the doctor said or prescription text
  simpleLines: string[]; // Exactly 5, in elder's language
  draftMedicines: Medicine[]; // status: "draft"
  overlaps: Overlap[]; // From deterministic checker
  source: AISource;
  createdAt: string; // ISO string
}

export interface Overlap {
  ingredient: string;
  medicines: string[]; // Medicine IDs
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FastingPlan {
  id: string;
  elderId: string;
  occasion: Occasion;
  date: string; // YYYY-MM-DD
  entries: FastingPlanEntry[];
  status: PlanStatus;
  confirmedBy?: string; // Person ID
  source: AISource;
}

export interface FastingPlanEntry {
  medicineId: string;
  guidance: FastingGuidance;
  reason: string;
  askDoctor: string; // Question for the doctor
}

export interface Alert {
  id: string;
  elderId: string;
  level: AlertLevel;
  reason: string; // Explainable text, e.g., "2 skips this week: dizziness after BP tablet"
  createdAt: string; // ISO string
  resolved: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SkipDoseRequest {
  doseEventId: string;
  elderId: string;
  text: string; // User's answer to "why?"
  language: Language;
}

export interface SkipDoseResponse {
  skipReport: SkipReport;
  action: Action;
  redFlag: boolean;
}

export interface DoctorNoteRequest {
  elderId: string;
  text: string; // Doctor's words or prescription text
  language: Language;
}

export interface DoctorNoteResponse {
  visitNote: VisitNote;
  simpleLines: string[];
  draftMedicines: Medicine[];
  overlaps: Overlap[];
}

export interface FastingPlanRequest {
  elderId: string;
  occasion: Occasion;
  date: string; // YYYY-MM-DD
  language: Language;
}

export interface FastingPlanResponse {
  plan: FastingPlan;
  entries: FastingPlanEntry[];
}

export interface ConfirmMedicineRequest {
  medicineId: string;
  elderId: string;
  confirmedBy: string; // Person ID (caregiver/doctor)
}

export interface ConfirmFastingPlanRequest {
  planId: string;
  elderId: string;
  confirmedBy: string; // Person ID (caregiver/doctor)
}

export interface ElderScheduleResponse {
  doses: (DoseEvent & { medicine: Medicine })[];
}

export interface ElderAlertsResponse {
  alerts: Alert[];
}

export interface CaregiverDashboardResponse {
  adherence: {
    last7Days: { date: string; taken: number; skipped: number; total: number }[];
    barrierBreakdown: Record<Barrier, number>;
  };
  activeAlerts: Alert[];
  pendingConfirmations: {
    medicines: Medicine[];
    fastingPlans: FastingPlan[];
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type BarrierCategoryMap = Record<Barrier, {
  label: string;
  labelHi: string;
  icon: string;
  typicalPhrases: string[];
}>;

export type DrugClassRiskMap = Record<DrugClass, {
  defaultGuidance: FastingGuidance;
  riskLevel: 'low' | 'medium' | 'high';
}>;

export type OccasionDisplayMap = Record<Occasion, {
  label: string;
  labelHi: string;
  description: string;
}>;