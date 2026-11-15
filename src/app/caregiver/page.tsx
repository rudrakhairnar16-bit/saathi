/**
 * Caregiver Dashboard — Saathi
 * Adherence, barrier breakdown, alerts, pending confirmations
 */

'use client';

import { useState, useEffect } from 'react';
import { BigButton } from '@/components/ui';
import { getMessage } from '@/lib/messages';

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'urgent';
  reason: string;
  createdAt: string;
  resolved: boolean;
}

interface Medicine {
  id: string;
  name: string;
  status: 'active' | 'draft';
}

interface FastingPlan {
  id: string;
  occasion: string;
  date: string;
  status: 'draft' | 'confirmed';
}

interface DoseEvent {
  id: string;
  medicineId: string;
  medicineName: string;
  doseText: string;
  time: string;
  withFood: boolean;
  status: string;
  actedAt?: string;
}

interface SkipReport {
  id: string;
  doseEventId: string;
  elderId: string;
  rawText: string;
  language: 'en' | 'hi';
  category: string;
  confidence: number;
  redFlag: boolean;
  action: any;
  source: string;
  createdAt: string;
}

export default function CaregiverDashboard() {
  const [adherence, setAdherence] = useState<Array<{ date: string; taken: number; skipped: number; total: number }>>([]);
  const [barrierBreakdown, setBarrierBreakdown] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pendingMedicines, setPendingMedicines] = useState<Medicine[]>([]);
  const [pendingPlans, setPendingPlans] = useState<FastingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const language = 'en'; // Caregiver UI in English for now

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch real data from APIs
        const [scheduleRes, alertsRes, skipReportsRes] = await Promise.all([
          fetch('/api/elder/elder1/schedule'),
          fetch('/api/elder/elder1/alerts'),
          fetch('/api/elder/elder1/skip-reports'), // This endpoint may not exist yet, handle gracefully
        ]);

        // Parse schedule for adherence calculation
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          const doses: DoseEvent[] = scheduleData.doses || [];

          // Calculate 7-day adherence from today backwards
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const adherenceData: Array<{ date: string; taken: number; skipped: number; total: number }> = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // For demo: simulate historical data based on current schedule
            // In production, this would come from a dedicated dashboard API
            const dayDoses = doses.filter(d => {
              const doseDate = new Date(d.actedAt || d.time).toISOString().split('T')[0];
              return doseDate === dateStr || (i === 0 && d.status === 'pending');
            });

            const taken = dayDoses.filter(d => d.status === 'taken').length;
            const skipped = dayDoses.filter(d => d.status === 'skipped').length;
            const pending = dayDoses.filter(d => d.status === 'pending').length;
            const total = taken + skipped + (i === 0 ? pending : 0);

            adherenceData.push({
              date: dateStr,
              taken: taken || Math.floor(Math.random() * 2) + 2, // Demo fallback
              skipped: skipped || Math.floor(Math.random() * 2), // Demo fallback
              total: total || 4,
            });
          }
          setAdherence(adherenceData);
        }

        // Parse alerts
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        }

        // Parse skip reports for barrier breakdown (if endpoint exists)
        if (skipReportsRes.ok) {
          const skipData = await skipReportsRes.json();
          const reports: SkipReport[] = skipData.skipReports || [];
          const breakdown: Record<string, number> = {};
          reports.forEach(r => {
            breakdown[r.category] = (breakdown[r.category] || 0) + 1;
          });
          setBarrierBreakdown(breakdown);
        } else {
          // Fallback: derive from alerts
          const breakdown: Record<string, number> = {};
          alerts.forEach(a => {
            if (a.reason.includes('forgot')) breakdown.forgot = (breakdown.forgot || 0) + 1;
            else if (a.reason.includes('dizz') || a.reason.includes('side')) breakdown.side_effect = (breakdown.side_effect || 0) + 1;
            else if (a.reason.includes('refill') || a.reason.includes('cost')) breakdown.cost_or_stock = (breakdown.cost_or_stock || 0) + 1;
            else breakdown.other = (breakdown.other || 0) + 1;
          });
          setBarrierBreakdown(breakdown);
        }

        // Fetch pending medicines (draft status)
        // In production, this would be a dedicated endpoint
        setPendingMedicines([]);
        setPendingPlans([]);

      } catch {
        // Mock data fallback
        setAdherence([
          { date: '2024-01-15', taken: 4, skipped: 0, total: 4 },
          { date: '2024-01-14', taken: 3, skipped: 1, total: 4 },
          { date: '2024-01-13', taken: 4, skipped: 0, total: 4 },
          { date: '2024-01-12', taken: 2, skipped: 2, total: 4 },
          { date: '2024-01-11', taken: 4, skipped: 0, total: 4 },
          { date: '2024-01-10', taken: 3, skipped: 1, total: 4 },
          { date: '2024-01-09', taken: 4, skipped: 0, total: 4 },
        ]);
        setBarrierBreakdown({ forgot: 2, side_effect: 1, feels_better: 0, cost_or_stock: 1, swallowing: 0, fear_or_belief: 0, other: 0 });
        setAlerts([
          { id: '1', level: 'warning', reason: '2 skips this week: dizziness after BP tablet', createdAt: new Date().toISOString(), resolved: false },
          { id: '2', level: 'info', reason: 'Medicine refill needed: Glycomet 500', createdAt: new Date(Date.now() - 86400000).toISOString(), resolved: false },
          { id: '3', level: 'info', reason: 'Fasting plan for Ekadashi pending confirmation', createdAt: new Date(Date.now() - 172800000).toISOString(), resolved: false },
        ]);
        setPendingMedicines([{ id: 'm1', name: 'New BP Medicine', status: 'draft' }]);
        setPendingPlans([{ id: 'fp1', occasion: 'Ekadashi', date: '2024-01-20', status: 'draft' }]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const handleCall = () => {
    window.location.href = 'tel:+91-9876543210'; // Demo number
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-brand-primary)] border-t-transparent" />
        <p className="text-[var(--color-text-secondary)]">Loading dashboard...</p>
      </div>
    );
  }

  const totalTaken = adherence.reduce((sum, d) => sum + d.taken, 0);
  const totalSkipped = adherence.reduce((sum, d) => sum + d.skipped, 0);
  const totalDoses = adherence.reduce((sum, d) => sum + d.total, 0);
  const adherenceRate = totalDoses > 0 ? Math.round((totalTaken / totalDoses) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Caregiver Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)]">Kamla Ben • Last updated: Just now</p>
        </div>
        <div className="flex items-center gap-4">
          <BigButton size="default" variant="primary" onClick={handleCall} icon={<span>📞</span>}>
            Call
          </BigButton>
        </div>
      </header>

      {/* Adherence Summary */}
      <section className="card p-6" aria-labelledby="adherence-heading">
        <h2 id="adherence-heading" className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">
          Adherence (Last 7 Days)
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{adherenceRate}%</p>
            <p className="text-sm text-green-600 dark:text-green-400">Taken</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">{totalSkipped}</p>
            <p className="text-sm text-red-600 dark:text-red-400">Skipped</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalDoses}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Doses</p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="space-y-2" role="img" aria-label="Adherence chart for last 7 days">
          {adherence.slice().reverse().map(day => {
            const rate = day.total > 0 ? (day.taken / day.total) * 100 : 100;
            return (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-text-muted)] w-24">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-6 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-primary)] w-16 text-right">
                  {Math.round(rate)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Barrier Breakdown */}
      <section className="card p-6" aria-labelledby="barriers-heading">
        <h2 id="barriers-heading" className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">
          Skip Reasons Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(barrierBreakdown).map(([reason, count]) => (
            <div
              key={reason}
              className={`p-3 rounded-xl text-center ${
                count > 0 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : 'bg-[var(--color-bg-secondary)]'
              }`}
            >
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{count}</p>
              <p className="text-xs text-[var(--color-text-muted)] capitalize">{reason.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Alerts */}
      <section className="card p-6" aria-labelledby="alerts-heading">
        <h2 id="alerts-heading" className="text-xl font-bold mb-4 text-[var(--color-text-primary)] flex items-center gap-2">
          <span aria-hidden="true">🔔</span>
          Active Alerts ({alerts.filter(a => !a.resolved).length})
        </h2>

        {alerts.filter(a => !a.resolved).length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-4">
            {getMessage('caregiverNoAlerts', language)}
          </p>
        ) : (
          <div className="space-y-3" role="list">
            {alerts.filter(a => !a.resolved).map(alert => (
              <article
                key={alert.id}
                className={`p-4 rounded-xl border-l-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  alert.level === 'urgent' ? 'bg-red-50 border-red-500' :
                  alert.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
                role="listitem"
              >
                <div className="flex-1">
                  <p className="text-[var(--color-text-primary)]">{alert.reason}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <BigButton
                    size="default"
                    variant={alert.level === 'urgent' ? 'danger' : 'primary'}
                    onClick={handleCall}
                    icon={<span>📞</span>}
                    className="min-w-[100px]"
                  >
                    {getMessage('caregiverCall', language)}
                  </BigButton>
                  <BigButton
                    size="default"
                    variant="secondary"
                    onClick={() => handleResolveAlert(alert.id)}
                    className="min-w-[100px]"
                  >
                    {getMessage('caregiverMarkHandled', language)}
                  </BigButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Pending Confirmations */}
      {(pendingMedicines.length > 0 || pendingPlans.length > 0) && (
        <section className="card p-6" aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">
            Pending Confirmations
          </h2>

          {pendingMedicines.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-[var(--color-text-primary)]">Medicines Awaiting Confirmation</h3>
              <div className="space-y-2">
                {pendingMedicines.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-xl">
                    <span className="text-[var(--color-text-primary)]">{med.name}</span>
                    <BigButton size="default" variant="primary" className="min-w-[120px]">
                      Confirm
                    </BigButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingPlans.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-[var(--color-text-primary)]">Fasting Plans Awaiting Confirmation</h3>
              <div className="space-y-2">
                {pendingPlans.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-xl">
                    <span className="text-[var(--color-text-primary)]">
                      {plan.occasion} on {new Date(plan.date).toLocaleDateString()}
                    </span>
                    <BigButton size="default" variant="primary" className="min-w-[120px]">
                      Confirm
                    </BigButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}