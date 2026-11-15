/**
 * Elder Home Page — Saathi
 * 3 big buttons: Take Medicine, Talk to Saathi, I Need Help
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BigButton } from '@/components/ui';
import { useElderContext } from './layout';
import { getMessage, getAllMessages } from '@/lib/messages';

export default function ElderHome() {
  const { language } = useElderContext();
  const [doses, setDoses] = useState<Array<{ id: string; medicineName: string; time: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const messages = getAllMessages(language);

  // Fetch today's doses
  useEffect(() => {
    async function fetchDoses() {
      try {
        const res = await fetch('/api/elder/elder1/schedule');
        if (res.ok) {
          const data = await res.json();
          setDoses(data.doses || []);
        }
      } catch {
        // Use mock data for demo
        setDoses([
          { id: '1', medicineName: 'Glycomet 500', time: '08:00', status: 'taken' },
          { id: '2', medicineName: 'Telma 40', time: '08:00', status: 'taken' },
          { id: '3', medicineName: 'Ecosprin 75', time: '20:00', status: 'pending' },
          { id: '4', medicineName: 'Paracetamol 500', time: '14:00', status: 'pending' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchDoses();
  }, []);

  const pendingCount = doses.filter(d => d.status === 'pending').length;
  const takenCount = doses.filter(d => d.status === 'taken').length;
  const totalCount = doses.length;

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      {/* Welcome Card */}
      <section className="card p-6 text-center" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading" className="text-2xl font-bold mb-2 text-[var(--color-text-primary)]">
          {getMessage(language === 'hi' ? 'नमस्ते, माँ' : 'Hello, Maa', language)}
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          {pendingCount > 0
            ? getMessage('doseSkipped', language).replace('Medicine marked as skipped. Let\'s understand why.', `${pendingCount} medicine${pendingCount > 1 ? 's' : ''} due now`)
            : getMessage('allDosesTaken', language)}
        </p>
      </section>

      {/* Three Big Buttons */}
      <section aria-labelledby="actions-heading" className="space-y-4">
        <h3 id="actions-heading" className="sr-only">Main Actions</h3>

        <Link href="/elder/medicines" className="block">
          <BigButton
            size="xl"
            variant="primary"
            fullWidth
            icon={<span style={{ fontSize: '1.8em' }}>💊</span>}
          >
            {getMessage('languageEnglish', language) === 'English' ? 'Take My Medicine' : 'मेरी दवा लें'}
          </BigButton>
        </Link>

        <Link href="/elder/why-skipped" className="block">
          <BigButton
            size="xl"
            variant="secondary"
            fullWidth
            icon={<span style={{ fontSize: '1.8em' }}>💬</span>}
          >
            {getMessage('languageEnglish', language) === 'English' ? 'Talk to Saathi' : 'साथी से बात करें'}
          </BigButton>
        </Link>

        <Link href="/elder/help" className="block">
          <BigButton
            size="xl"
            variant="danger"
            fullWidth
            icon={<span style={{ fontSize: '1.8em' }}>🆘</span>}
          >
            {getMessage('languageEnglish', language) === 'English' ? 'I Need Help' : 'मुझे मदद चाहिए'}
          </BigButton>
        </Link>
      </section>

      {/* Today's Medicines Preview */}
      {totalCount > 0 && (
        <section className="card p-4" aria-labelledby="medicines-heading">
          <h3 id="medicines-heading" className="text-lg font-bold mb-3 text-[var(--color-text-primary)] flex items-center gap-2">
            <span aria-hidden="true">📋</span>
            Today's Medicines ({takenCount}/{totalCount} taken)
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {doses.slice(0, 4).map(dose => (
              <div
                key={dose.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  dose.status === 'taken'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                    : dose.status === 'skipped'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                    : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {dose.status === 'taken' ? '✅' : dose.status === 'skipped' ? '❌' : '⏰'}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{dose.medicineName}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{dose.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  dose.status === 'taken' ? 'bg-green-100 text-green-800' :
                  dose.status === 'skipped' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {dose.status === 'taken' ? 'Taken' : dose.status === 'skipped' ? 'Skipped' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/elder/medicines" className="block mt-3 text-center text-[var(--color-brand-primary)] font-medium">
            View All Medicines →
          </Link>
        </section>
      )}
    </div>
  );
}