/**
 * Why Skipped Flow — Saathi
 * Voice + Text + 7 Tap Cards for skip reason
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BigButton, SkipReasonCards } from '@/components/ui';
import { useElderContext } from '../layout';
import { getMessage, getAllMessages } from '@/lib/messages';

type SkipReason =
  | 'forgot'
  | 'side_effect'
  | 'feels_better'
  | 'cost_or_stock'
  | 'swallowing'
  | 'fear_or_belief'
  | 'other';

interface SkipReasonAction {
  elderMessage: string;
  caregiverAlert?: string;
  doctorNote?: string;
  reminderShiftMinutes?: number;
  refillAlert?: string;
}

export default function WhySkipped() {
  const { language } = useElderContext();
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [selectedReason, setSelectedReason] = useState<SkipReason | null>(null);
  const [customText, setCustomText] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [voiceError, setVoiceError] = useState(false);
  const [action, setAction] = useState<SkipReasonAction | null>(null);
  const [redFlag, setRedFlag] = useState(false);
  const messages = getAllMessages(language);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as Window & { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition || (window as Window & { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomText(transcript);
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        setListening(false);
        // Show fallback prompt on any error (no mic, permission denied, network, etc.)
        if (!customText.trim()) {
          setVoiceError(true);
          // Auto-hide after 8 seconds
          setTimeout(() => setVoiceError(false), 8000);
        }
      };

      rec.onend = () => {
        setListening(false);
        // If no transcript captured, show fallback
        if (!customText.trim() && !voiceError) {
          setVoiceError(true);
          setTimeout(() => setVoiceError(false), 8000);
        }
      };

      setRecognition(rec);
    }
  }, [language]);

  const startListening = () => {
    if (recognition && !listening) {
      setCustomText('');
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop();
      setListening(false);
    }
  };

  const handleReasonSelect = (reason: SkipReason) => {
    setSelectedReason(reason);
    setVoiceError(false); // Dismiss fallback when user taps a card
    // Auto-advance to confirm after selection
    setTimeout(() => setStep('confirm'), 300);
  };

  const handleSubmit = async () => {
    const text = customText.trim() || getDefaultTextForReason(selectedReason!);
    const doseEventId = 'demo-dose-1'; // In real app, get from context

    try {
      const res = await fetch('/api/dose/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doseEventId, elderId: 'elder1', text, language }),
      });

      if (res.ok) {
        const data = await res.json();
        setAction(data.action);
        setRedFlag(data.redFlag);
        setStep('confirm');
      }
    } catch {
      // Fallback action based on reason
      const fallbackAction = getFallbackAction(selectedReason!, language);
      setAction(fallbackAction);
      setRedFlag(selectedReason === 'side_effect');
      setStep('confirm');
    }
  };

  const getDefaultTextForReason = (reason: SkipReason): string => {
    const defaults: Record<SkipReason, string> = {
      forgot: language === 'hi' ? 'भूल गई थी' : 'I forgot',
      side_effect: language === 'hi' ? 'चक्कर आया' : 'Felt dizzy',
      feels_better: language === 'hi' ? 'अब ठीक हूँ' : 'Feeling better',
      cost_or_stock: language === 'hi' ? 'दवा खत्म हो गई' : 'Medicine finished',
      swallowing: language === 'hi' ? 'निगलने में दिक्कत' : 'Hard to swallow',
      fear_or_belief: language === 'hi' ? 'डर लगता है' : 'Worried about it',
      other: language === 'hi' ? 'कुछ और' : 'Something else',
    };
    return defaults[reason];
  };

  const getFallbackAction = (reason: SkipReason, lang: 'en' | 'hi'): SkipReasonAction => {
    const actions: Record<SkipReason, SkipReasonAction> = {
      forgot: {
        elderMessage: getMessage('actionForgot', lang).replace('{routine}', lang === 'hi' ? 'सुबह की चाय' : 'morning tea'),
      },
      side_effect: {
        elderMessage: getMessage('actionSideEffect', lang),
        caregiverAlert: 'Reported side effect. Please review.',
      },
      feels_better: {
        elderMessage: getMessage('actionFeelsBetter', lang),
      },
      cost_or_stock: {
        elderMessage: getMessage('actionCostOrStock', lang),
        refillAlert: 'Medicine refill needed.',
      },
      swallowing: {
        elderMessage: getMessage('actionSwallowing', lang),
      },
      fear_or_belief: {
        elderMessage: getMessage('actionFearOrBelief', lang),
      },
      other: {
        elderMessage: getMessage('actionOther', lang),
      },
    };
    return actions[reason];
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (step === 'select') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
        <header>
          <h1 className="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2">
            {getMessage('whySkippedTitle', language)}
          </h1>
          <p className="text-center text-[var(--color-text-secondary)] mb-6">
            {getMessage('whySkippedPlaceholder', language)}
          </p>
        </header>

        {/* Voice Input */}
        <div className="card p-4 space-y-3">
          <textarea
            ref={textareaRef}
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder={getMessage('whySkippedPlaceholder', language)}
            rows={3}
            className="w-full p-3 text-lg border border-[var(--color-border-light)] rounded-xl bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            aria-label={getMessage('whySkippedPlaceholder', language)}
          />

          <div className="flex items-center justify-center gap-4">
            <BigButton
              size="large"
              variant={listening ? 'danger' : 'primary'}
              fullWidth
              onClick={listening ? stopListening : startListening}
              icon={<span style={{ fontSize: '1.5em' }}>{listening ? '🔴' : '🎤'}</span>}
              disabled={!recognition}
            >
              {listening
                ? getMessage('whySkippedListening', language)
                : getMessage('voiceInput', language)}
            </BigButton>

            <BigButton
              size="large"
              variant="secondary"
              onClick={() => speakText(customText || getMessage('whySkippedPlaceholder', language))}
              icon={<span style={{ fontSize: '1.5em' }}>🔊</span>}
            >
              {getMessage('readAloud', language)}
            </BigButton>
          </div>

          {/* Voice Fallback Prompt - shows when recognition fails */}
          {voiceError && !customText.trim() && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3 animate-pulse">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {language === 'hi' ? 'आवाज़ नहीं पहचानी गई' : 'Voice not recognized'}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {language === 'hi'
                    ? 'कोई बात नहीं — नीचे दिए बटन दबाकर कारण चुनें'
                    : 'No problem — tap a reason button below instead'}
                </p>
              </div>
              <button
                onClick={() => setVoiceError(false)}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 font-bold text-xl leading-none p-1"
                aria-label={language === 'hi' ? 'बंद करें' : 'Dismiss'}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Tap Cards */}
        <div className="card p-4">
          <p className="text-center text-[var(--color-text-secondary)] mb-4">
            {getMessage('whySkippedTapOption', language)}
          </p>
          <SkipReasonCards
            language={language}
            onSelect={handleReasonSelect}
            selectedReason={selectedReason}
          />
        </div>

        {/* Submit Button */}
        <BigButton
          size="xl"
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedReason && !customText.trim()}
        >
          {getMessage('languageEnglish', language) === 'English' ? 'Submit' : 'भेजें'}
        </BigButton>
      </div>
    );
  }

  // Confirm/Result Step
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      {redFlag && (
        <div className="card p-6 border-4 border-red-500 bg-red-50 dark:bg-red-900/20" role="alert">
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
            <span aria-hidden="true">🚨</span>
            {getMessage('emergencyTitle', language)}
          </h2>
          <p className="text-lg text-red-700 dark:text-red-300 mb-4">
            {getMessage('emergencyMessage', language)}
          </p>
          <a href="tel:112" className="block">
            <BigButton size="xl" variant="danger" fullWidth>
              {getMessage('emergencyCallNow', language)}
            </BigButton>
          </a>
        </div>
      )}

      <div className="card p-6">
        <div className="text-center mb-6">
          <span className="text-5xl" aria-hidden="true">
            {redFlag ? '🚨' : '✅'}
          </span>
          <h2 className="text-2xl font-bold mt-3 text-[var(--color-text-primary)]">
            {getMessage('languageEnglish', language) === 'English' ? 'Thank you for sharing' : 'साझा करने के लिए धन्यवाद'}
          </h2>
        </div>

        {action && (
          <div className="space-y-4 p-4 bg-[var(--color-bg-secondary)] rounded-xl">
            <p className="text-[var(--color-text-primary)] leading-relaxed">
              {action.elderMessage}
            </p>

            {(action.caregiverAlert || action.doctorNote) && (
              <div className="pt-4 border-t border-[var(--color-border-light)] text-sm text-[var(--color-text-muted)]">
                {action.caregiverAlert && (
                  <p className="mb-2">📱 <strong>Caregiver Alert:</strong> {action.caregiverAlert}</p>
                )}
                {action.doctorNote && (
                  <p>🩺 <strong>Doctor Note:</strong> {action.doctorNote}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/elder/medicines" className="flex-1">
            <BigButton size="large" variant="primary" fullWidth>
              {getMessage('languageEnglish', language) === 'English' ? 'Back to Medicines' : 'दवाओं पर वापस'}
            </BigButton>
          </Link>
          <Link href="/elder" className="flex-1">
            <BigButton size="large" variant="secondary" fullWidth>
              {getMessage('languageEnglish', language) === 'English' ? 'Home' : 'होम'}
            </BigButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

