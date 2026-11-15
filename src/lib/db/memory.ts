/**
 * In-Memory Repository Implementation — Saathi
 * Zero-setup demo store. Resets on cold start. Seeded with fictional data.
 */

import { v4 as uuidv4 } from 'uuid';
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
  Barrier,
  Action,
} from '@/types';
import type { Repository, SeedData } from './repo';
import { Repository as RepoInterface } from './repo';

interface MemoryStore {
  people: Map<string, Person>;
  medicines: Map<string, Medicine>;
  doseEvents: Map<string, DoseEvent>;
  skipReports: Map<string, SkipReport>;
  visitNotes: Map<string, VisitNote>;
  fastingPlans: Map<string, FastingPlan>;
  alerts: Map<string, Alert>;
}

function createStore(): MemoryStore {
  return {
    people: new Map(),
    medicines: new Map(),
    doseEvents: new Map(),
    skipReports: new Map(),
    visitNotes: new Map(),
    fastingPlans: new Map(),
    alerts: new Map(),
  };
}

function generateId(): string {
  return uuidv4().slice(0, 8);
}

// Fixed IDs for seeded data (for testing/demo)
const SEED_ELDER_ID = 'elder1';
const SEED_CAREGIVER_ID = 'caregiver1';
const SEED_DOCTOR_ID = 'doctor1';

