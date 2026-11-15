/**
 * Supabase Repository Implementation — Saathi
 * Persistent storage for production deployments.
 * Implements the Repository interface from repo.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
import { v4 as uuidv4 } from 'uuid';

// Supabase client singleton
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

// ============================================================================
// Type Mappers (DB ↔ Domain)
// ============================================================================

function mapPersonFromDB(row: any): Person {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    language: row.language,
    elderId: row.elder_id,
  };
}

function mapPersonToDB(person: Person): any {
  return {
    id: person.id,
    role: person.role,
    name: person.name,
    language: person.language,
    elder_id: person.elderId,
  };
}

function mapMedicineFromDB(row: any): Medicine {
  return {
    id: row.id,
    elderId: row.elder_id,
    name: row.name,
    activeIngredient: row.active_ingredient,
    drugClass: row.drug_class,
    doseText: row.dose_text,
    times: row.times,
    withFood: row.with_food,
    prescribedBy: row.prescribed_by,
    status: row.status,
  };
}

function mapMedicineToDB(medicine: Medicine): any {
  return {
    id: medicine.id,
    elder_id: medicine.elderId,
    name: medicine.name,
    active_ingredient: medicine.activeIngredient,
    drug_class: medicine.drugClass,
    dose_text: medicine.doseText,
    times: medicine.times,
    with_food: medicine.withFood,
    prescribed_by: medicine.prescribedBy,
    status: medicine.status,
  };
}

function mapDoseEventFromDB(row: any): DoseEvent {
  return {
    id: row.id,
    medicineId: row.medicine_id,
    elderId: row.elder_id,
    scheduledAt: row.scheduled_at,
    status: row.status,
    actedAt: row.acted_at,
  };
}

function mapDoseEventToDB(event: DoseEvent): any {
  return {
    id: event.id,
    medicine_id: event.medicineId,
    elder_id: event.elderId,
    scheduled_at: event.scheduledAt,
    status: event.status,
    acted_at: event.actedAt,
  };
}

function mapSkipReportFromDB(row: any): SkipReport {
  return {
    id: row.id,
    doseEventId: row.dose_event_id,
    elderId: row.elder_id,
    rawText: row.raw_text,
    language: row.language,
    category: row.category,
    confidence: row.confidence,
    redFlag: row.red_flag,
    action: row.action,
    source: row.source,
    createdAt: row.created_at,
  };
}

function mapSkipReportToDB(report: SkipReport): any {
  return {
    id: report.id,
    dose_event_id: report.doseEventId,
    elder_id: report.elderId,
    raw_text: report.rawText,
    language: report.language,
    category: report.category,
    confidence: report.confidence,
    red_flag: report.redFlag,
    action: report.action,
    source: report.source,
    created_at: report.createdAt,
  };
}

function mapVisitNoteFromDB(row: any): VisitNote {
  return {
    id: row.id,
    elderId: row.elder_id,
    rawText: row.raw_text,
    simpleLines: row.simple_lines,
    draftMedicines: row.draft_medicines,
    overlaps: row.overlaps,
    source: row.source,
    createdAt: row.created_at,
  };
}

function mapVisitNoteToDB(note: VisitNote): any {
  return {
    id: note.id,
    elder_id: note.elderId,
    raw_text: note.rawText,
    simple_lines: note.simpleLines,
    draft_medicines: note.draftMedicines,
    overlaps: note.overlaps,
    source: note.source,
    created_at: note.createdAt,
  };
}

function mapFastingPlanFromDB(row: any): FastingPlan {
  return {
    id: row.id,
    elderId: row.elder_id,
    occasion: row.occasion,
    date: row.date,
    entries: row.entries,
    status: row.status,
    source: row.source,
    confirmedBy: row.confirmed_by,
  };
}

function mapFastingPlanToDB(plan: FastingPlan): any {
  return {
    id: plan.id,
    elder_id: plan.elderId,
    occasion: plan.occasion,
    date: plan.date,
    entries: plan.entries,
    status: plan.status,
    source: plan.source,
    confirmed_by: plan.confirmedBy,
  };
}

function mapAlertFromDB(row: any): Alert {
  return {
    id: row.id,
    elderId: row.elder_id,
    level: row.level,
    reason: row.reason,
    createdAt: row.created_at,
    resolved: row.resolved,
  };
}

function mapAlertToDB(alert: Alert): any {
  return {
    id: alert.id,
    elder_id: alert.elderId,
    level: alert.level,
    reason: alert.reason,
    created_at: alert.createdAt,
    resolved: alert.resolved,
  };
}

// ============================================================================
// Supabase Repository Implementation
// ============================================================================

export class SupabaseRepository implements Repository {
  private sb: SupabaseClient;

  constructor() {
    this.sb = getSupabase();
  }

  // ---- People ----
  async getPerson(id: string): Promise<Person | null> {
    const { data, error } = await this.sb.from('people').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapPersonFromDB(data);
  }

  async getPeopleByElder(elderId: string): Promise<Person[]> {
    const { data, error } = await this.sb.from('people').select('*').eq('elder_id', elderId);
    if (error || !data) return [];
    return data.map(mapPersonFromDB);
  }

  async createPerson(person: Person): Promise<Person> {
    const { data, error } = await this.sb.from('people').insert(mapPersonToDB(person)).select().single();
    if (error) throw error;
    return mapPersonFromDB(data);
  }

  // ---- Medicines ----
  async getMedicinesByElder(elderId: string): Promise<Medicine[]> {
    const { data, error } = await this.sb.from('medicines').select('*').eq('elder_id', elderId);
    if (error || !data) return [];
    return data.map(mapMedicineFromDB);
  }

  async getMedicine(id: string): Promise<Medicine | null> {
    const { data, error } = await this.sb.from('medicines').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapMedicineFromDB(data);
  }

  async createMedicine(medicine: Medicine): Promise<Medicine> {
    const { data, error } = await this.sb.from('medicines').insert(mapMedicineToDB(medicine)).select().single();
    if (error) throw error;
    return mapMedicineFromDB(data);
  }

  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine | null> {
    const { data, error } = await this.sb.from('medicines').update(mapMedicineToDB(updates as Medicine)).eq('id', id).select().single();
    if (error || !data) return null;
    return mapMedicineFromDB(data);
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const { error } = await this.sb.from('medicines').delete().eq('id', id);
    return !error;
  }

  async confirmMedicine(id: string, confirmedBy: string): Promise<Medicine | null> {
    return this.updateMedicine(id, { status: 'active' });
  }

  // ---- Dose Events ----
  async getDoseEventsByElder(elderId: string, from?: Date, to?: Date): Promise<DoseEvent[]> {
    let query = this.sb.from('dose_events').select('*').eq('elder_id', elderId);
    if (from) query = query.gte('scheduled_at', from.toISOString());
    if (to) query = query.lte('scheduled_at', to.toISOString());
    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error || !data) return [];
    return data.map(mapDoseEventFromDB);
  }

  async getDoseEvent(id: string): Promise<DoseEvent | null> {
    const { data, error } = await this.sb.from('dose_events').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDoseEventFromDB(data);
  }

  async getTodaysDoseEvents(elderId: string): Promise<(DoseEvent & { medicine: Medicine })[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.getDoseEventsByElder(elderId, today, tomorrow);
    const medicines = await this.getMedicinesByElder(elderId);
    const medMap = new Map(medicines.map(m => [m.id, m]));

    return events.map(e => ({
      ...e,
      medicine: medMap.get(e.medicineId)!,
    })).filter(e => e.medicine);
  }

  async createDoseEvent(event: DoseEvent): Promise<DoseEvent> {
    const { data, error } = await this.sb.from('dose_events').insert(mapDoseEventToDB(event)).select().single();
    if (error) throw error;
    return mapDoseEventFromDB(data);
  }

  async updateDoseEvent(id: string, updates: Partial<DoseEvent>): Promise<DoseEvent | null> {
    const { data, error } = await this.sb.from('dose_events').update(mapDoseEventToDB(updates as DoseEvent)).eq('id', id).select().single();
    if (error || !data) return null;
    return mapDoseEventFromDB(data);
  }

  async markDoseTaken(id: string, actedAt: string): Promise<DoseEvent | null> {
    return this.updateDoseEvent(id, { status: 'taken', actedAt });
  }

  async markDoseSkipped(id: string, actedAt: string): Promise<DoseEvent | null> {
    return this.updateDoseEvent(id, { status: 'skipped', actedAt });
  }

  // ---- Skip Reports ----
  async createSkipReport(report: SkipReport): Promise<SkipReport> {
    const { data, error } = await this.sb.from('skip_reports').insert(mapSkipReportToDB(report)).select().single();
    if (error) throw error;
    return mapSkipReportFromDB(data);
  }

  async getSkipReportsByElder(elderId: string, limit = 50): Promise<SkipReport[]> {
    const { data, error } = await this.sb
      .from('skip_reports')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(mapSkipReportFromDB);
  }

  async getSkipReportsByDoseEvent(doseEventId: string): Promise<SkipReport[]> {
    const { data, error } = await this.sb.from('skip_reports').select('*').eq('dose_event_id', doseEventId);
    if (error || !data) return [];
    return data.map(mapSkipReportFromDB);
  }

  // ---- Visit Notes ----
  async createVisitNote(note: VisitNote): Promise<VisitNote> {
    const { data, error } = await this.sb.from('visit_notes').insert(mapVisitNoteToDB(note)).select().single();
    if (error) throw error;
    return mapVisitNoteFromDB(data);
  }

  async getVisitNotesByElder(elderId: string): Promise<VisitNote[]> {
    const { data, error } = await this.sb.from('visit_notes').select('*').eq('elder_id', elderId).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapVisitNoteFromDB);
  }

  // ---- Fasting Plans ----
  async createFastingPlan(plan: FastingPlan): Promise<FastingPlan> {
    const { data, error } = await this.sb.from('fasting_plans').insert(mapFastingPlanToDB(plan)).select().single();
    if (error) throw error;
    return mapFastingPlanFromDB(data);
  }

  async getFastingPlan(id: string): Promise<FastingPlan | null> {
    const { data, error } = await this.sb.from('fasting_plans').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapFastingPlanFromDB(data);
  }

  async getFastingPlansByElder(elderId: string): Promise<FastingPlan[]> {
    const { data, error } = await this.sb.from('fasting_plans').select('*').eq('elder_id', elderId).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapFastingPlanFromDB);
  }

  async confirmFastingPlan(id: string, confirmedBy: string): Promise<FastingPlan | null> {
    return this.updateFastingPlan(id, { status: 'confirmed', confirmedBy });
  }

  private async updateFastingPlan(id: string, updates: Partial<FastingPlan>): Promise<FastingPlan | null> {
    const { data, error } = await this.sb.from('fasting_plans').update(mapFastingPlanToDB(updates as FastingPlan)).eq('id', id).select().single();
    if (error || !data) return null;
    return mapFastingPlanFromDB(data);
  }

  // ---- Alerts ----
  async createAlert(alert: Alert): Promise<Alert> {
    const { data, error } = await this.sb.from('alerts').insert(mapAlertToDB(alert)).select().single();
    if (error) throw error;
    return mapAlertFromDB(data);
  }

  async getAlertsByElder(elderId: string, unresolvedOnly = false): Promise<Alert[]> {
    let query = this.sb.from('alerts').select('*').eq('elder_id', elderId);
    if (unresolvedOnly) query = query.eq('resolved', false);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapAlertFromDB);
  }

  async resolveAlert(id: string): Promise<Alert | null> {
    const { data, error } = await this.sb.from('alerts').update({ resolved: true }).eq('id', id).select().single();
    if (error || !data) return null;
    return mapAlertFromDB(data);
  }

  // ---- Overlaps ----
  async findOverlaps(medicines: Medicine[]): Promise<Overlap[]> {
    // This is a pure function, keeping for interface completeness
    // Actual implementation in overlap/checker.ts
    return [];
  }

  // ---- Seeding ----
  async seedData(): Promise<void> {
    // Check if already seeded
    const { data: existing } = await this.sb.from('people').select('id').limit(1);
    if (existing && existing.length > 0) return;

    const sb = this.sb;

    // Create people
    const elderId = 'elder1';
    const caregiverId = 'caregiver1';
    const doctorId = 'doctor1';

    await sb.from('people').insert([
      { id: elderId, role: 'elder', name: 'Kamla Ben', language: 'hi', elder_id: null },
      { id: caregiverId, role: 'caregiver', name: 'Rahul', language: 'hi', elder_id: elderId },
      { id: doctorId, role: 'doctor', name: 'Dr. Mehta', language: 'en', elder_id: elderId },
    ]);

    // Create medicines
    const medicines = [
      {
        id: 'med1', elder_id: elderId, name: 'Glycomet 500', active_ingredient: 'metformin',
        drug_class: 'metformin', dose_text: '500 mg', times: ['08:00', '20:00'], with_food: true,
        prescribed_by: 'Dr. Mehta', status: 'active',
      },
      {
        id: 'med2', elder_id: elderId, name: 'Telma 40', active_ingredient: 'telmisartan',
        drug_class: 'antihypertensive', dose_text: '40 mg', times: ['08:00'], with_food: false,
        prescribed_by: 'Dr. Mehta', status: 'active',
      },
      {
        id: 'med3', elder_id: elderId, name: 'Ecosprin 75', active_ingredient: 'aspirin',
        drug_class: 'anticoagulant', dose_text: '75 mg', times: ['20:00'], with_food: true,
        prescribed_by: 'Dr. Mehta', status: 'active',
      },
      {
        id: 'med4', elder_id: elderId, name: 'Paracetamol 500', active_ingredient: 'paracetamol',
        drug_class: 'analgesic', dose_text: '500 mg', times: ['14:00'], with_food: true,
        prescribed_by: 'Dr. Mehta', status: 'active',
      },
    ];
    await sb.from('medicines').insert(medicines);

    // Create dose events for last 7 days + today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const doseEvents = [];

    for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      for (const med of medicines) {
        for (const timeStr of med.times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledAt = new Date(date);
          scheduledAt.setHours(hours, minutes, 0, 0);

          const isSkipped = Math.random() < 0.15 && dayOffset < 0;
          const status = isSkipped ? 'skipped' : (dayOffset === 0 ? 'pending' : 'taken');
          const actedAt = status !== 'pending' ? new Date(scheduledAt.getTime() + Math.random() * 3600000).toISOString() : undefined;

          doseEvents.push({
            id: `de_${uuidv4().slice(0, 8)}`,
            medicine_id: med.id,
            elder_id: elderId,
            scheduled_at: scheduledAt.toISOString(),
            status,
            acted_at: actedAt,
          });
        }
      }
    }
    await sb.from('dose_events').insert(doseEvents);

    // Create a sample skip report
    const skippedEvents = doseEvents.filter(e => e.status === 'skipped');
    if (skippedEvents.length > 0) {
      const sampleEvent = skippedEvents[0];
      await sb.from('skip_reports').insert({
        id: `sr_${uuidv4().slice(0, 8)}`,
        dose_event_id: sampleEvent.id,
        elder_id: elderId,
        raw_text: 'bhool gayi thi, chai peene ke baad yaad aaya',
        language: 'hi',
        category: 'forgot',
        confidence: 0.92,
        red_flag: false,
        action: {
          elderMessage: 'Koi baat nahi, maa. Agli baar chai ke saath dawai le lena.',
          caregiverAlert: 'Kamla Ben missed morning dose (forgot). Suggested anchoring to chai routine.',
          reminderShiftMinutes: 15,
        },
        source: 'fallback',
        created_at: new Date().toISOString(),
      });

      await sb.from('alerts').insert({
        id: `alert_${uuidv4().slice(0, 8)}`,
        elder_id: elderId,
        level: 'info',
        reason: 'Missed morning dose: forgot (anchored to chai routine)',
        created_at: new Date().toISOString(),
        resolved: false,
      });
    }
  }

  async clearData(): Promise<void> {
    const tables = ['alerts', 'fasting_plans', 'visit_notes', 'skip_reports', 'dose_events', 'medicines', 'people'];
    for (const table of tables) {
      await this.sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    await this.seedData();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let repositoryInstance: SupabaseRepository | null = null;

export async function getSupabaseRepository(): Promise<SupabaseRepository> {
  if (!repositoryInstance) {
    repositoryInstance = new SupabaseRepository();
    await repositoryInstance.seedData();
  }
  return repositoryInstance;
}

export function resetSupabaseRepository(): void {
  repositoryInstance = null;
}