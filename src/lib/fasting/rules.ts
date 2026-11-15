/**
 * Fasting Rules — Saathi Vrat-Roza-Tyohar Planner
 * Pure data tables and types for fasting guidance.
 * Deterministic rules that AI CANNOT override (only enhance phrasing).
 */

import type { DrugClass, FastingGuidance, Occasion, FastingPlanEntry } from '@/types';

// ============================================================================
// Occasion Metadata
// ============================================================================

export interface OccasionInfo {
  id: Occasion;
  label: string;
  labelHi: string;
  description: string;
  defaultDateOffset?: number; // Days from today for demo
}

export const OCCASIONS: Record<Occasion, OccasionInfo> = {
  ekadashi: {
    id: 'ekadashi',
    label: 'Ekadashi',
    labelHi: 'एकादशी',
    description: 'Hindu fasting day (twice monthly). Usually grain-free, some allow fruits/milk.',
    defaultDateOffset: 3,
  },
  navratri: {
    id: 'navratri',
    label: 'Navratri',
    labelHi: 'नवरात्रि',
    description: '9-day Hindu festival. Many fast during day, eat after sunset.',
    defaultDateOffset: 10,
  },
  roza: {
    id: 'roza',
    label: 'Roza / Ramadan',
    labelHi: 'रोज़ा / रमज़ान',
    description: 'Islamic month of fasting. No food/water from dawn to sunset.',
    defaultDateOffset: 15,
  },
  paryushan: {
    id: 'paryushan',
    label: 'Paryushan',
    labelHi: 'पर्युषण',
    description: 'Jain festival of forgiveness. Strict fasting, often boiled water only.',
    defaultDateOffset: 20,
  },
  karva_chauth: {
    id: 'karva_chauth',
    label: 'Karva Chauth',
    labelHi: 'करवा चौथ',
    description: 'Hindu festival. Married women fast from sunrise to moonrise.',
    defaultDateOffset: 25,
  },
  custom: {
    id: 'custom',
    label: 'Custom Fasting Day',
    labelHi: 'अन्य उपवास',
    description: 'Any other fasting practice. Specify details.',
    defaultDateOffset: 1,
  },
};

// ============================================================================
// Drug Class Risk & Default Guidance
// ============================================================================

export interface DrugClassRule {
  drugClass: DrugClass;
  // Default guidance per occasion (AI can enhance phrasing but NOT lower risk)
  defaultGuidance: Record<Occasion, FastingGuidance>;
  // Questions AI should generate for doctor
  doctorQuestions: Record<Occasion, string>;
  // Risk level (high = always ask_doctor)
  riskLevel: 'low' | 'medium' | 'high';
  // Reason for default guidance
  reasoning: Record<Occasion, string>;
}

