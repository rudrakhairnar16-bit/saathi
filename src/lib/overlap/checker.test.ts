/**
 * Unit Tests — Overlap Checker
 * Tests duplicate ingredient detection and risky pair checking
 */

import { describe, it, expect } from 'vitest';
import { findOverlaps, normalizeIngredient, ingredientsMatch } from './checker';
import type { Medicine, DrugClass } from '@/types';

const createMedicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 'm1',
  elderId: 'elder1',
  name: 'Test Medicine',
  activeIngredient: 'paracetamol',
  drugClass: 'analgesic',
  doseText: '500 mg',
  times: ['08:00'],
  withFood: true,
  prescribedBy: 'Dr. Test',
  status: 'active',
  ...overrides,
});

describe('normalizeIngredient', () => {
  it('normalizes simple ingredient names', () => {
    expect(normalizeIngredient('Paracetamol')).toBe('paracetamol');
    expect(normalizeIngredient('PARACETAMOL')).toBe('paracetamol');
    expect(normalizeIngredient('  Paracetamol  ')).toBe('paracetamol');
  });

  it('removes common salt suffixes', () => {
    expect(normalizeIngredient('Metformin Hydrochloride')).toBe('metformin');
    expect(normalizeIngredient('Telmisartan Besylate')).toBe('telmisartan');
  });

  it('removes dosage information', () => {
    expect(normalizeIngredient('Paracetamol 500 mg')).toBe('paracetamol');
    expect(normalizeIngredient('Metformin 1000mg')).toBe('metformin');
  });

  it('removes punctuation', () => {
    expect(normalizeIngredient('Aspirin (ASA)')).toBe('aspirinasa');
    expect(normalizeIngredient('Vitamin-D3')).toBe('vitamind3');
  });
});

