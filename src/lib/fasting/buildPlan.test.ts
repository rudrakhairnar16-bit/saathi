/**
 * Unit Tests — Fasting Planner
 * Tests deterministic fasting guidance rules
 */

import { describe, it, expect } from 'vitest';
import { buildFastingPlan, getDefaultGuidance, isHighRiskDrugClass, DRUG_CLASS_RULES } from './buildPlan';
import type { Medicine, DrugClass, Occasion, FastingGuidance } from '@/types';

const mockMedicines: Medicine[] = [
  {
    id: 'm1',
    elderId: 'elder1',
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
    id: 'm2',
    elderId: 'elder1',
    name: 'Insulin',
    activeIngredient: 'insulin',
    drugClass: 'insulin',
    doseText: '10 units',
    times: ['08:00', '20:00'],
    withFood: true,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
  {
    id: 'm3',
    elderId: 'elder1',
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
    id: 'm4',
    elderId: 'elder1',
    name: 'Ecosprin 75',
    activeIngredient: 'aspirin',
    drugClass: 'anticoagulant',
    doseText: '75 mg',
    times: ['20:00'],
    withFood: true,
    prescribedBy: 'Dr. Mehta',
    status: 'active',
  },
];

describe('getDefaultGuidance', () => {
  it('returns ask_doctor for insulin on all occasions', () => {
    const occasions: Occasion[] = ['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom'];
    occasions.forEach(occasion => {
      expect(getDefaultGuidance('insulin', occasion)).toBe('ask_doctor');
    });
  });

  it('returns ask_doctor for sulfonylurea on all occasions', () => {
    const occasions: Occasion[] = ['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom'];
    occasions.forEach(occasion => {
      expect(getDefaultGuidance('sulfonylurea', occasion)).toBe('ask_doctor');
    });
  });

  it('returns ask_doctor for anticoagulant on all occasions', () => {
    const occasions: Occasion[] = ['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom'];
    occasions.forEach(occasion => {
      expect(getDefaultGuidance('anticoagulant', occasion)).toBe('ask_doctor');
    });
  });

  it('returns with_food for metformin on most occasions', () => {
    expect(getDefaultGuidance('metformin', 'ekadashi')).toBe('with_food');
    expect(getDefaultGuidance('metformin', 'navratri')).toBe('with_food');
    expect(getDefaultGuidance('metformin', 'roza')).toBe('with_food');
    expect(getDefaultGuidance('metformin', 'karva_chauth')).toBe('with_food');
    expect(getDefaultGuidance('metformin', 'custom')).toBe('with_food');
  });

  it('returns ask_doctor for metformin on paryushan (strict fast)', () => {
    expect(getDefaultGuidance('metformin', 'paryushan')).toBe('ask_doctor');
  });

  it('returns empty_stomach_ok for antihypertensive on ekadashi', () => {
    expect(getDefaultGuidance('antihypertensive', 'ekadashi')).toBe('empty_stomach_ok');
  });

  it('returns ask_doctor for antihypertensive on roza (dehydration risk)', () => {
    expect(getDefaultGuidance('antihypertensive', 'roza')).toBe('ask_doctor');
  });

  it('returns ask_doctor for antihypertensive on paryushan', () => {
    expect(getDefaultGuidance('antihypertensive', 'paryushan')).toBe('ask_doctor');
  });

  it('returns with_food for analgesic on most occasions', () => {
    expect(getDefaultGuidance('analgesic', 'ekadashi')).toBe('with_food');
    expect(getDefaultGuidance('analgesic', 'roza')).toBe('with_food');
  });

  it('returns ask_doctor for analgesic on paryushan', () => {
    expect(getDefaultGuidance('analgesic', 'paryushan')).toBe('ask_doctor');
  });
});

describe('isHighRiskDrugClass', () => {
  it('returns true for insulin', () => {
    expect(isHighRiskDrugClass('insulin')).toBe(true);
  });

  it('returns true for sulfonylurea', () => {
    expect(isHighRiskDrugClass('sulfonylurea')).toBe(true);
  });

  it('returns true for anticoagulant', () => {
    expect(isHighRiskDrugClass('anticoagulant')).toBe(true);
  });

  it('returns false for metformin', () => {
    expect(isHighRiskDrugClass('metformin')).toBe(false);
  });

  it('returns false for statin', () => {
    expect(isHighRiskDrugClass('statin')).toBe(false);
  });

  it('returns false for analgesic', () => {
    expect(isHighRiskDrugClass('analgesic')).toBe(false);
  });
});

describe('buildFastingPlan', () => {
  it('creates plan with correct structure', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    expect(result.plan.id).toBeDefined();
    expect(result.plan.elderId).toBe('elder1');
    expect(result.plan.occasion).toBe('ekadashi');
    expect(result.plan.date).toBe('2024-01-15');
    expect(result.plan.status).toBe('draft');
    expect(result.plan.source).toBe('fallback');
    expect(result.entries.length).toBe(4);
  });

  it('assigns ask_doctor to high-risk drugs (insulin)', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    const insulinEntry = result.entries.find(e => e.medicineId === 'm2');
    expect(insulinEntry?.guidance).toBe('ask_doctor');
    expect(insulinEntry?.askDoctor).toContain('insulin');
  });

  it('assigns ask_doctor to high-risk drugs (anticoagulant)', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    const aspirinEntry = result.entries.find(e => e.medicineId === 'm4');
    expect(aspirinEntry?.guidance).toBe('ask_doctor');
  });

  it('assigns with_food to metformin on ekadashi', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    const metforminEntry = result.entries.find(e => e.medicineId === 'm1');
    expect(metforminEntry?.guidance).toBe('with_food');
  });

  it('assigns empty_stomach_ok to antihypertensive on ekadashi', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    const bpEntry = result.entries.find(e => e.medicineId === 'm3');
    expect(bpEntry?.guidance).toBe('empty_stomach_ok');
  });

  it('includes reason and doctor question for each entry', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'en',
    });

    result.entries.forEach(entry => {
      expect(entry.reason).toBeTruthy();
      expect(entry.reason.length).toBeGreaterThan(10);
      expect(entry.askDoctor).toBeTruthy();
      expect(entry.askDoctor.length).toBeGreaterThan(10);
    });
  });

  it('filters out draft medicines', () => {
    const medicinesWithDraft = [
      ...mockMedicines,
      {
        id: 'm5',
        elderId: 'elder1',
        name: 'Draft Medicine',
        activeIngredient: 'test',
        drugClass: 'other' as DrugClass,
        doseText: '10 mg',
        times: ['08:00'],
        withFood: true,
        prescribedBy: 'Dr. Mehta',
        status: 'draft' as const,
      },
    ];

    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: medicinesWithDraft,
      language: 'en',
    });

    expect(result.entries.length).toBe(4); // draft medicine excluded
    expect(result.entries.find(e => e.medicineId === 'm5')).toBeUndefined();
  });

  it('generates Hindi guidance for Hindi language', () => {
    const result = buildFastingPlan({
      elderId: 'elder1',
      occasion: 'ekadashi',
      date: '2024-01-15',
      medicines: mockMedicines,
      language: 'hi',
    });

    // Reason and askDoctor should be in English (fallback), but structure is same
    expect(result.entries.length).toBe(4);
  });
});