export const DRUG_CLASS_RULES: Record<DrugClass, DrugClassRule> = {
  insulin: {
    drugClass: 'insulin',
    defaultGuidance: {
      ekadashi: 'ask_doctor',
      navratri: 'ask_doctor',
      roza: 'ask_doctor',
      paryushan: 'ask_doctor',
      karva_chauth: 'ask_doctor',
      custom: 'ask_doctor',
    },
    doctorQuestions: {
      ekadashi: 'How should insulin dose/timing change on Ekadashi (grain-free, may eat fruits/milk)?',
      navratri: 'How to adjust insulin during 9-day Navratri fast (daytime fasting, eat after sunset)?',
      roza: 'How to manage insulin during Ramadan (no food/water dawn to sunset)?',
      paryushan: 'How to adjust insulin during Paryushan (strict fast, boiled water only)?',
      karva_chauth: 'How to manage insulin on Karva Chauth (sunrise to moonrise fast)?',
      custom: 'How should insulin be adjusted for this fasting practice?',
    },
    riskLevel: 'high',
    reasoning: {
      ekadashi: 'Insulin requires precise carb matching. Fasting changes carb intake dramatically.',
      navratri: 'Extended fasting days require insulin regimen adjustment to prevent hypoglycemia.',
      roza: 'Ramadan fasting (no water/food 12-16 hrs) is high risk for insulin users.',
      paryushan: 'Paryushan strict fast (often water-only) is dangerous with insulin.',
      karva_chauth: 'Day-long fast without water requires insulin dose modification.',
      custom: 'Insulin always requires doctor guidance for any fasting.',
    },
  },
  sulfonylurea: {
    drugClass: 'sulfonylurea',
    defaultGuidance: {
      ekadashi: 'ask_doctor',
      navratri: 'ask_doctor',
      roza: 'ask_doctor',
      paryushan: 'ask_doctor',
      karva_chauth: 'ask_doctor',
      custom: 'ask_doctor',
    },
    doctorQuestions: {
      ekadashi: 'Should sulfonylurea dose be reduced on Ekadashi to prevent low blood sugar?',
      navratri: 'How to adjust sulfonylurea during Navratri fasting days?',
      roza: 'Is it safe to take sulfonylurea during Ramadan fast? Dose adjustment needed?',
      paryushan: 'Can sulfonylurea be taken during Paryushan strict fast?',
      karva_chauth: 'Should sulfonylurea be skipped or reduced on Karva Chauth?',
      custom: 'Does this fasting practice require sulfonylurea dose change?',
    },
    riskLevel: 'high',
    reasoning: {
      ekadashi: 'Sulfonylureas stimulate insulin release — high hypoglycemia risk during fasting.',
      navratri: 'Multi-day fasting dramatically increases hypoglycemia risk with sulfonylureas.',
      roza: 'Long daily fasts (12-16 hrs) are dangerous with sulfonylureas.',
      paryushan: 'Strict fast with sulfonylureas carries severe hypoglycemia risk.',
      karva_chauth: 'Day-long fast without water/food requires sulfonylurea adjustment.',
      custom: 'Sulfonylureas always need doctor guidance for fasting.',
    },
  },
  metformin: {
    drugClass: 'metformin',
    defaultGuidance: {
      ekadashi: 'with_food',
      navratri: 'with_food',
      roza: 'with_food',
      paryushan: 'ask_doctor',
      karva_chauth: 'with_food',
      custom: 'with_food',
    },
    doctorQuestions: {
      ekadashi: 'Can metformin be taken with the small meals allowed on Ekadashi (fruits/milk)?',
      navratri: 'Should metformin timing shift to post-sunset meal during Navratri?',
      roza: 'Can metformin be taken at Suhoor (pre-dawn) and Iftar (sunset) during Ramadan?',
      paryushan: 'Is metformin safe during Paryushan strict fast (boiled water only)?',
      karva_chauth: 'Should metformin be taken at the pre-dawn meal before Karva Chauth fast?',
      custom: 'How should metformin be timed for this fasting practice?',
    },
    riskLevel: 'low',
    reasoning: {
      ekadashi: 'Metformin with food reduces GI upset. Take with allowed Ekadashi meals.',
      navratri: 'Take with the post-sunset meal. Generally safe but timing shifts.',
      roza: 'Take at Suhoor and Iftar with food. Monitor for GI symptoms.',
      paryushan: 'Strict fast (water-only) — cannot take with food. Doctor guidance needed.',
      karva_chauth: 'Take with pre-dawn meal. Generally safe with food.',
      custom: 'Metformin should be taken with food when possible.',
    },
  },
  antihypertensive: {
    drugClass: 'antihypertensive',
    defaultGuidance: {
      ekadashi: 'empty_stomach_ok',
      navratri: 'empty_stomach_ok',
      roza: 'ask_doctor',
      paryushan: 'ask_doctor',
      karva_chauth: 'empty_stomach_ok',
      custom: 'empty_stomach_ok',
    },
    doctorQuestions: {
      ekadashi: 'Can BP medicine be taken on empty stomach during Ekadashi?',
      navratri: 'Should BP medicine timing change during Navratri fasting?',
      roza: 'How to time BP meds during Ramadan (no water dawn to sunset)?',
      paryushan: 'Is BP medicine safe during Paryushan strict fast?',
      karva_chauth: 'Can BP medicine be taken before sunrise on Karva Chauth?',
      custom: 'Any timing changes needed for BP medicine during this fast?',
    },
    riskLevel: 'medium',
    reasoning: {
      ekadashi: 'Most BP meds can be taken empty stomach. Monitor for dizziness.',
      navratri: 'Generally okay empty stomach. Take at consistent time.',
      roza: 'No water for 12-16 hrs — dehydration risk with diuretics. Doctor must adjust.',
      paryushan: 'Strict fast — dehydration risk. Doctor guidance required.',
      karva_chauth: 'Take with pre-dawn water. Monitor BP.',
      custom: 'Most antihypertensives okay empty stomach unless diuretic.',
    },
  },
  anticoagulant: {
    drugClass: 'anticoagulant',
    defaultGuidance: {
      ekadashi: 'ask_doctor',
      navratri: 'ask_doctor',
      roza: 'ask_doctor',
      paryushan: 'ask_doctor',
      karva_chauth: 'ask_doctor',
      custom: 'ask_doctor',
    },
    doctorQuestions: {
      ekadashi: 'Any diet restrictions (vitamin K foods) on Ekadashi with anticoagulants?',
      navratri: 'Does Navratri diet (specific foods) affect anticoagulant dosing?',
      roza: 'How to manage anticoagulant during Ramadan (timing, diet changes)?',
      paryushan: 'Is anticoagulant safe during Paryushan strict fast?',
      karva_chauth: 'Any special precautions for anticoagulant on Karva Chauth?',
      custom: 'Does this fasting practice affect anticoagulant management?',
    },
    riskLevel: 'high',
    reasoning: {
      ekadashi: 'Diet changes (vitamin K) affect anticoagulant levels. INR monitoring needed.',
      navratri: 'Special Navratri diet may interact. Doctor should review.',
      roza: 'Major diet/timing change. Anticoagulants need careful management.',
      paryushan: 'Strict fast affects absorption and diet. High risk.',
      karva_chauth: 'Day-long fast may affect medication levels.',
      custom: 'Anticoagulants always require doctor guidance for fasting.',
    },
  },
  statin: {
    drugClass: 'statin',
    defaultGuidance: {
      ekadashi: 'empty_stomach_ok',
      navratri: 'empty_stomach_ok',
      roza: 'empty_stomach_ok',
      paryushan: 'empty_stomach_ok',
      karva_chauth: 'empty_stomach_ok',
      custom: 'empty_stomach_ok',
    },
    doctorQuestions: {
      ekadashi: 'Can statin be taken on Ekadashi fast?',
      navratri: 'Should statin timing change during Navratri?',
      roza: 'Can statin be taken at Suhoor during Ramadan?',
      paryushan: 'Is statin safe during Paryushan?',
      karva_chauth: 'Can statin be taken before Karva Chauth fast?',
      custom: 'Any concerns with statin during this fast?',
    },
    riskLevel: 'low',
    reasoning: {
      ekadashi: 'Statins can be taken empty stomach. No major fasting concerns.',
      navratri: 'Generally safe during fasting. Take at usual time.',
      roza: 'Take at Suhoor (pre-dawn). No food required.',
      paryushan: 'Can be taken with water. Low risk.',
      karva_chauth: 'Take with pre-dawn water. Safe.',
      custom: 'Statins generally safe during fasting.',
    },
  },
  analgesic: {
    drugClass: 'analgesic',
    defaultGuidance: {
      ekadashi: 'with_food',
      navratri: 'with_food',
      roza: 'with_food',
      paryushan: 'ask_doctor',
      karva_chauth: 'with_food',
      custom: 'with_food',
    },
    doctorQuestions: {
      ekadashi: 'Can pain medicine be taken with the small meals on Ekadashi?',
      navratri: 'Should pain medicine timing shift to post-sunset meal?',
      roza: 'Can pain medicine be taken at Suhoor/Iftar during Ramadan?',
      paryushan: 'Is pain medicine safe during Paryushan strict fast?',
      karva_chauth: 'Can pain medicine be taken with pre-dawn meal?',
      custom: 'How to time pain medicine for this fast?',
    },
    riskLevel: 'low',
    reasoning: {
      ekadashi: 'NSAIDs/analgesics need food to protect stomach. Take with allowed meals.',
      navratri: 'Take with post-sunset meal. Avoid empty stomach.',
      roza: 'Take at Suhoor and Iftar with food. Stomach protection needed.',
      paryushan: 'Strict fast (water-only) — cannot take with food safely. Doctor needed.',
      karva_chauth: 'Take with pre-dawn meal. With food.',
      custom: 'Analgesics should be taken with food when possible.',
    },
  },
  other: {
    drugClass: 'other',
    defaultGuidance: {
      ekadashi: 'with_food',
      navratri: 'with_food',
      roza: 'with_food',
      paryushan: 'ask_doctor',
      karva_chauth: 'with_food',
      custom: 'with_food',
    },
    doctorQuestions: {
      ekadashi: 'How should this medicine be taken on Ekadashi?',
      navratri: 'Any timing changes for this medicine during Navratri?',
      roza: 'How to manage this medicine during Ramadan?',
      paryushan: 'Is this medicine safe during Paryushan?',
      karva_chauth: 'Can this medicine be taken on Karva Chauth?',
      custom: 'Any special instructions for this medicine during fasting?',
    },
    riskLevel: 'low',
    reasoning: {
      ekadashi: 'Default to with food for safety. Doctor can confirm.',
      navratri: 'Default to with food. Take with post-sunset meal.',
      roza: 'Default to with food at Suhoor/Iftar.',
      paryushan: 'Strict fast — unknown medicine. Doctor guidance required.',
      karva_chauth: 'Default to with food at pre-dawn meal.',
      custom: 'Default to with food unless doctor says otherwise.',
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getDrugClassRule(drugClass: DrugClass): DrugClassRule {
  return DRUG_CLASS_RULES[drugClass] || DRUG_CLASS_RULES.other;
}

export function getDefaultGuidance(drugClass: DrugClass, occasion: Occasion): FastingGuidance {
  return getDrugClassRule(drugClass).defaultGuidance[occasion];
}

export function getDoctorQuestion(drugClass: DrugClass, occasion: Occasion): string {
  return getDrugClassRule(drugClass).doctorQuestions[occasion];
}

export function getReasoning(drugClass: DrugClass, occasion: Occasion): string {
  return getDrugClassRule(drugClass).reasoning[occasion];
}

export function getRiskLevel(drugClass: DrugClass): 'low' | 'medium' | 'high' {
  return getDrugClassRule(drugClass).riskLevel;
}

export function isHighRiskDrugClass(drugClass: DrugClass): boolean {
  return getRiskLevel(drugClass) === 'high';
}