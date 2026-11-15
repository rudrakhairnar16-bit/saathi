/**
 * Elder Medicines Page — Saathi
 * Big Taken/Skipped buttons, undo, read-aloud
 */

'use client';

import { useState, useEffect } from 'react';
import { BigButton } from '@/components/ui';
import { useElderContext } from '../layout';
import { getMessage, getAllMessages } from '@/lib/messages';

interface DoseEvent {
  id: string;
  medicineId: string;
  medicineName: string;
  doseText: string;
  time: string;
  withFood: boolean;
  status: 'pending' | 'taken' | 'skipped';
  actedAt?: string;
}

export default function ElderMedicines() {
  const { language } = useElderContext();
  const [doses, setDoses] = useState<DoseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentAction, setRecentAction] = useState<{ doseId: string; action: 'taken' | 'skipped' } | null>(null);
  const messages = getAllMessages(language);

  useEffect(() => {
    async function fetchDoses() {
      try {
        const res = await fetch('/api/elder/elder1/schedule');
        if (res.ok) {
          const data = await res.json();
          setDoses(data.doses || []);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch {
        // Mock data for demo
        setDoses([
          { id: '1', medicineId: 'm1', medicineName: 'Glycomet 500', doseText: '500 mg', time: '08:00', withFood: true, status: 'taken', actedAt: new Date().toISOString() },
          { id: '2', medicineId: 'm2', medicineName: 'Telma 40', doseText: '40 mg', time: '08:00', withFood: false, status: 'taken', actedAt: new Date().toISOString() },
          { id: '3', medicineId: 'm3', medicineName: 'Ecosprin 75', doseText: '75 mg', time: '20:00', withFood: true, status: 'pending' },
          { id: '4', medicineId: 'm4', medicineName: 'Paracetamol 500', doseText: '500 mg', time: '14:00', withFood: true, status: 'pending' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchDoses();
  }, []);

  const handleMarkTaken = async (doseId: string) => {
    setRecentAction({ doseId, action: 'taken' });
    setDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'taken', actedAt: new Date().toISOString() } : d));
    try {
      await fetch(`/api/dose/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doseEventId: doseId, elderId: 'elder1', text: 'taken', language }),
      });
    } catch {}
  };

  const handleMarkSkipped = async (doseId: string) => {
    setRecentAction({ doseId, action: 'skipped' });
    setDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'skipped', actedAt: new Date().toISOString() } : d));
  };

  const handleUndo = (doseId: string) => {
    setDoses(prev => prev.map(d => d.id === doseId ? { ...d, status: 'pending', actedAt: undefined } : d));
    setRecentAction(null);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-brand-primary)] border-t-transparent" />
        <p className="text-[var(--color-text-secondary)]">Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {getMessage('languageEnglish', language) === 'English' ? 'My Medicines' : 'मेरी दवाएं'}
        </h1>
        <button
          onClick={() => speakText(
            doses.map(d => `${d.medicineName} ${d.doseText} at ${d.time} ${d.withFood ? 'with food' : 'empty stomach'}`).join('. ')
          )}
          className="p-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          aria-label={getMessage('readAloud', language)}
        >
          <span style={{ fontSize: '1.5em' }}>🔊</span>
        </button>
      </header>

      <div className="space-y-3" role="list" aria-label="Medicine list">
        {doses.map(dose => (
          <article
            key={dose.id}
            className={`card p-4 relative ${
              dose.status === 'taken' ? 'border-green-300 bg-green-50 dark:bg-green-900/10' :
              dose.status === 'skipped' ? 'border-red-300 bg-red-50 dark:bg-red-900/10' :
              'border-[var(--color-border-light)]'
            }`}
            role="listitem"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[var(--color-bg-secondary)]">
                {dose.status === 'taken' ? '✅' : dose.status === 'skipped' ? '❌' : '⏰'}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
                  {dose.medicineName}
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  {dose.doseText} • {dose.time} {dose.withFood ? '• With food' : '• Empty stomach OK'}
                </p>
                {dose.actedAt && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {dose.status === 'taken' ? 'Taken' : 'Skipped'} at {new Date(dose.actedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {dose.status === 'pending' ? (
                  <>
                    <BigButton
                      size="default"
                      variant="success"
                      onClick={() => handleMarkTaken(dose.id)}
                      icon={<span>✅</span>}
                      className="w-full"
                    >
                      {getMessage('languageEnglish', language) === 'English' ? 'Taken' : 'ली'}
                    </BigButton>
                    <BigButton
                      size="default"
                      variant="danger"
                      onClick={() => handleMarkSkipped(dose.id)}
                      icon={<span>⏭️</span>}
                      className="w-full"
                    >
                      {getMessage('languageEnglish', language) === 'English' ? 'Skipped' : 'छूटी'}
                    </BigButton>
                  </>
                ) : (
                  <BigButton
                    size="default"
                    variant="secondary"
                    onClick={() => handleUndo(dose.id)}
                    icon={<span>↩️</span>}
                    className="w-full"
                  >
                    {getMessage('confirmUndo', language)}
                  </BigButton>
                )}
              </div>
            </div>
          </article>
        ))}

        {doses.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-[var(--color-text-secondary)]">
              {getMessage('noDosesToday', language)}
            </p>
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {recentAction && (
        <div
          className="fixed bottom-24 left-4 right-4 max-w-xl mx-auto z-50 animate-slide-up"
          role="alert"
          aria-live="polite"
        >
          <div className="card p-4 flex items-center justify-between">
            <span className="text-[var(--color-text-primary)]">
              {recentAction.action === 'taken'
                ? getMessage('doseTaken', language)
                : getMessage('doseSkipped', language)}
            </span>
            <BigButton size="default" variant="secondary" onClick={() => handleUndo(recentAction.doseId)}>
              {getMessage('confirmUndo', language)}
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}