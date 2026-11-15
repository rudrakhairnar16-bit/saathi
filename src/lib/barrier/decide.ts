/**
 * Decide Action Logic — Saathi Barrier Engine
 * Pure function: given a barrier category and context, returns the action to take.
 * No I/O, no side effects — fully testable.
 */

import type { Barrier, Action, Language } from '@/types';
import type { DecisionContext } from './types';
import { BARRIER_CATEGORIES } from './types';

// ============================================================================
// Elder-Facing Messages (English + Hindi)
// ============================================================================

const ELDER_MESSAGES: Record<Barrier, { en: string; hi: string }> = {
  forgot: {
    en: "No worries. Try taking it with your daily {routine} — it helps build a habit.",
    hi: "कोई बात नहीं। अपनी दैनिक {routine} के साथ ले लें — आदत बन जाएगी।",
  },
  side_effect: {
    en: "Thank you for telling me. Please contact your doctor — do NOT stop the medicine on your own.",
    hi: "बताने के लिए धन्यवाद। कृपया अपने डॉक्टर से संपर्क करें — खुद से दवा बंद न करें।",
  },
  feels_better: {
    en: "That's good you feel better! But this medicine keeps you well. Please ask your doctor before stopping.",
    hi: "अच्छा है आप बेहतर महसूस कर रहे हैं! लेकिन यह दवा आपको स्वस्थ रखती है। डॉक्टर से पूछे बिना बंद न करें।",
  },
  cost_or_stock: {
    en: "I'll let your caregiver know. They can help with a refill or ask the doctor about a lower-cost option.",
    hi: "मैं आपके देखभाल करने वाले को बता दूँगा। वे रीफिल में मदद कर सकते हैं या डॉक्टर से सस्ता विकल्प पूछ सकते हैं।",
  },
  swallowing: {
    en: "That's a common problem. Ask your doctor about a syrup, smaller tablet, or crushable version.",
    hi: "यह आम समस्या है। अपने डॉक्टर से सिरप, छोटी गोली या चूर्ण करने योग्य दवा के बारे में पूछें।",
  },
  fear_or_belief: {
    en: "I understand your concern. Many people feel this way. Your doctor can explain why this medicine is safe for you.",
    hi: "मैं आपकी चिंता समझती हूँ। बहुत लोग ऐसा महसूस करते हैं। आपका डॉक्टर बता सकता है कि यह दवा आपके लिए क्यों सुरक्षित है।",
  },
  other: {
    en: "Thank you for sharing. Your caregiver will follow up with you.",
    hi: "साझा करने के लिए धन्यवाद। आपका देखभाल करने वाला आपसे संपर्क करेगा।",
  },
};

// ============================================================================
// Routine Anchoring Suggestions (for 'forgot' category)
// ============================================================================

const ROUTINE_ANCHORS: Record<string, { en: string; hi: string }> = {
  morning: { en: 'morning tea', hi: 'सुबह की चाय' },
  evening: { en: 'evening tea', hi: 'शाम की चाय' },
  breakfast: { en: 'breakfast', hi: 'नाश्ता' },
  dinner: { en: 'dinner', hi: 'रात का खाना' },
  bedtime: { en: 'bedtime', hi: 'सोने से पहले' },
};

function getRoutineForTime(timeStr: string, language: Language): string {
  const hour = parseInt(timeStr.split(':')[0], 10);
  let key: keyof typeof ROUTINE_ANCHORS;

  if (hour < 10) key = 'morning';
  else if (hour < 13) key = 'breakfast';
  else if (hour < 17) key = 'evening';
  else if (hour < 21) key = 'dinner';
  else key = 'bedtime';

  return ROUTINE_ANCHORS[key][language];
}

// ============================================================================
// Main Decision Function
// ============================================================================

export function decideAction(
  category: Barrier,
  context: DecisionContext
): Action {
  const barrierInfo = BARRIER_CATEGORIES[category];
  const baseAction = { ...barrierInfo.defaultAction };

  // Get elder-facing message in their language
  const elderMessageTemplate = ELDER_MESSAGES[category][context.language];

  let elderMessage = elderMessageTemplate;

  // Special handling for 'forgot' - anchor to routine
  if (category === 'forgot') {
    const routine = getRoutineForTime(context.doseTime, context.language);
    elderMessage = elderMessageTemplate.replace('{routine}', routine);
  }

  // Add context-aware adjustments
  const adjustedAction: Action = {
    ...baseAction,
    elderMessage,
  };

  // If multiple recent skips of same type, escalate caregiver alert
  const recentSameCategory = context.barrierHistory.filter(b => b === category).length;
  if (recentSameCategory >= 2 && category !== 'forgot') {
    adjustedAction.caregiverAlert = `${adjustedAction.caregiverAlert || ''} RECURRING: ${recentSameCategory + 1} instances in recent history.`;
  }

  // If high skip count overall, add adherence note
  if (context.previousSkips >= 3) {
    adjustedAction.caregiverAlert = `${adjustedAction.caregiverAlert || ''} Overall adherence concern: ${context.previousSkips} skips in last 7 days.`;
  }

  return adjustedAction;
}

// ============================================================================
// Red Flag Action (overrides everything)
// ============================================================================

export function decideRedFlagAction(language: Language): Action {
  return {
    elderMessage: language === 'hi'
      ? '🚨 आपातकाल: तुरंत डॉक्टर या एम्बुलेंस को कॉल करें। यह गंभीर लक्षण हो सकते हैं।'
      : '🚨 EMERGENCY: Call your doctor or emergency services immediately. These may be serious symptoms.',
    caregiverAlert: 'URGENT: Red-flag symptom reported (chest pain, fainting, breathlessness, or stroke signs). Immediate action needed.',
    doctorNote: 'Patient reported red-flag symptom. Urgent clinical review required.',
  };
}

// ============================================================================
// Complete Decision Pipeline
// ============================================================================

export interface DecideResult {
  action: Action;
  redFlag: boolean;
}

export function makeDecision(
  category: Barrier,
  redFlag: boolean,
  context: DecisionContext
): DecideResult {
  if (redFlag) {
    return {
      action: decideRedFlagAction(context.language),
      redFlag: true,
    };
  }

  return {
    action: decideAction(category, context),
    redFlag: false,
  };
}