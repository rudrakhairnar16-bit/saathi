/**
 * LanguageSwitcher — Saathi UI Component
 * Language selector with native names
 */

'use client';

import { useState, useEffect } from 'react';
import { BigButton } from './BigButton';

type Language = 'en' | 'hi';

const LANGUAGES: Record<Language, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  hi: { native: 'हिन्दी', english: 'Hindi' },
};

const STORAGE_KEY = 'saathi_language';

export function LanguageSwitcher({
  language,
  onChange,
}: {
  language: Language;
  onChange: (lang: Language) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage on first mount if not provided
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && stored !== language) {
        onChange(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // ignore
      }
    }
  }, [language, mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2" role="group" aria-label="Language">
        <BigButton size="default" variant="secondary" disabled>EN</BigButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Language">
      {(Object.keys(LANGUAGES) as Language[]).map(lang => (
        <BigButton
          key={lang}
          size="default"
          variant={language === lang ? 'primary' : 'secondary'}
          onClick={() => onChange(lang)}
          aria-pressed={language === lang}
          aria-label={LANGUAGES[lang].native}
          className="min-w-[80px]"
        >
          {LANGUAGES[lang].native}
        </BigButton>
      ))}
    </div>
  );
}