/**
 * Barrier Engine Types — Saathi
 * Pure types for the "Kyun Chhoda?" (Why Skipped?) engine
 */

import type { Barrier, Action, Language, AISource } from '@/types';

// ============================================================================
// Barrier Category Metadata
// ============================================================================

export interface BarrierCategory {
  id: Barrier;
  label: string;      // English label
  labelHi: string;    // Hindi label (Devanagari)
  icon: string;       // Emoji/icon for tap cards
  typicalPhrases: {
    en: string[];
    hi: string[];
    mixed: string[];
  };
  defaultAction: Omit<Action, 'elderMessage'>; // elderMessage is context-dependent
  severity: 'low' | 'medium' | 'high';
}

export const BARRIER_CATEGORIES: Record<Barrier, BarrierCategory> = {
  forgot: {
    id: 'forgot',
    label: 'Forgot',
    labelHi: 'भूल गई',
    icon: '🧠',
    typicalPhrases: {
      en: ['forgot', 'didnt remember', 'slipped my mind', 'busy', 'forgot to take'],
      hi: ['bhool gayi', 'bhool gaya', 'yaad nahi', 'bhool gaye', 'yaad nahi aaya', 'vyast thi', 'भूल गई', 'भूल गया', 'याद नहीं', 'याद नहीं आया', 'व्यस्त थी'],
      mixed: ['bhool gayi thi', 'forgot to take', 'yaad nahi raha'],
    },
    defaultAction: {
      caregiverAlert: 'Missed dose due to forgetting. Suggested anchoring to a daily routine.',
      reminderShiftMinutes: 15,
    },
    severity: 'low',
  },
  side_effect: {
    id: 'side_effect',
    label: 'Felt Unwell',
    labelHi: 'तबीयत खराब लगी',
    icon: '🤢',
    typicalPhrases: {
      en: ['dizzy', 'nausea', 'vomiting', 'sick', 'unwell', 'side effect', 'reaction', 'dizzy after', 'headache'],
      hi: ['chakkar', 'ulti', 'ghabrahat', 'tabiyat kharab', 'side effect', 'reaction', 'sir dard', 'kamjori', 'चक्कर', 'उल्टी', 'घबराहट', 'तबीयत खराब', 'सिर दर्द', 'कमजोरी'],
      mixed: ['dizzy feel hua', 'side effect hua', 'chakkar aaya'],
    },
    defaultAction: {
      caregiverAlert: 'Reported side effect. Flagged for doctor review. Never advise stopping medication.',
      doctorNote: 'Patient reported side effect after dose. Please review medication.',
    },
    severity: 'high',
  },
  feels_better: {
    id: 'feels_better',
    label: 'Feel Better Now',
    labelHi: 'अब ठीक हूँ',
    icon: '😊',
    typicalPhrases: {
      en: ['feel better', 'feeling fine', 'no need', 'cured', 'better now', 'dont need'],
      hi: ['ab theek hoon', 'theek hoon', 'zaroorat nahi', 'ab theek', 'swasth hoon', 'अब ठीक हूँ', 'ठीक हूँ', 'जरूरत नहीं', 'अब ठीक', 'स्वस्थ हूँ'],
      mixed: ['feel better ab', 'theek ho gayi'],
    },
    defaultAction: {
      caregiverAlert: 'Patient feels better and questions need for medicine. Provided explanation about chronic condition management.',
      doctorNote: 'Patient expressed feeling better and questioning medication necessity.',
    },
    severity: 'medium',
  },
  cost_or_stock: {
    id: 'cost_or_stock',
    label: 'Medicine Finished / Costly',
    labelHi: 'दवा खत्म / महंगी',
    icon: '💊',
    typicalPhrases: {
      en: ['finished', 'out of stock', 'expensive', 'costly', 'cannot afford', 'khatam', 'paisa nahi'],
      hi: ['khatam', 'khatam ho gayi', 'mahngi', 'paisa nahi', 'stock nahi', 'kharch nahi', 'खत्म', 'खत्म हो गई', 'महंगी', 'पैसा नहीं', 'स्टॉक नहीं', 'खर्च नहीं'],
      mixed: ['medicine khatam', 'cost zyada', 'stock over'],
    },
    defaultAction: {
      caregiverAlert: 'Medicine finished or cost concern. Refill alert sent. Suggested asking doctor about lower-cost options.',
      refillAlert: 'Medicine stock low or cost concern reported.',
      doctorNote: 'Patient reported medicine cost/availability issue. Consider generic alternative.',
    },
    severity: 'medium',
  },
  swallowing: {
    id: 'swallowing',
    label: 'Hard to Swallow',
    labelHi: 'निगलने में दिक्कत',
    icon: '😖',
    typicalPhrases: {
      en: ['hard to swallow', 'cannot swallow', 'choking', 'big tablet', 'swallowing problem'],
      hi: ['nigalne mein dikkat', 'nigal nahi paati', 'badi goli', 'gala mein fasti', 'निगलने में दिक्कत', 'निगल नहीं पाती', 'बड़ी गोली', 'गले में फंसती'],
      mixed: ['swallow karne mein problem', 'tablet badi hai'],
    },
    defaultAction: {
      caregiverAlert: 'Difficulty swallowing reported. Suggested asking doctor about syrup/crushable/alternate form.',
      doctorNote: 'Patient has difficulty swallowing tablets. Please consider alternative formulation.',
    },
    severity: 'medium',
  },
  fear_or_belief: {
    id: 'fear_or_belief',
    label: 'Worried About It',
    labelHi: 'चिंता / डर',
    icon: '😟',
    typicalPhrases: {
      en: ['worried', 'scared', 'afraid', 'addiction', 'habit', 'side effects later', 'fear', 'darr'],
      hi: ['darr', 'chinta', 'aadat padh jayegi', 'nuksan', 'side effect hoga', 'ghabhrahat', 'डर', 'चिंता', 'आदत पड़ जाएगी', 'नुकसान', 'साइड इफेक्ट होगा', 'घबराहट'],
      mixed: ['darr lagta hai', 'worried about side effects'],
    },
    defaultAction: {
      caregiverAlert: 'Fear or belief-based hesitation. Provided empathetic explanation. Family heads-up sent.',
      doctorNote: 'Patient expressed fear/belief about medication. Counseling recommended.',
    },
    severity: 'medium',
  },
  other: {
    id: 'other',
    label: 'Something Else',
    labelHi: 'कुछ और',
    icon: '❓',
    typicalPhrases: {
      en: [],
      hi: [],
      mixed: [],
    },
    defaultAction: {
      caregiverAlert: 'Skip reason not categorized. Follow-up suggested.',
    },
    severity: 'low',
  },
};

