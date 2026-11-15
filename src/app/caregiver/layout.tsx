/**
 * Caregiver Layout — Saathi
 * Simpler layout for caregiver dashboard
 */

'use client';

import { ReactNode } from 'react';

interface CaregiverLayoutProps {
  children: ReactNode;
}

export default function CaregiverLayout({ children }: CaregiverLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <header className="sticky top-0 z-40 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)] px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Saathi — Caregiver Dashboard
          </h1>
          <a href="/elder" className="text-[var(--color-brand-primary)] hover:underline text-sm">
            ← Elder View
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4 pb-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}