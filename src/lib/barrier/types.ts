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
      en: ['forgot', 'didnt remember', 'slipped my mind', 'busy', 'forgot to take', 'missed it', 'skipped it', 'overlooked', 'spaced out', 'mind blank', 'did not remember', 'failed to take', 'neglected'],
      hi: ['bhool gayi', 'bhool gaya', 'yaad nahi', 'bhool gaye', 'yaad nahi aaya', 'vyast thi', 'भूल गई', 'भूल गया', 'याद नहीं', 'याद नहीं आया', 'व्यस्त थी', 'चूक गई', 'छूट गई', 'याद नही रहा', 'ध्यान नही दिया'],
      mixed: ['bhool gayi thi', 'forgot to take', 'yaad nahi raha', 'miss kar diya', 'skip ho gaya', 'dhyan nahi diya'],
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
      en: ['dizzy', 'nausea', 'vomiting', 'sick', 'unwell', 'side effect', 'reaction', 'dizzy after', 'headache', 'stomach pain', 'abdominal pain', 'diarrhea', 'constipation', 'fatigue', 'tired', 'weakness', 'drowsy', 'sleepy', 'rash', 'itching', 'swelling', 'breathless', 'palpitations', 'heart racing', 'low blood pressure', 'high blood pressure', 'blood sugar low', 'hypoglycemia', 'muscle pain', 'joint pain', 'cramps', 'bloating', 'gas', 'indigestion', 'acidity', 'heartburn', 'dry mouth', 'metallic taste', 'blurred vision', 'tremor', 'shaking', 'insomnia', 'nightmares', 'depression', 'anxiety', 'mood changes', 'confusion', 'memory problems', 'fainting', 'syncope', 'fall', 'injury'],
      hi: ['chakkar', 'ulti', 'ghabrahat', 'tabiyat kharab', 'side effect', 'reaction', 'sir dard', 'kamjori', 'चक्कर', 'उल्टी', 'घबराहट', 'तबीयत खराब', 'सिर दर्द', 'कमजोरी', 'पेट दर्द', 'दस्त', 'कब्ज', 'थकान', 'नींद', 'चकत्ते', 'खुजली', 'सूजन', 'सांस फूलना', 'दिल तेज', 'शुगर कम', 'मांसपेशियों में दर्द', 'जोड़ों में दर्द', 'ऐंठन', 'गैस', 'अपच', 'एसिडिटी', 'सीने में जलन', 'मुंह सूखना', 'धुंधला दिखना', 'कांपना', 'बेचैनी', 'उदासी', 'चिंता', 'भ्रम', 'याददाश्त', 'बेहोशी', 'गिरना', 'चोट'],
      mixed: ['dizzy feel hua', 'side effect hua', 'chakkar aaya', 'pet dard hua', 'kamzori lagi', 'ulta hua', 'gas bani', 'acidity hui', 'neend nahi aayi', 'mann kharab hua'],
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
      en: ['feel better', 'feeling fine', 'no need', 'cured', 'better now', 'dont need', 'healed', 'recovered', 'well now', 'healthy now', 'symptoms gone', 'pain gone', 'bp normal', 'sugar normal', 'controlled', 'stable', 'off medicine', 'stop medicine', 'quit medicine', 'discontinue', 'no more pills', 'enough medicine', 'dont want to take', 'tired of taking', 'burden', 'hassle', 'inconvenience', 'waste of money', 'unnecessary', 'pointless', 'useless', 'not working', 'ineffective', 'placebo', 'natural remedies', 'ayurveda', 'homeopathy', 'diet exercise', 'lifestyle change', 'cured naturally'],
      hi: ['ab theek hoon', 'theek hoon', 'zaroorat nahi', 'ab theek', 'swasth hoon', 'अब ठीक हूँ', 'ठीक हूँ', 'जरूरत नहीं', 'अब ठीक', 'स्वस्थ हूँ', 'आराम है', 'दर्द गया', 'बीपी नॉर्मल', 'शुगर नॉर्मल', 'कंट्रोल में', 'स्थिर', 'दवा बंद', 'दवा छोड़', 'दवा खत्म', 'गोलियां बंद', 'काफी दवा', 'नही लेनी', 'थक गया', 'बोझ', 'परेशानी', 'पैसे की बर्बादी', 'फालतू', 'बेकार', 'काम नही कर रही', 'असर नही', 'प्राकृतिक इलाज', 'आयुर्वेद', 'होम्योपैथी', 'डाइट एक्सरसाइज', 'लाइफस्टाइल चेंज', 'प्राकृतिक ठीक'],
      mixed: ['feel better ab', 'theek ho gayi', 'ab zaroorat nahi', 'bp normal hai', 'sugar control hai', 'dawa band karo', 'goli band', 'natural ilaj', 'ayurveda se theek'],
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
      en: ['finished', 'out of stock', 'expensive', 'costly', 'cannot afford', 'khatam', 'paisa nahi', 'empty', 'ran out', 'no more', 'depleted', 'exhausted', 'shortage', 'unavailable', 'discontinued', 'backorder', 'pharmacy closed', 'no refill', 'prescription expired', 'insurance denied', 'copay high', 'deductible', 'generic not available', 'brand only', 'cost too much', 'price hike', 'inflation', 'budget tight', 'financial hardship', 'poverty', 'low income', 'pension not enough', 'social security', 'medicare gap', 'donut hole', 'assistance program', 'patient assistance', 'coupon expired', 'discount ended', 'manufacturer program'],
      hi: ['khatam', 'khatam ho gayi', 'mahngi', 'paisa nahi', 'stock nahi', 'kharch nahi', 'खत्म', 'खत्म हो गई', 'महंगी', 'पैसा नहीं', 'स्टॉक नहीं', 'खर्च नहीं', 'खाली', 'नही मिली', 'उपलब्ध नही', 'बंद हो गई', 'रिफिल नही', 'पर्चा खत्म', 'बीमा मना', 'कॉपे ज्यादा', 'जेनेरिक नही', 'ब्रांड ही', 'दाम बढ़ गए', 'महंगाई', 'बजट टाइट', 'आर्थिक तंगी', 'गरीबी', 'कम आय', 'पेंशन कम', 'सहायता कार्यक्रम', 'कूपन खत्म', 'छूट खत्म', 'निर्माता कार्यक्रम'],
      mixed: ['medicine khatam', 'cost zyada', 'stock over', 'dawa khatam', 'paisa kam', 'refill nahi', 'prescription expire', 'generic nahi mila', 'brand mahnga', 'discount khatam'],
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
      en: ['hard to swallow', 'cannot swallow', 'choking', 'big tablet', 'swallowing problem', 'pill stuck', 'tablet stuck', 'capsule stuck', 'gag reflex', 'gagging', 'dysphagia', 'throat tight', 'esophagus', 'food pipe', 'pill size', 'too large', 'horse pill', 'chalky', 'bitter taste', 'aftertaste', 'coating', 'film coating', 'enteric coated', 'crush', 'crushing', 'chew', 'chewable', 'dissolve', 'dispersible', 'syrup', 'liquid', 'suspension', 'oral solution', 'patch', 'injection', 'alternative formulation', 'compounding', 'pharmacy compound', 'swallow aid', 'gel', 'lubricant', 'water', 'fluid', 'sip', 'gulp', 'fear of choking', 'pill anxiety', 'pill phobia'],
      hi: ['nigalne mein dikkat', 'nigal nahi paati', 'badi goli', 'gala mein fasti', 'निगलने में दिक्कत', 'निगल नहीं पाती', 'बड़ी गोली', 'गले में फंसती', 'गोली फंसी', 'कैप्सूल फंसा', 'उल्टी आना', 'निगलने में उल्टी', 'डिस्फेजिया', 'गला टाइट', 'खाने की नली', 'गोली का आकार', 'बहुत बड़ी', 'घोड़े की गोली', 'चॉकी', 'कड़वा स्वाद', 'बाद का स्वाद', 'कोटिंग', 'फिल्म कोटिंग', 'एंटेरिक कोटेड', 'पीसना', 'चबाना', 'चबाने योग्य', 'घुलना', 'डिस्पर्सिबल', 'सिरप', 'लिक्विड', 'सस्पेंशन', 'ओरल सोल्यूशन', 'पैच', 'इंजेक्शन', 'वैकल्पिक फॉर्मूलेशन', 'कंपाउंडिंग', 'फार्मेसी कंपाउंड', 'निगलने में सहायता', 'जेल', 'लुब्रिकेंट', 'पानी', 'तरल पदार्थ', 'घूंट', 'निगलना', 'घुटने का डर', 'गोली का डर', 'गोली फोबिया'],
      mixed: ['swallow karne mein problem', 'tablet badi hai', 'goli fas gayi', 'ulta aaya', 'chabane wali', 'syrup chahiye', 'liquid form', 'injection better', 'compounding pharmacy', 'gel laga ke', 'pani ke saath', 'darr lagta goli se'],
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
      en: ['worried', 'scared', 'afraid', 'addiction', 'habit', 'side effects later', 'fear', 'darr', 'dependency', 'dependent', 'hooked', 'addicted', 'withdrawal', 'cold turkey', 'tolerance', 'dose increase', 'stronger dose', 'liver damage', 'kidney damage', 'organ damage', 'long term effects', 'cancer risk', 'dementia', 'memory loss', 'brain damage', 'chemical', 'toxin', 'poison', 'unnatural', 'synthetic', 'big pharma', 'conspiracy', 'experiment', 'guinea pig', 'lab rat', 'side effects worse than disease', 'quality of life', 'rather die', 'natural healing', 'body heals itself', 'immune system', 'god will heal', 'faith healing', 'prayer', 'miracle', 'placebo effect', 'nocebo', 'mind over matter', 'psychosomatic', 'doctor profit', 'kickback', 'commission', 'pharma lobby', 'fda approval', 'clinical trials', 'insufficient testing', 'rushed approval', 'recall', 'black box warning', 'class action', 'lawsuit', 'settlement', 'whistleblower'],
      hi: ['darr', 'chinta', 'aadat padh jayegi', 'nuksan', 'side effect hoga', 'ghabhrahat', 'डर', 'चिंता', 'आदत पड़ जाएगी', 'नुकसान', 'साइड इफेक्ट होगा', 'घबराहट', 'निर्भरता', 'निर्भर', 'लत', 'आदी', 'विड्रॉल', 'छोड़ना', 'सहनशक्ति', 'डोज बढ़ाना', 'स्ट्रॉन्ग डोज', 'लिवर खराब', 'किडनी खराब', 'अंग खराब', 'लंबे समय के प्रभाव', 'कैंसर खतरा', 'भूलने की बीमारी', 'याददाश्त खोना', 'दिमाग खराब', 'केमिकल', 'टॉक्सिन', 'जहर', 'अप्राकृतिक', 'सिंथेटिक', 'बिग फार्मा', 'षड्यंत्र', 'प्रयोग', 'गिनी पिग', 'लैब रैट', 'बीमारी से बुरे साइड इफेक्ट', 'जीवन की गुणवत्ता', 'मरना बेहतर', 'प्राकृतिक उपचार', 'शरीर खुद ठीक', 'प्रतिरक्षा प्रणाली', 'भगवान ठीक करेंगे', 'आस्था उपचार', 'प्रार्थना', 'चमत्कार', 'प्लेसीबो प्रभाव', 'नोसीबो', 'मन की शक्ति', 'मनोरोग', 'डॉक्टर का मुनाफा', 'किकबैक', 'कमीशन', 'फार्मा लॉबी', 'एफडीए अप्रूवल', 'क्लिनिकल ट्रायल', 'अपर्याप्त परीक्षण', 'जल्दी मंजूरी', 'वापसी', 'ब्लैक बॉक्स चेतावनी', 'क्लास एक्शन', 'मुकदमा', 'समझौता', 'व्हिसलब्लोअर'],
      mixed: ['darr lagta hai', 'worried about side effects', 'aadat padh jayegi', 'liver kharab hoga', 'kidney damage', 'big pharma conspiracy', 'natural healing better', 'body khud theek karega', 'bhagwan theek karenge', 'doctor commission khate hain', 'pharma lobby', 'clinical trial kam hue', 'black box warning', 'dawa wapas hui'],
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