/**
 * Friendly Messages — Saathi
 * All user-facing messages in English and Hindi.
 * Never show raw errors to elders.
 */

export type Language = 'en' | 'hi';

export interface MessageSet {
  en: string;
  hi: string;
}

export const MESSAGES: Record<string, MessageSet> = {
  // General
  somethingWentWrong: {
    en: 'Something went wrong. Let\'s try again.',
    hi: 'थोड़ी दिक्कत आ गई। फिर से कोशिश करते हैं।',
  },
  greetingHello: {
    en: 'Hello, Maa',
    hi: 'नमस्ते, माँ',
  },
  greetingWelcome: {
    en: 'Welcome back!',
    hi: 'वापस स्वागत है!',
  },
  tryAgainLater: {
    en: 'Please try again in a moment.',
    hi: 'कृपया थोड़ी देर बाद फिर कोशिश करें।',
  },
  featureUnavailable: {
    en: 'This feature is temporarily unavailable.',
    hi: 'यह सुविधा अभी उपलब्ध नहीं है।',
  },

  // Network / API
  offlineMode: {
    en: 'Working offline. Some features may be limited.',
    hi: 'ऑफलाइन मोड में काम कर रहे हैं। कुछ सुविधाएं सीमित हो सकती हैं।',
  },
  serverBusy: {
    en: 'Our servers are busy. Please try again shortly.',
    hi: 'सर्वर व्यस्त है। कृपया थोड़ी देर बाद कोशिश करें।',
  },
  rateLimited: {
    en: 'Too many requests. Please wait a moment.',
    hi: 'बहुत सारे अनुरोध। कृपया थोड़ा इंतजार करें।',
  },

  // Dose Tracking
  doseTaken: {
    en: '✅ Medicine marked as taken!',
    hi: '✅ दवा ली गई मार्क हो गई!',
  },
  doseSkipped: {
    en: 'Medicine marked as skipped. Let\'s understand why.',
    hi: 'दवा छूट गई मार्क हो गई। आइए समझते हैं क्यों।',
  },
  doseUndone: {
    en: 'Undone. You can mark it again.',
    hi: 'पूर्ववत कर दिया। आप फिर से मार्क कर सकते हैं।',
  },
  noDosesToday: {
    en: 'No medicines scheduled for today.',
    hi: 'आज के लिए कोई दवा निर्धारित नहीं है।',
  },
  allDosesTaken: {
    en: '🎉 All medicines taken for today!',
    hi: '🎉 आज की सभी दवाएं ले ली गईं!',
  },

  // Why Skipped Flow
  whySkippedTitle: {
    en: 'Why was this dose skipped?',
    hi: 'यह दवा क्यों छूट गई?',
  },
  whySkippedPlaceholder: {
    en: 'Tell me in your own words...',
    hi: 'अपने शब्दों में बताएं...',
  },
  whySkippedListening: {
    en: 'Listening... tap to stop',
    hi: 'सुन रही हूँ... रोकने के लिए टैप करें',
  },
  whySkippedTapOption: {
    en: 'Or tap a reason below:',
    hi: 'या नीचे एक कारण चुनें:',
  },
  skipReasonForgot: {
    en: 'Forgot',
    hi: 'भूल गई',
  },
  skipReasonSideEffect: {
    en: 'Felt Unwell',
    hi: 'तबीयत खराब लगी',
  },
  skipReasonFeelsBetter: {
    en: 'Feel Better Now',
    hi: 'अब ठीक हूँ',
  },
  skipReasonCostOrStock: {
    en: 'Medicine Finished / Costly',
    hi: 'दवा खत्म / महंगी',
  },
  skipReasonSwallowing: {
    en: 'Hard to Swallow',
    hi: 'निगलने में दिक्कत',
  },
  skipReasonFearOrBelief: {
    en: 'Worried About It',
    hi: 'चिंता / डर',
  },
  skipReasonOther: {
    en: 'Something Else',
    hi: 'कुछ और',
  },

  // Skip Reason Actions
  actionForgot: {
    en: 'No worries! Try taking it with your daily {routine} — it helps build a habit.',
    hi: 'कोई बात नहीं! अपनी दैनिक {routine} के साथ ले लें — आदत बन जाएगी।',
  },
  actionSideEffect: {
    en: 'Thank you for telling me. Please contact your doctor — do NOT stop the medicine on your own.',
    hi: 'बताने के लिए धन्यवाद। कृपया अपने डॉक्टर से संपर्क करें — खुद से दवा बंद न करें।',
  },
  actionFeelsBetter: {
    en: 'That\'s good you feel better! But this medicine keeps you well. Please ask your doctor before stopping.',
    hi: 'अच्छा है आप बेहतर महसूस कर रहे हैं! लेकिन यह दवा आपको स्वस्थ रखती है। डॉक्टर से पूछे बिना बंद न करें।',
  },
  actionCostOrStock: {
    en: 'I\'ll let your caregiver know. They can help with a refill or ask the doctor about a lower-cost option.',
    hi: 'मैं आपके देखभाल करने वाले को बता दूँगा। वे रीफिल में मदद कर सकते हैं या डॉक्टर से सस्ता विकल्प पूछ सकते हैं।',
  },
  actionSwallowing: {
    en: 'That\'s a common problem. Ask your doctor about a syrup, smaller tablet, or crushable version.',
    hi: 'यह आम समस्या है। अपने डॉक्टर से सिरप, छोटी गोली या चूर्ण करने योग्य दवा के बारे में पूछें।',
  },
  actionFearOrBelief: {
    en: 'I understand your concern. Many people feel this way. Your doctor can explain why this medicine is safe for you.',
    hi: 'मैं आपकी चिंता समझती हूँ। बहुत लोग ऐसा महसूस करते हैं। आपका डॉक्टर बता सकता है कि यह दवा आपके लिए क्यों सुरक्षित है।',
  },
  actionOther: {
    en: 'Thank you for sharing. Your caregiver will follow up with you.',
    hi: 'साझा करने के लिए धन्यवाद। आपका देखभाल करने वाला आपसे संपर्क करेगा।',
  },

  // Emergency
  emergencyTitle: {
    en: '🚨 EMERGENCY',
    hi: '🚨 आपातकाल',
  },
  emergencyMessage: {
    en: 'Call your doctor or emergency services immediately. These may be serious symptoms.',
    hi: 'तुरंत डॉक्टर या एम्बुलेंस को कॉल करें। यह गंभीर लक्षण हो सकते हैं।',
  },
  emergencyCallNow: {
    en: 'Call Now',
    hi: 'अभी कॉल करें',
  },

  // Doctor Note
  doctorNoteTitle: {
    en: 'Doctor\'s Note',
    hi: 'डॉक्टर की बात',
  },
  doctorNotePlaceholder: {
    en: 'Paste or dictate what the doctor said...',
    hi: 'डॉक्टर ने जो कहा वो पेस्ट करें या बोलकर बताएं...',
  },
  doctorNoteProcessing: {
    en: 'Understanding the doctor\'s note...',
    hi: 'डॉक्टर की बात समझ रही हूँ...',
  },
  doctorNoteResult: {
    en: 'Here\'s what I understood:',
    hi: 'यहाँ मैंने क्या समझा:',
  },
  doctorNoteDraftMedicines: {
    en: 'Draft medicines (need confirmation):',
    hi: 'मसौदा दवाएं (पुष्टि की जरूरत):',
  },
  doctorNoteOverlaps: {
    en: '⚠️ Overlap Warning',
    hi: '⚠️ ओवरलैप चेतावनी',
  },
  doctorNoteConfirm: {
    en: 'Confirm with caregiver/doctor before adding',
    hi: 'जोड़ने से पहले देखभाल करने वाले/डॉक्टर से पुष्टि करें',
  },

  // Fasting Planner
  fastingTitle: {
    en: 'Fasting Day Planner',
    hi: 'उपवास दिवस योजनाकार',
  },
  fastingSelectOccasion: {
    en: 'Select the fasting occasion:',
    hi: 'उपवास का अवसर चुनें:',
  },
  fastingSelectDate: {
    en: 'Date of fasting:',
    hi: 'उपवास की तारीख:',
  },
  fastingPlanDraft: {
    en: '📋 Draft Plan (needs confirmation)',
    hi: '📋 मसौदा योजना (पुष्टि की जरूरत)',
  },
  fastingPlanConfirmed: {
    en: '✅ Plan Confirmed',
    hi: '✅ योजना पुष्ट हो गई',
  },
  fastingGuidanceWithFood: {
    en: 'Take with food',
    hi: 'भोजन के साथ लें',
  },
  fastingGuidanceEmptyStomach: {
    en: 'Empty stomach OK',
    hi: 'खाली पेट ले सकते हैं',
  },
  fastingGuidanceAskDoctor: {
    en: 'Ask your doctor',
    hi: 'डॉक्टर से पूछें',
  },
  fastingConfirmButton: {
    en: 'Confirm Plan',
    hi: 'योजना पुष्ट करें',
  },
  fastingDisclaimer: {
    en: 'Not medical advice. Confirm with your doctor before fasting.',
    hi: 'चिकित्सा सलाह नहीं। उपवास से पहले डॉक्टर से पुष्टि करें।',
  },

  // Caregiver Dashboard
  caregiverTitle: {
    en: 'Caregiver Dashboard',
    hi: 'देखभाल करने वाले का डैशबोर्ड',
  },
  caregiverAdherence: {
    en: 'Adherence (7 days)',
    hi: 'पालन (7 दिन)',
  },
  caregiverTaken: {
    en: 'Taken',
    hi: 'ली गई',
  },
  caregiverSkipped: {
    en: 'Skipped',
    hi: 'छूटी',
  },
  caregiverBarriers: {
    en: 'Skip Reasons',
    hi: 'छूटने के कारण',
  },
  caregiverAlerts: {
    en: 'Active Alerts',
    hi: 'सक्रिय अलर्ट',
  },
  caregiverPending: {
    en: 'Pending Confirmations',
    hi: 'लंबित पुष्टियाँ',
  },
  caregiverCall: {
    en: 'Call',
    hi: 'कॉल करें',
  },
  caregiverMarkHandled: {
    en: 'Mark Handled',
    hi: 'हैंडल किया गया',
  },
  caregiverNoAlerts: {
    en: 'No active alerts. All good!',
    hi: 'कोई सक्रिय अलर्ट नहीं। सब ठीक है!',
  },

  // Accessibility
  textSizeSmall: {
    en: 'A',
    hi: 'क',
  },
  textSizeMedium: {
    en: 'A+',
    hi: 'क+',
  },
  textSizeLarge: {
    en: 'A++',
    hi: 'क++',
  },
  contrastNormal: {
    en: 'Normal',
    hi: 'सामान्य',
  },
  contrastHigh: {
    en: 'High Contrast',
    hi: 'उच्च कंट्रास्ट',
  },
  languageEnglish: {
    en: 'English',
    hi: 'English',
  },
  languageHindi: {
    en: 'Hindi',
    hi: 'हिन्दी',
  },
  readAloud: {
    en: 'Read Aloud',
    hi: 'जोर से पढ़ें',
  },
  voiceInput: {
    en: 'Voice Input',
    hi: 'आवाज से इनपुट',
  },

  // SOS
  sosButton: {
    en: 'SOS',
    hi: 'SOS',
  },
  sosTitle: {
    en: 'Emergency Help',
    hi: 'आपातकालीन मदद',
  },
  sosMessage: {
    en: 'Call emergency services or your doctor immediately.',
    hi: 'तुरंत आपातकालीन सेवाओं या अपने डॉक्टर को कॉल करें।',
  },

  // Confirmation Dialogs
  confirmYes: {
    en: 'Yes',
    hi: 'हाँ',
  },
  confirmNo: {
    en: 'No',
    hi: 'नहीं',
  },
  confirmUndo: {
    en: 'Undo',
    hi: 'पूर्ववत',
  },
  confirmDelete: {
    en: 'Delete',
    hi: 'हटाएं',
  },
  confirmCancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
  },

  // Loading
  loading: {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },
  saving: {
    en: 'Saving...',
    hi: 'सेव हो रहा है...',
  },
};

/**
 * Get a message in the specified language with optional interpolation.
 */
export function getMessage(key: string, language: Language, params?: Record<string, string>): string {
  const messageSet = MESSAGES[key];
  if (!messageSet) {
    console.warn(`[Messages] Missing message key: ${key}`);
    return key;
  }

  let message = messageSet[language] || messageSet.en;

  if (params) {
    for (const [param, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    }
  }

  return message;
}

/**
 * Get all messages for a language (for client-side hydration)
 */
export function getAllMessages(language: Language): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, set] of Object.entries(MESSAGES)) {
    result[key] = set[language] || set.en;
  }
  return result;
}