#!/usr/bin/env npx tsx
/**
 * Seed Script — Saathi
 * Populates Supabase with realistic demo data for 10 users
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load env
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key);

const ELDER_NAMES = [
  { name: 'Kamla Ben', nameHi: 'कमला बेन', age: 72, city: 'Vadodara' },
  { name: 'Ramesh Chandra', nameHi: 'रमेश चंद्र', age: 68, city: 'Ahmedabad' },
  { name: 'Sunita Devi', nameHi: 'सुनीता देवी', age: 75, city: 'Surat' },
  { name: 'Mohan Lal', nameHi: 'मोहन लाल', age: 70, city: 'Rajkot' },
  { name: 'Geeta Bai', nameHi: 'गीता बाई', age: 73, city: 'Bhavnagar' },
  { name: 'Harish Patel', nameHi: 'हरीश पटेल', age: 69, city: 'Jamnagar' },
  { name: 'Lakshmi Narayan', nameHi: 'लक्ष्मी नारायण', age: 71, city: 'Junagadh' },
  { name: 'Radha Krishna', nameHi: 'राधा कृष्ण', age: 74, city: 'Gandhinagar' },
  { name: 'Vijay Kumar', nameHi: 'विजय कुमार', age: 67, city: 'Anand' },
  { name: 'Meera Bai', nameHi: 'मीरा बाई', age: 76, city: 'Nadiad' },
];

const CAREGIVER_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Neha', 'Sanjay', 'Kavita', 'Rohit', 'Pooja', 'Vikram', 'Anjali'
];

const DOCTORS = [
  { name: 'Dr. Mehta', specialty: 'Cardiology' },
  { name: 'Dr. Shah', specialty: 'Diabetology' },
  { name: 'Dr. Patel', specialty: 'Geriatrics' },
  { name: 'Dr. Desai', specialty: 'Internal Medicine' },
  { name: 'Dr. Joshi', specialty: 'Neurology' },
];

const MEDICINE_TEMPLATES = [
  { name: 'Glycomet 500', ingredient: 'metformin', class: 'metformin', dose: '500 mg', times: ['08:00', '20:00'], food: true },
  { name: 'Telma 40', ingredient: 'telmisartan', class: 'antihypertensive', dose: '40 mg', times: ['08:00'], food: false },
  { name: 'Ecosprin 75', ingredient: 'aspirin', class: 'anticoagulant', dose: '75 mg', times: ['20:00'], food: true },
  { name: 'Paracetamol 500', ingredient: 'paracetamol', class: 'analgesic', dose: '500 mg', times: ['14:00'], food: true },
  { name: 'Atorva 10', ingredient: 'atorvastatin', class: 'statin', dose: '10 mg', times: ['20:00'], food: true },
  { name: 'Glimestar 1', ingredient: 'glimepiride', class: 'sulfonylurea', dose: '1 mg', times: ['08:00'], food: true },
  { name: 'Shelcal 500', ingredient: 'calcium carbonate', class: 'supplement', dose: '500 mg', times: ['12:00'], food: true },
  { name: 'Pantop 40', ingredient: 'pantoprazole', class: 'ppi', dose: '40 mg', times: ['07:00'], food: false },
];

const SKIP_REASONS = [
  { text: 'bhool gayi thi, chai peene ke baad yaad aaya', category: 'forgot', lang: 'hi' },
  { text: 'forgot to take it with breakfast', category: 'forgot', lang: 'en' },
  { text: 'chakkar aaya dawai khane ke baad', category: 'side_effect', lang: 'hi' },
  { text: 'felt dizzy and nauseous after medicine', category: 'side_effect', lang: 'en' },
  { text: 'ab theek hoon, dawai ki zaroorat nahi', category: 'feels_better', lang: 'hi' },
  { text: 'feeling much better now, dont need it', category: 'feels_better', lang: 'en' },
  { text: 'dawai khatam ho gayi, mehengi bhi hai', category: 'cost_or_stock', lang: 'hi' },
  { text: 'medicine finished, too expensive to refill', category: 'cost_or_stock', lang: 'en' },
  { text: 'goli badi hai, nigalne mein dikkat hoti hai', category: 'swallowing', lang: 'hi' },
  { text: 'tablet too big, hard to swallow', category: 'swallowing', lang: 'en' },
  { text: 'darr lagta hai side effects se', category: 'fear_or_belief', lang: 'hi' },
  { text: 'worried about long term side effects', category: 'fear_or_belief', lang: 'en' },
];

const OCCASIONS = ['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth'];

function generateId(): string {
  return uuidv4().slice(0, 8);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function clearAllData() {
  console.log('🧹 Clearing existing data...');
  const tables = ['alerts', 'fasting_plans', 'visit_notes', 'skip_reports', 'dose_events', 'medicines', 'people'];
  for (const table of tables) {
    await sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
  console.log('✅ Cleared');
}

async function seedUsers() {
  console.log('👥 Seeding 10 users...');

  for (let i = 0; i < 10; i++) {
    const elder = ELDER_NAMES[i];
    const elderId = `elder${i + 1}`;
    const caregiverId = `caregiver${i + 1}`;
    const doctorId = `doctor${i + 1}`;

    // Create people
    await sb.from('people').insert([
      { id: elderId, role: 'elder', name: elder.name, language: 'hi', elder_id: null },
      { id: caregiverId, role: 'caregiver', name: CAREGIVER_NAMES[i], language: 'hi', elder_id: elderId },
      { id: doctorId, role: 'doctor', name: DOCTORS[i % DOCTORS.length].name, language: 'en', elder_id: elderId },
    ]);

    // Create medicines (2-4 per elder)
    const medCount = 2 + (i % 3);
    const medicines = [];
    for (let j = 0; j < medCount; j++) {
      const template = MEDICINE_TEMPLATES[(i + j) % MEDICINE_TEMPLATES.length];
      const medId = `med_${elderId}_${j + 1}`;
      medicines.push({
        id: medId,
        elder_id: elderId,
        name: template.name,
        active_ingredient: template.ingredient,
        drug_class: template.class,
        dose_text: template.dose,
        times: template.times,
        with_food: template.food,
        prescribed_by: DOCTORS[i % DOCTORS.length].name,
        status: 'active',
      });
    }
    await sb.from('medicines').insert(medicines);

    // Create dose events for last 14 days + today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const doseEvents = [];

    for (let dayOffset = -13; dayOffset <= 0; dayOffset++) {
      const date = addDays(today, dayOffset);

      for (const med of medicines) {
        for (const timeStr of med.times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduledAt = new Date(date);
          scheduledAt.setHours(hours, minutes, 0, 0);

          // Realistic adherence: 85% taken, 10% skipped, 5% pending (today)
          let status: 'taken' | 'skipped' | 'pending';
          let actedAt: string | undefined;

          if (dayOffset === 0) {
            status = 'pending';
          } else {
            const rand = Math.random();
            if (rand < 0.85) {
              status = 'taken';
              actedAt = new Date(scheduledAt.getTime() + Math.random() * 7200000).toISOString(); // within 2 hours
            } else if (rand < 0.95) {
              status = 'skipped';
              actedAt = new Date(scheduledAt.getTime() + Math.random() * 86400000).toISOString(); // same day
            } else {
              status = 'taken';
              actedAt = new Date(scheduledAt.getTime() + Math.random() * 7200000).toISOString();
            }
          }

          doseEvents.push({
            id: generateId(),
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

    // Create skip reports for skipped doses
    const skippedEvents = doseEvents.filter(e => e.status === 'skipped');
    const skipReports = [];

    for (const event of skippedEvents.slice(0, 8)) { // Limit to 8 skip reports per elder
      const reason = SKIP_REASONS[Math.floor(Math.random() * SKIP_REASONS.length)];
      const isRedFlag = reason.category === 'side_effect' && Math.random() < 0.3;

      skipReports.push({
        id: generateId(),
        dose_event_id: event.id,
        elder_id: elderId,
        raw_text: reason.text,
        language: reason.lang,
        category: reason.category,
        confidence: 0.85 + Math.random() * 0.1,
        red_flag: isRedFlag,
        action: {
          elderMessage: reason.lang === 'hi'
            ? 'Koi baat nahi. Agli baar yaad se le lena.'
            : 'No worries. Try to remember next time.',
          caregiverAlert: `${elder.name} missed dose (${reason.category}). Suggested follow-up.`,
          reminderShiftMinutes: 15,
        },
        source: 'fallback',
        created_at: new Date(event.acted_at || event.scheduled_at).toISOString(),
      });

      // Create alert for side effects and cost issues
      if (isRedFlag || reason.category === 'side_effect' || reason.category === 'cost_or_stock') {
        await sb.from('alerts').insert({
          id: generateId(),
          elder_id: elderId,
          level: isRedFlag ? 'urgent' : reason.category === 'side_effect' ? 'warning' : 'info',
          reason: `${skipReports.length} skips this week: ${reason.category} - ${reason.text.substring(0, 50)}`,
          created_at: new Date(event.acted_at || event.scheduled_at).toISOString(),
          resolved: false,
        });
      }
    }
    await sb.from('skip_reports').insert(skipReports);

    // Create 1-2 visit notes per elder
    const visitNotes = [];
    for (let v = 0; v < 1 + (i % 2); v++) {
      const medNames = medicines.slice(0, 2).map(m => m.name).join(', ');
      visitNotes.push({
        id: generateId(),
        elder_id: elderId,
        raw_text: `Patient reviewed. Continue ${medNames}. Follow up in 3 months.`,
        simple_lines: [
          'Doctor reviewed medicines.',
          'All current medicines continued.',
          'Follow up in 3 months.',
          'Take medicines on time.',
          'Report any side effects.',
        ],
        draft_medicines: [],
        overlaps: [],
        source: 'fallback',
        created_at: new Date(today.getTime() - (30 + v * 15) * 86400000).toISOString(),
      });
    }
    await sb.from('visit_notes').insert(visitNotes);

    // Create 1-2 fasting plans per elder
    const fastingPlans = [];
    for (let f = 0; f < 1 + (i % 2); f++) {
      const occasion = OCCASIONS[(i + f) % OCCASIONS.length];
      const planDate = addDays(today, 7 + f * 14);

      // Build plan entries
      const entries = medicines.map(med => {
        // Simple guidance logic
        let guidance: 'with_food' | 'empty_stomach_ok' | 'ask_doctor';
        if (med.drug_class === 'anticoagulant' || med.drug_class === 'sulfonylurea') {
          guidance = 'ask_doctor';
        } else if (med.with_food) {
          guidance = 'with_food';
        } else {
          guidance = 'empty_stomach_ok';
        }

        return {
          medicineId: med.id,
          guidance,
          reason: guidance === 'ask_doctor'
            ? 'High-risk medicine. Doctor must review before fasting.'
            : guidance === 'with_food'
              ? 'Take with post-sunset meal. Avoid empty stomach.'
              : 'Can be taken empty stomach. Take with water.',
          askDoctor: guidance === 'ask_doctor'
            ? `Should ${med.name} be adjusted during ${occasion}?`
            : '',
        };
      });

      fastingPlans.push({
        id: generateId(),
        elder_id: elderId,
        occasion,
        date: planDate.toISOString().split('T')[0],
        entries,
        status: f === 0 ? 'draft' : 'confirmed',
        source: 'fallback',
        confirmed_by: f === 1 ? caregiverId : null,
        created_at: new Date(today.getTime() - f * 7 * 86400000).toISOString(),
      });
    }
    await sb.from('fasting_plans').insert(fastingPlans);

    console.log(`  ✅ ${elder.name} (${elderId}) - ${medicines.length} meds, ${skippedEvents.length} skips, ${skipReports.length} reports`);
  }
}

async function main() {
  console.log('🌱 Starting seed for 10 users...\n');

  await clearAllData();
  await seedUsers();

  console.log('\n🎉 Seed complete! 10 elders with realistic data ready.');
  console.log('\n📊 Summary:');
  console.log('  - 10 elders (Hindi names, ages 67-76)');
  console.log('  - 10 caregivers (English names)');
  console.log('  - 5 doctors (rotating specialties)');
  console.log('  - 2-4 medicines per elder (real Indian brands)');
  console.log('  - 14 days dose history (85% adherence)');
  console.log('  - Skip reports with all 7 barrier categories');
  console.log('  - Visit notes and fasting plans');
  console.log('  - Alerts for side effects and cost issues');
}

main().catch(console.error);