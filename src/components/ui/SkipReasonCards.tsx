/**
 * SkipReasonCards — Saathi UI Component
 * 7 large picture cards with text for tap-based skip reason selection
 * Alternative to voice/text input for elders
 */

'use client';

import { useState } from 'react';
import { BigButton } from './BigButton';
import { getMessage } from '@/lib/messages';

export type SkipReason =
  | 'forgot'
  | 'side_effect'
  | 'feels_better'
  | 'cost_or_stock'
  | 'swallowing'
  | 'fear_or_belief'
  | 'other';

interface SkipReasonCardProps {
  reason: SkipReason;
  language: 'en' | 'hi';
  selected: boolean;
  onSelect: (reason: SkipReason) => void;
  disabled?: boolean;
}

const REASON_DATA: Record<SkipReason, { icon: string; labelKey: string }> = {
  forgot: { icon: '🧠', labelKey: 'skipReasonForgot' },
  side_effect: { icon: '🤢', labelKey: 'skipReasonSideEffect' },
  feels_better: { icon: '😊', labelKey: 'skipReasonFeelsBetter' },
  cost_or_stock: { icon: '💊', labelKey: 'skipReasonCostOrStock' },
  swallowing: { icon: '😖', labelKey: 'skipReasonSwallowing' },
  fear_or_belief: { icon: '😟', labelKey: 'skipReasonFearOrBelief' },
  other: { icon: '❓', labelKey: 'skipReasonOther' },
};

export function SkipReasonCard({ reason, language, selected, onSelect, disabled }: SkipReasonCardProps) {
  const { icon, labelKey } = REASON_DATA[reason];
  const label = getMessage(labelKey, language);

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(reason)}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center gap-2
        p-4 min-h-[120px] min-w-[120px]
        rounded-2xl border-4
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
        ${selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-blue-500'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
      `}
      aria-pressed={selected}
      aria-label={label}
    >
      <span aria-hidden="true" style={{ fontSize: '3rem', lineHeight: 1 }}>{icon}</span>
      <span className="text-center text-base font-semibold leading-tight">
        {label}
      </span>
    </button>
  );
}

export interface SkipReasonCardsProps {
  language: 'en' | 'hi';
  onSelect: (reason: SkipReason) => void;
  disabled?: boolean;
  selectedReason?: SkipReason | null;
}

export function SkipReasonCards({ language, onSelect, disabled, selectedReason }: SkipReasonCardsProps) {
  const reasons: SkipReason[] = [
    'forgot',
    'side_effect',
    'feels_better',
    'cost_or_stock',
    'swallowing',
    'fear_or_belief',
    'other',
  ];

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      role="radiogroup"
      aria-label={getMessage('whySkippedTapOption', language)}
    >
      {reasons.map(reason => (
        <SkipReasonCard
          key={reason}
          reason={reason}
          language={language}
          selected={selectedReason === reason}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}