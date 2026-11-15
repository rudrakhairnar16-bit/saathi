/**
 * Elder Layout — Saathi
 * Providers for text size, contrast, language, and SOS button
 */

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { SOSButton, LanguageSwitcher, TextSizeToggle, ContrastToggle } from '@/components/ui';
import { getMessage } from '@/lib/messages';

type Language = 'en' | 'hi';
type TextSize = 'small' | 'medium' | 'large';

interface ElderContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ElderContext = createContext<ElderContextType | null>(null);

export function useElderContext() {
  const context = useContext(ElderContext);
  if (!context) {
    throw new Error('useElderContext must be used within ElderProvider');
  }
  return context;
}

interface ElderProviderProps {
  children: ReactNode;
}

export function ElderProvider({ children }: ElderProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const storedLang = localStorage.getItem('saathi_language') as Language | null;
      const storedSize = localStorage.getItem('saathi_text_size') as TextSize | null;
      const storedContrast = localStorage.getItem('saathi_high_contrast');

      if (storedLang) setLanguage(storedLang);
      if (storedSize) setTextSize(storedSize);
      if (storedContrast === 'true') setHighContrast(true);
    } catch {
      // ignore
    }
  }, []);

  // Apply text size to document
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    document.documentElement.classList.add(`text-${textSize}`);
    try {
      localStorage.setItem('saathi_text_size', textSize);
    } catch {}
  }, [textSize, mounted]);

  // Apply high contrast
  useEffect(() => {
    if (!mounted) return;
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem('saathi_high_contrast', String(highContrast));
    } catch {}
  }, [highContrast, mounted]);

  // Apply language (for moment)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('saathi_language', language);
    } catch {}
  }, [language, mounted]);

  if (!mounted) {
    return (
      <ElderContext.Provider value={{ language: 'en', setLanguage: () => {}, textSize: 'medium', setTextSize: () => {}, highContrast: false, setHighContrast: () => {} }}>
        {children}
        <SOSButton language="en" />
      </ElderContext.Provider>
    );
  }

  return (
    <ElderContext.Provider value={{ language, setLanguage, textSize, setTextSize, highContrast, setHighContrast }}>
      {children}
      <SOSButton language={language} />
    </ElderContext.Provider>
  );
}

export default function ElderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ElderProvider>
      <ElderLayoutContent>{children}</ElderLayoutContent>
    </ElderProvider>
  );
}

function ElderLayoutContent({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, textSize, setTextSize, highContrast, setHighContrast } = useElderContext();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Saathi
          </h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher language={language} onChange={setLanguage} />
            <TextSizeToggle language={language} />
            <ContrastToggle language={language} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 p-4 pb-28">
        {children}
      </main>
      <SOSButton language={language} />
    </div>
  );
}