describe('DRUG_CLASS_RULES completeness', () => {
  const allDrugClasses: DrugClass[] = [
    'insulin',
    'sulfonylurea',
    'metformin',
    'antihypertensive',
    'anticoagulant',
    'statin',
    'analgesic',
    'other',
  ];

  const allOccasions: Occasion[] = [
    'ekadashi',
    'navratri',
    'roza',
    'paryushan',
    'karva_chauth',
    'custom',
  ];

  it('has rules for all drug classes', () => {
    allDrugClasses.forEach(dc => {
      expect(DRUG_CLASS_RULES[dc]).toBeDefined();
    });
  });

  it('has guidance for all occasions for each drug class', () => {
    allDrugClasses.forEach(dc => {
      const rule = DRUG_CLASS_RULES[dc];
      allOccasions.forEach(occasion => {
        expect(rule.defaultGuidance[occasion]).toBeDefined();
        expect(rule.doctorQuestions[occasion]).toBeDefined();
        expect(rule.reasoning[occasion]).toBeDefined();
      });
    });
  });

  it('high risk classes have ask_doctor for all occasions', () => {
    (['insulin', 'sulfonylurea', 'anticoagulant'] as DrugClass[]).forEach(dc => {
      const rule = DRUG_CLASS_RULES[dc];
      allOccasions.forEach(occasion => {
        expect(rule.defaultGuidance[occasion]).toBe('ask_doctor');
      });
    });
  });
});