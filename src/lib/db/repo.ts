/**
 * Repository Interface — Saathi
 * Pure abstraction over data storage. Implementations: in-memory (default) or Supabase.
 */

import type {
  Person,
  Medicine,
  DoseEvent,
  SkipReport,
  VisitNote,
  FastingPlan,
  Alert,
  Overlap,
  Language,
  Role,
  DrugClass,
  MedicineStatus,
  DoseStatus,
  PlanStatus,
  AlertLevel,
} from '@/types';

export interface Repository {
  // ---- People ----
  getPerson(id: string): Promise<Person | null>;
  getPeopleByElder(elderId: string): Promise<Person[]>;
  createPerson(person: Person): Promise<Person>;

  // ---- Medicines ----
  getMedicinesByElder(elderId: string): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine | null>;
  createMedicine(medicine: Medicine): Promise<Medicine>;
  updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine | null>;
  deleteMedicine(id: string): Promise<boolean>;
  confirmMedicine(id: string, confirmedBy: string): Promise<Medicine | null>;

  // ---- Dose Events ----
  getDoseEventsByElder(elderId: string, from?: Date, to?: Date): Promise<DoseEvent[]>;
  getDoseEvent(id: string): Promise<DoseEvent | null>;
  getTodaysDoseEvents(elderId: string): Promise<(DoseEvent & { medicine: Medicine })[]>;
  createDoseEvent(event: DoseEvent): Promise<DoseEvent>;
  updateDoseEvent(id: string, updates: Partial<DoseEvent>): Promise<DoseEvent | null>;
  markDoseTaken(id: string, actedAt: string): Promise<DoseEvent | null>;
  markDoseSkipped(id: string, actedAt: string): Promise<DoseEvent | null>;

  // ---- Skip Reports ----
  createSkipReport(report: SkipReport): Promise<SkipReport>;
  getSkipReportsByElder(elderId: string, limit?: number): Promise<SkipReport[]>;
  getSkipReportsByDoseEvent(doseEventId: string): Promise<SkipReport[]>;

  // ---- Visit Notes ----
  createVisitNote(note: VisitNote): Promise<VisitNote>;
  getVisitNotesByElder(elderId: string): Promise<VisitNote[]>;

  // ---- Fasting Plans ----
  createFastingPlan(plan: FastingPlan): Promise<FastingPlan>;
  getFastingPlan(id: string): Promise<FastingPlan | null>;
  getFastingPlansByElder(elderId: string): Promise<FastingPlan[]>;
  confirmFastingPlan(id: string, confirmedBy: string): Promise<FastingPlan | null>;

  // ---- Alerts ----
  createAlert(alert: Alert): Promise<Alert>;
  getAlertsByElder(elderId: string, unresolvedOnly?: boolean): Promise<Alert[]>;
  resolveAlert(id: string): Promise<Alert | null>;

  // ---- Overlaps ----
  findOverlaps(medicines: Medicine[]): Promise<Overlap[]>;

  // ---- Seeding ----
  seedData(): Promise<void>;
  clearData(): Promise<void>;
}

// ---- Factory Function Type ----
export type RepositoryFactory = () => Promise<Repository>;

// ---- In-Memory Seed Data Shape ----
export interface SeedData {
  people: Person[];
  medicines: Medicine[];
  doseEvents: DoseEvent[];
}