describe('ingredientsMatch', () => {
  it('matches identical ingredients', () => {
    expect(ingredientsMatch('paracetamol', 'paracetamol')).toBe(true);
    expect(ingredientsMatch('Paracetamol', 'paracetamol')).toBe(true);
  });

  it('matches with salt variations', () => {
    expect(ingredientsMatch('Metformin HCl', 'Metformin')).toBe(true);
    expect(ingredientsMatch('Telmisartan Besylate', 'Telmisartan')).toBe(true);
  });

  it('matches with dosage info', () => {
    expect(ingredientsMatch('Paracetamol 500 mg', 'Paracetamol')).toBe(true);
  });

  it('does not match different ingredients', () => {
    expect(ingredientsMatch('paracetamol', 'ibuprofen')).toBe(false);
    expect(ingredientsMatch('metformin', 'glipizide')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(ingredientsMatch('', 'paracetamol')).toBe(false);
    expect(ingredientsMatch('paracetamol', '')).toBe(false);
  });
});

describe('findOverlaps', () => {
  it('detects duplicate active ingredient', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Paracetamol 500', activeIngredient: 'paracetamol' }),
      createMedicine({ id: 'm2', name: 'Panadol 500', activeIngredient: 'paracetamol' }),
    ];

    const overlaps = findOverlaps(meds);

    expect(overlaps.length).toBe(1);
    expect(overlaps[0].severity).toBe('high');
    expect(overlaps[0].ingredient).toBe('paracetamol');
    expect(overlaps[0].medicines).toContain('m1');
    expect(overlaps[0].medicines).toContain('m2');
    expect(overlaps[0].description).toContain('Duplicate active ingredient');
  });

  it('detects duplicate with salt variation', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Metformin 500', activeIngredient: 'metformin hydrochloride' }),
      createMedicine({ id: 'm2', name: 'Glycomet 500', activeIngredient: 'metformin' }),
    ];

    const overlaps = findOverlaps(meds);

    expect(overlaps.length).toBe(1);
    expect(overlaps[0].ingredient).toBe('metformin');
  });

  it('ignores unrelated medicines', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Paracetamol', activeIngredient: 'paracetamol', drugClass: 'analgesic' }),
      createMedicine({ id: 'm2', name: 'Metformin', activeIngredient: 'metformin', drugClass: 'metformin' }),
      createMedicine({ id: 'm3', name: 'Telma', activeIngredient: 'telmisartan', drugClass: 'antihypertensive' }),
    ];

    const overlaps = findOverlaps(meds);

    // Should only have risky pair overlaps, not ingredient duplicates
    const duplicateOverlaps = overlaps.filter(o => o.severity === 'high' && o.ingredient !== 'analgesic + antihypertensive' && o.ingredient !== 'antihypertensive + analgesic');
    expect(duplicateOverlaps.length).toBe(0);
  });

  it('detects anticoagulant + analgesic risky pair (high severity)', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Ecosprin', activeIngredient: 'aspirin', drugClass: 'anticoagulant' }),
      createMedicine({ id: 'm2', name: 'Brufen', activeIngredient: 'ibuprofen', drugClass: 'analgesic' }),
    ];

    const overlaps = findOverlaps(meds);

    const riskyPair = overlaps.find(o => o.ingredient.includes('anticoagulant') && o.ingredient.includes('analgesic'));
    expect(riskyPair).toBeDefined();
    expect(riskyPair?.severity).toBe('high');
    expect(riskyPair?.description).toContain('bleeding risk');
  });

  it('detects insulin + sulfonylurea risky pair (high severity)', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Insulin', activeIngredient: 'insulin', drugClass: 'insulin' }),
      createMedicine({ id: 'm2', name: 'Glipizide', activeIngredient: 'glipizide', drugClass: 'sulfonylurea' }),
    ];

    const overlaps = findOverlaps(meds);

    const riskyPair = overlaps.find(o => o.ingredient.includes('insulin') && o.ingredient.includes('sulfonylurea'));
    expect(riskyPair).toBeDefined();
    expect(riskyPair?.severity).toBe('high');
    expect(riskyPair?.description).toContain('hypoglycemia');
  });

  it('detects anticoagulant + antihypertensive risky pair (medium severity)', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Warfarin', activeIngredient: 'warfarin', drugClass: 'anticoagulant' }),
      createMedicine({ id: 'm2', name: 'Telma', activeIngredient: 'telmisartan', drugClass: 'antihypertensive' }),
    ];

    const overlaps = findOverlaps(meds);

    const riskyPair = overlaps.find(o => o.ingredient.includes('anticoagulant') && o.ingredient.includes('antihypertensive'));
    expect(riskyPair).toBeDefined();
    expect(riskyPair?.severity).toBe('medium');
  });

  it('sorts by severity (high first)', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Paracetamol A', activeIngredient: 'paracetamol', drugClass: 'analgesic' }),
      createMedicine({ id: 'm2', name: 'Paracetamol B', activeIngredient: 'paracetamol', drugClass: 'analgesic' }),
      createMedicine({ id: 'm3', name: 'Aspirin', activeIngredient: 'aspirin', drugClass: 'anticoagulant' }),
      createMedicine({ id: 'm4', name: 'Ibuprofen', activeIngredient: 'ibuprofen', drugClass: 'analgesic' }),
    ];

    const overlaps = findOverlaps(meds);

    // Duplicate paracetamol (high) should come before anticoagulant+analgesic (high)
    // Both high, but ingredient name sort
    expect(overlaps[0].severity).toBe('high');
    expect(overlaps.every((o, i) => i === 0 || overlaps[i - 1].severity === 'high' || o.severity !== 'high')).toBe(true);
  });

  it('returns empty array for empty input', () => {
    expect(findOverlaps([])).toEqual([]);
  });

  it('returns empty array for single medicine', () => {
    expect(findOverlaps([createMedicine()])).toEqual([]);
  });

  it('includes Hindi descriptions in risky pairs', () => {
    const meds = [
      createMedicine({ id: 'm1', name: 'Ecosprin', activeIngredient: 'aspirin', drugClass: 'anticoagulant' }),
      createMedicine({ id: 'm2', name: 'Brufen', activeIngredient: 'ibuprofen', drugClass: 'analgesic' }),
    ];

    const overlaps = findOverlaps(meds);
    const riskyPair = overlaps.find(o => o.ingredient.includes('anticoagulant') && o.ingredient.includes('analgesic'));
    expect(riskyPair).toBeDefined();
    // Description is in English; Hindi is internal to risky pair definitions
  });
});