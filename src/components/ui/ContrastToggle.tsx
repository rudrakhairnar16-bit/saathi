/**
 * ContrastToggle — Saathi UI Component
 * High contrast mode toggle (WCAG AAA) persisted in localStorage
 */

'use client';

import { useEffect, useState } from 'react';
import { BigButton } from './BigButton';

const STORAGE_KEY = 'saathi_high_contrast';

export function ContrastToggle({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const [highContrast, setHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setHighContrast(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(highContrast));
    } catch {
      // ignore
    }
  }, [highContrast, mounted]);

  if (!mounted) {
    return (
      <BigButton
        size="default"
        variant="secondary"
        aria-label={language === 'hi' ? 'उच्च कंट्रास्ट' : 'High contrast'}
        disabled
      >
        ◐
      </BigButton>
    );
  }

  return (
    <BigButton
      size="default"
      variant={highContrast ? 'primary' : 'secondary'}
      onClick={() => setHighContrast(!highContrast)}
      aria-pressed={highContrast}
      aria-label={language === 'hi' ? 'उच्च कंट्रास्ट' : 'High contrast'}
      className="min-w-[56px]"
    >
      <span aria-hidden="true" style={{ fontSize: '1.3em' }}>◐</span>
      <span className="hidden sm:inline">
        {highContrast
          ? language === 'hi'
            ? 'सामान्य'
            : 'Normal'
          : language === 'hi'
            ? 'उच्च कंट्रास्ट'
            : 'High Contrast'}
      </span>
    </BigButton>
  );
}