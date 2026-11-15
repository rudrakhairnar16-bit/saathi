/**
 * TextSizeToggle — Saathi UI Component
 * A / A+ / A++ text size control persisted in localStorage
 */

'use client';

import { useEffect, useState } from 'react';
import { BigButton } from './BigButton';

export type TextSize = 'small' | 'medium' | 'large';

const SIZE_CLASSES: Record<TextSize, string> = {
  small: 'text-base',      // 20px base
  medium: 'text-lg',       // ~24px
  large: 'text-xl',        // ~28px
};

const SIZE_LABELS: Record<TextSize, { en: string; hi: string }> = {
  small: { en: 'A', hi: 'क' },
  medium: { en: 'A+', hi: 'क+' },
  large: { en: 'A++', hi: 'क++' },
};

const SIZE_TOOLTIPS: Record<TextSize, { en: string; hi: string }> = {
  small: { en: 'Normal text size', hi: 'सामान्य आकार' },
  medium: { en: 'Larger text', hi: 'बड़ा टेक्स्ट' },
  large: { en: 'Largest text', hi: 'सबसे बड़ा टेक्स्ट' },
};

const STORAGE_KEY = 'saathi_text_size';

export function TextSizeToggle({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const [size, setSize] = useState<TextSize>('small');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as TextSize | null;
      if (stored && SIZE_CLASSES[stored]) {
        setSize(stored);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Apply to document and save
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove(...Object.values(SIZE_CLASSES));
    document.documentElement.classList.add(SIZE_CLASSES[size]);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      // ignore
    }
  }, [size, mounted]);

  const cycleSize = () => {
    const sizes: TextSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setSize(sizes[nextIndex]);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2" role="group" aria-label="Text size">
        <BigButton size="default" aria-label="Text size" disabled>
          A
        </BigButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={language === 'hi' ? 'टेक्स्ट आकार' : 'Text size'}>
      {/* Always visible label - not hidden on mobile */}
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {language === 'hi' ? 'टेक्स्ट आकार:' : 'Text Size:'}
      </span>
      {['small', 'medium', 'large'].map((s) => {
        const currentSize = s as TextSize;
        return (
          <BigButton
            key={s}
            size="default"
            variant={size === currentSize ? 'primary' : 'secondary'}
            onClick={() => setSize(currentSize)}
            aria-pressed={size === currentSize}
            aria-label={`${SIZE_LABELS[currentSize][language]} - ${SIZE_TOOLTIPS[currentSize][language]}`}
            title={SIZE_TOOLTIPS[currentSize][language]}
            className="min-w-[56px]"
          >
            {SIZE_LABELS[currentSize][language]}
          </BigButton>
        );
      })}
    </div>
  );
}

// Variant support for BigButton
declare module './BigButton' {
  interface BigButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
  }
}