/**
 * SOSButton — Saathi UI Component
 * Sticky emergency button, always visible on elder screens
 */

'use client';

import { useState } from 'react';
import { BigButton } from './BigButton';
import { getMessage } from '@/lib/messages';

interface SOSButtonProps {
  language?: 'en' | 'hi';
  onEmergency?: () => void;
}

export function SOSButton({ language = 'en', onEmergency }: SOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (showConfirm) {
      // Second tap - trigger emergency
      if (onEmergency) onEmergency();
      // Could also trigger tel: link or native emergency
      window.location.href = 'tel:112'; // India emergency
    } else {
      // First tap - show confirmation
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" role="region" aria-label={getMessage('sosTitle', language)}>
      <BigButton
        size="xl"
        variant="danger"
        onClick={handleClick}
        icon={<span style={{ fontSize: '1.8em' }}>🚨</span>}
        className={`
          shadow-2xl ring-4 ring-red-500/50
          animate-pulse
          ${showConfirm ? 'ring-4 ring-red-300 scale-105' : ''}
        `}
        aria-label={getMessage('sosButton', language)}
        aria-describedby={showConfirm ? 'sos-confirm' : undefined}
      >
        {showConfirm
          ? getMessage('emergencyCallNow', language)
          : getMessage('sosButton', language)}
      </BigButton>

      {showConfirm && (
        <div
          id="sos-confirm"
          className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg text-center whitespace-nowrap"
          role="alert"
          aria-live="assertive"
        >
          {getMessage('emergencyMessage', language)}
        </div>
      )}
    </div>
  );
}