function nowISO(): string {
  return new Date().toISOString();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

// ============================================================================
// Fictional Seed Data
// ============================================================================

const SEED_PEOPLE: Omit<Person, 'id'>[] = [
  // Elder: Kamla Ben, 72, Vadodara
  { role: 'elder', name: 'Kamla Ben', language: 'hi', elderId: undefined },
  // Caregiver: Rahul, 40, son
  { role: 'caregiver', name: 'Rahul', language: 'hi', elderId: '' }, // filled after elder created
  // Doctor: Dr. Mehta
  { role: 'doctor', name: 'Dr. Mehta', language: 'en', elderId: '' }, // filled after elder created
];

const SEED_MEDICINES: Omit<Medicine, 'id' | 'elderId'>[] = [
  {
    name: 'Glycomet 500',
    activeIngredient: 'metformin',
    drugClass: 'metformin',
    doseText: '500 mg',
    times: ['08:00', '20:00'],
    withFood: true,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
  {
    name: 'Telma 40',
    activeIngredient: 'telmisartan',
    drugClass: 'antihypertensive',
    doseText: '40 mg',
    times: ['08:00'],
    withFood: false,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
  {
    name: 'Ecosprin 75',
    activeIngredient: 'aspirin',
    drugClass: 'anticoagulant',
    doseText: '75 mg',
    times: ['20:00'],
    withFood: true,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
  {
    name: 'Paracetamol 500',
    activeIngredient: 'paracetamol',
    drugClass: 'analgesic',
    doseText: '500 mg',
    times: ['14:00'],
    withFood: true,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
];

// Generate dose events for the last 7 days + today
function generateDoseEvents(elderId: string, medicines: Medicine[]): Omit<DoseEvent, 'id'>[] {
  const events: Omit<DoseEvent, 'id'>[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
    const date = addDays(today, dayOffset);
    const dateISO = date.toISOString();

    for (const med of medicines) {
      for (const timeStr of med.times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledAt = new Date(date);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Most doses taken, some skipped (for demo)
        const isSkipped = Math.random() < 0.15 && dayOffset < 0; // 15% skip rate, not today
        const status: DoseStatus = isSkipped ? 'skipped' : (dayOffset === 0 ? 'pending' : 'taken');
        const actedAt = status !== 'pending' ? new Date(scheduledAt.getTime() + Math.random() * 3600000).toISOString() : undefined;

        events.push({
          medicineId: med.id,
          elderId,
          scheduledAt: scheduledAt.toISOString(),
          status,
          actedAt,
        });
      }
    }
  }

  return events;
}

// ============================================================================
// In-Memory Repository Implementation
// ============================================================================

export class InMemoryRepository implements RepoInterface {
  private store: MemoryStore;
  private seeded = false;

  constructor() {
    this.store = createStore();
  }

  private async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    await this.seedData();
    this.seeded = true;
  }

  // ---- People ----
  async getPerson(id: string): Promise<Person | null> {
    await this.ensureSeeded();
    return this.store.people.get(id) ?? null;
  }

  async getPeopleByElder(elderId: string): Promise<Person[]> {
    await this.ensureSeeded();
    return Array.from(this.store.people.values()).filter(p => p.elderId === elderId);
  }

  async createPerson(person: Person): Promise<Person> {
    await this.ensureSeeded();
    this.store.people.set(person.id, person);
    return person;
  }

  // ---- Medicines ----
  async getMedicinesByElder(elderId: string): Promise<Medicine[]> {
    await this.ensureSeeded();
    return Array.from(this.store.medicines.values()).filter(m => m.elderId === elderId);
  }

  async getMedicine(id: string): Promise<Medicine | null> {
    await this.ensureSeeded();
    return this.store.medicines.get(id) ?? null;
  }

  async createMedicine(medicine: Medicine): Promise<Medicine> {
    await this.ensureSeeded();
    this.store.medicines.set(medicine.id, medicine);
    return medicine;
  }

  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine | null> {
    await this.ensureSeeded();
    const existing = this.store.medicines.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.store.medicines.set(id, updated);
    return updated;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    await this.ensureSeeded();
    return this.store.medicines.delete(id);
  }

  async confirmMedicine(id: string, confirmedBy: string): Promise<Medicine | null> {
    return this.updateMedicine(id, { status: 'active' });
  }

  // ---- Dose Events ----
  async getDoseEventsByElder(elderId: string, from?: Date, to?: Date): Promise<DoseEvent[]> {
    await this.ensureSeeded();
    let events = Array.from(this.store.doseEvents.values()).filter(e => e.elderId === elderId);
    if (from) events = events.filter(e => new Date(e.scheduledAt) >= from);
    if (to) events = events.filter(e => new Date(e.scheduledAt) <= to);
    return events.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  async getDoseEvent(id: string): Promise<DoseEvent | null> {
    await this.ensureSeeded();
    return this.store.doseEvents.get(id) ?? null;
  }

  async getTodaysDoseEvents(elderId: string): Promise<(DoseEvent & { medicine: Medicine })[]> {
    await this.ensureSeeded();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = addDays(today, 1);

    const events = await this.getDoseEventsByElder(elderId, today, tomorrow);
    const medicines = await this.getMedicinesByElder(elderId);
    const medMap = new Map(medicines.map(m => [m.id, m]));

    return events.map(e => ({
      ...e,
      medicine: medMap.get(e.medicineId)!,
    })).filter(e => e.medicine);
  }

  async createDoseEvent(event: DoseEvent): Promise<DoseEvent> {
    await this.ensureSeeded();
    this.store.doseEvents.set(event.id, event);
    return event;
  }

  async updateDoseEvent(id: string, updates: Partial<DoseEvent>): Promise<DoseEvent | null> {
    await this.ensureSeeded();
    const existing = this.store.doseEvents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.store.doseEvents.set(id, updated);
    return updated;
  }

  async markDoseTaken(id: string, actedAt: string): Promise<DoseEvent | null> {
    return this.updateDoseEvent(id, { status: 'taken', actedAt });
  }

  async markDoseSkipped(id: string, actedAt: string): Promise<DoseEvent | null> {
    return this.updateDoseEvent(id, { status: 'skipped', actedAt });
  }

  // ---- Skip Reports ----
  async createSkipReport(report: SkipReport): Promise<SkipReport> {
    await this.ensureSeeded();
    this.store.skipReports.set(report.id, report);
    return report;
  }

  async getSkipReportsByElder(elderId: string, limit = 50): Promise<SkipReport[]> {
    await this.ensureSeeded();
    return Array.from(this.store.skipReports.values())
      .filter(r => r.elderId === elderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getSkipReportsByDoseEvent(doseEventId: string): Promise<SkipReport[]> {
    await this.ensureSeeded();
    return Array.from(this.store.skipReports.values()).filter(r => r.doseEventId === doseEventId);
  }

  // ---- Visit Notes ----
  async createVisitNote(note: VisitNote): Promise<VisitNote> {
    await this.ensureSeeded();
    this.store.visitNotes.set(note.id, note);
    return note;
  }

  async getVisitNotesByElder(elderId: string): Promise<VisitNote[]> {
    await this.ensureSeeded();
    return Array.from(this.store.visitNotes.values())
      .filter(n => n.elderId === elderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ---- Fasting Plans ----
  async createFastingPlan(plan: FastingPlan): Promise<FastingPlan> {
    await this.ensureSeeded();
    this.store.fastingPlans.set(plan.id, plan);
    return plan;
  }

  async getFastingPlan(id: string): Promise<FastingPlan | null> {
    await this.ensureSeeded();
    return this.store.fastingPlans.get(id) ?? null;
  }

  async getFastingPlansByElder(elderId: string): Promise<FastingPlan[]> {
    await this.ensureSeeded();
    return Array.from(this.store.fastingPlans.values())
      .filter(p => p.elderId === elderId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async confirmFastingPlan(id: string, confirmedBy: string): Promise<FastingPlan | null> {
    const plan = this.store.fastingPlans.get(id);
    if (!plan) return null;
    const updated = { ...plan, status: 'confirmed' as PlanStatus, confirmedBy };
    this.store.fastingPlans.set(id, updated);
    return updated;
  }

  // ---- Alerts ----
  async createAlert(alert: Alert): Promise<Alert> {
    await this.ensureSeeded();
    this.store.alerts.set(alert.id, alert);
    return alert;
  }

  async getAlertsByElder(elderId: string, unresolvedOnly = false): Promise<Alert[]> {
    await this.ensureSeeded();
    return Array.from(this.store.alerts.values())
      .filter(a => a.elderId === elderId && (!unresolvedOnly || !a.resolved))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async resolveAlert(id: string): Promise<Alert | null> {
    await this.ensureSeeded();
    const alert = this.store.alerts.get(id);
    if (!alert) return null;
    const updated = { ...alert, resolved: true };
    this.store.alerts.set(id, updated);
    return updated;
  }

  // ---- Overlaps ----
  async findOverlaps(medicines: Medicine[]): Promise<Overlap[]> {
    // This is a pure function, but keeping it here for interface completeness
    // Actual implementation in overlap/checker.ts
    return [];
  }

  // ---- Seeding ----
  async seedData(): Promise<void> {
    if (this.seeded) return;

    // Create people with fixed IDs for testing
    const elder: Person = { id: SEED_ELDER_ID, ...SEED_PEOPLE[0] };
    this.store.people.set(elder.id, elder);

    const caregiver: Person = { id: SEED_CAREGIVER_ID, ...SEED_PEOPLE[1], elderId: elder.id };
    this.store.people.set(caregiver.id, caregiver);

    const doctor: Person = { id: SEED_DOCTOR_ID, ...SEED_PEOPLE[2], elderId: elder.id };
    this.store.people.set(doctor.id, doctor);

    // Create medicines
    const medicines: Medicine[] = SEED_MEDICINES.map(med => ({
      id: generateId(),
      elderId: SEED_ELDER_ID,
      ...med,
    }));

    for (const med of medicines) {
      this.store.medicines.set(med.id, med);
    }

    // Create dose events
    const doseEvents = generateDoseEvents(elder.id, medicines);
    const createdDoseEvents: DoseEvent[] = [];
    for (const de of doseEvents) {
      const event: DoseEvent = { id: generateId(), ...de };
      this.store.doseEvents.set(event.id, event);
      createdDoseEvents.push(event);
    }

    // Create a sample skip report (for demo)
    const skippedEvents = createdDoseEvents.filter(e => e.status === 'skipped');
    if (skippedEvents.length > 0) {
      const sampleEvent = skippedEvents[0];
      const skipReport: SkipReport = {
        id: generateId(),
        doseEventId: sampleEvent.id,
        elderId: elder.id,
        rawText: 'bhool gayi thi, chai peene ke baad yaad aaya',
        language: 'hi',
        category: 'forgot',
        confidence: 0.92,
        redFlag: false,
        action: {
          elderMessage: 'Koi baat nahi, maa. Agli baar chai ke saath dawai le lena.',
          caregiverAlert: 'Kamla Ben missed morning dose (forgot). Suggested anchoring to chai routine.',
          reminderShiftMinutes: 15,
        },
        source: 'fallback',
        createdAt: nowISO(),
      };
      this.store.skipReports.set(skipReport.id, skipReport);

      // Create corresponding alert
      const alert: Alert = {
        id: generateId(),
        elderId: elder.id,
        level: 'info',
        reason: 'Missed morning dose: forgot (anchored to chai routine)',
        createdAt: nowISO(),
        resolved: false,
      };
      this.store.alerts.set(alert.id, alert);
    }

    this.seeded = true;
  }

  async clearData(): Promise<void> {
    this.store = createStore();
    this.seeded = false;
    await this.seedData();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let repositoryInstance: InMemoryRepository | null = null;

export async function getRepository(): Promise<InMemoryRepository> {
  if (!repositoryInstance) {
    repositoryInstance = new InMemoryRepository();
    await repositoryInstance.seedData();
  }
  return repositoryInstance;
}

export function resetRepository(): void {
  repositoryInstance = null;
}