// ============================================================================
// Red-Flag Symptoms (override everything)
// ============================================================================

export const RED_FLAG_SYMPTOMS = {
  en: [
    'chest pain',
    'chest tightness',
    'heart attack',
    'fainting',
    'passed out',
    'unconscious',
    'breathless',
    'shortness of breath',
    'cannot breathe',
    'stroke',
    'slurred speech',
    'face droop',
    'arm weakness',
    'severe headache',
    'worst headache',
  ],
  hi: [
    'seene mein dard',
    'seene mein dbav',
    'heart attack',
    'behoshi',
    'behosh',
    'gir padi',
    'saans nahi',
    'saans phulna',
    'dam ghutna',
    'stroke',
    'lakwa',
    'munh tedha',
    'haath kamjor',
    'teji sar dard',
    'sabse bura sar dard',
    'सीने में दर्द',
    'सीने में दबाव',
    'बेहोशी',
    'बेहोश',
    'गिर पड़ी',
    'सांस नहीं',
    'सांस फूलना',
    'दम घुटना',
    'लकवा',
    'मुंह टेढ़ा',
    'हाथ कमजोर',
    'तेज़ सर दर्द',
    'सबसे बुरा सर दर्द',
  ],
  mixed: [
    'chest pain hai',
    'seene mein dard',
    'breathless feel',
    'stroke signs',
  ],
};

export function isRedFlag(text: string, language: Language): boolean {
  const normalized = text.toLowerCase().trim();
  const lists = language === 'hi' ? [RED_FLAG_SYMPTOMS.hi, RED_FLAG_SYMPTOMS.mixed]
    : language === 'en' ? [RED_FLAG_SYMPTOMS.en, RED_FLAG_SYMPTOMS.mixed]
    : [RED_FLAG_SYMPTOMS.en, RED_FLAG_SYMPTOMS.hi, RED_FLAG_SYMPTOMS.mixed];

  for (const list of lists) {
    for (const symptom of list) {
      if (normalized.includes(symptom.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

export function getEmergencyMessage(language: Language): string {
  if (language === 'hi') {
    return '🚨 आपातकाल: तुरंत डॉक्टर या एम्बुलेंस को कॉल करें। यह गंभीर लक्षण हो सकते हैं।';
  }
  return '🚨 EMERGENCY: Call your doctor or emergency services immediately. These may be serious symptoms.';
}

// ============================================================================
// Classification Result
// ============================================================================

export interface ClassificationResult {
  category: Barrier;
  confidence: number; // 0-1
  redFlag: boolean;
  matchedPhrases: string[];
  source: AISource;
}

// ============================================================================
// Context for Decision Making
// ============================================================================

export interface DecisionContext {
  elderId: string;
  medicineId: string;
  doseTime: string; // HH:MM
  previousSkips: number; // last 7 days
  barrierHistory: Barrier[]; // recent barriers
  language: Language;
}