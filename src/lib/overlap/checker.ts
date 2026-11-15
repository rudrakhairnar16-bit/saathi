/**
 * Medicine Overlap & Interaction Checker — Saathi
 * Pure deterministic functions for finding duplicate ingredients and risky pairs.
 * Runs on every doctor note and fasting plan as a safety net.
 */

import type { Medicine, Overlap, DrugClass } from '@/types';

// ============================================================================
// Active Ingredient Normalization
// ============================================================================

/**
 * Normalizes an ingredient name for comparison.
 * Lowercase, remove spaces, punctuation, common suffixes.
 */
export function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .trim()
    // Remove common salt/suffix variations
    .replace(/\s*(hydrochloride|hcl|besylate|maleate|fumarate|succinate|tartrate|citrate|phosphate|sodium|potassium|calcium|magnesium)\b/g, '')
    // Remove dosage info
    .replace(/\d+\.?\d*\s*(mg|mcg|g|ml|units?)/g, '')
    // Remove punctuation and extra spaces
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks if two normalized ingredients are the same.
 */
export function ingredientsMatch(ing1: string, ing2: string): boolean {
  const norm1 = normalizeIngredient(ing1);
  const norm2 = normalizeIngredient(ing2);
  return norm1 === norm2 && norm1.length > 0;
}

// ============================================================================
// Risky Drug Pair Definitions
// ============================================================================

export interface RiskyPair {
  classA: DrugClass;
  classB: DrugClass;
  severity: 'medium' | 'high';
  description: string;
  descriptionHi: string;
}

export const RISKY_PAIRS: RiskyPair[] = [
  {
    classA: 'anticoagulant',
    classB: 'analgesic',
    severity: 'high',
    description: 'NSAIDs (painkillers) increase bleeding risk with blood thinners.',
    descriptionHi: 'दर्दनिवारक (NSAIDs) खून पतला करने वाली दवाओं के साथ रक्तस्राव का खतरा बढ़ाते हैं।',
  },
  {
    classA: 'anticoagulant',
    classB: 'antihypertensive',
    severity: 'medium',
    description: 'Some BP medicines may interact with blood thinners. Monitor closely.',
    descriptionHi: 'कुछ BP दवाएं खून पतला करने वाली दवाओं के साथ इंटरैक्ट कर सकती हैं। निगरानी रखें।',
  },
  {
    classA: 'insulin',
    classB: 'sulfonylurea',
    severity: 'high',
    description: 'Both lower blood sugar. Combined use dramatically increases hypoglycemia risk.',
    descriptionHi: 'दोनों ब्लड शुगर कम करते हैं। साथ में लेने से हाइपोग्लाइसीमिया (कम शुगर) का खतरा बहुत बढ़ जाता है।',
  },
  {
    classA: 'insulin',
    classB: 'antihypertensive',
    severity: 'medium',
    description: 'Some BP medicines (beta-blockers) can mask hypoglycemia symptoms.',
    descriptionHi: 'कुछ BP दवाएं (बीटा-ब्लॉकर्स) कम शुगर के लक्षण छिपा सकती हैं।',
  },
  {
    classA: 'sulfonylurea',
    classB: 'antihypertensive',
    severity: 'medium',
    description: 'Beta-blockers can mask hypoglycemia caused by sulfonylureas.',
    descriptionHi: 'बीटा-ब्लॉकर्स सल्फोनिलयूरिया से होने वाले कम शुगर के लक्षण छिपा सकते हैं।',
  },
];

// ============================================================================
// Main Overlap Checker
// ============================================================================

/**
 * Finds duplicate active ingredients and risky class pairs across medicines.
 * Returns Overlap objects with severity and explanations.
 */
export function findOverlaps(medicines: Medicine[]): Overlap[] {
  const overlaps: Overlap[] = [];

  // 1. Check for duplicate active ingredients
  const ingredientMap = new Map<string, Medicine[]>();

  for (const med of medicines) {
    const normalized = normalizeIngredient(med.activeIngredient);
    if (!normalized) continue;

    const existing = ingredientMap.get(normalized) || [];
    existing.push(med);
    ingredientMap.set(normalized, existing);
  }

  for (const [ingredient, meds] of ingredientMap.entries()) {
    if (meds.length > 1) {
      overlaps.push({
        ingredient,
        medicines: meds.map(m => m.id),
        severity: 'high',
        description: `Duplicate active ingredient "${ingredient}" found in ${meds.length} medicines: ${meds.map(m => m.name).join(', ')}. Risk of overdose.`,
      });
    }
  }

  // 2. Check for risky drug class pairs
  for (const pair of RISKY_PAIRS) {
    const medsA = medicines.filter(m => m.drugClass === pair.classA);
    const medsB = medicines.filter(m => m.drugClass === pair.classB);

    if (medsA.length > 0 && medsB.length > 0) {
      // Check if same medicine has both classes (unlikely but possible)
      const overlappingMeds = [...medsA, ...medsB];

      overlaps.push({
        ingredient: `${pair.classA} + ${pair.classB}`,
        medicines: overlappingMeds.map(m => m.id),
        severity: pair.severity,
        description: pair.description,
      });
    }
  }

  // 3. Sort by severity (high first) then by ingredient name
  return overlaps.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.ingredient.localeCompare(b.ingredient);
  });
}

// ============================================================================
// Helper: Check if specific medicine has overlaps
// ============================================================================

export function getOverlapsForMedicine(medicineId: string, allOverlaps: Overlap[]): Overlap[] {
  return allOverlaps.filter(o => o.medicines.includes(medicineId));
}

// ============================================================================
// Helper: Get highest severity
// ============================================================================

export function getMaxSeverity(overlaps: Overlap[]): 'high' | 'medium' | 'low' | null {
  if (overlaps.length === 0) return null;
  const severities = overlaps.map(o => o.severity);
  if (severities.includes('high')) return 'high';
  if (severities.includes('medium')) return 'medium';
  return 'low';
}