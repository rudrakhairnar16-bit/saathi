/**
 * Landing Page — Saathi
 * One-line pitch visible, "Try Demo" button, accessibility-first
 */

import Link from 'next/link';
import { BigButton } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative py-12 lg:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            {/* One-line pitch */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-[var(--color-text-primary)]">
              Reminders solve forgetting.
              <br />
              <span className="text-[var(--color-brand-primary)]">Saathi solves all the reasons elders miss medicines.</span>
            </h1>

            <p className="text-xl lg:text-2xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
              Understand <strong>why</strong> a dose was missed — in their language.
              Convert doctor visits into simple notes. Plan medicines around fasting days.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/elder" className="w-full sm:w-auto">
                <BigButton size="xl" variant="primary" fullWidth>
                  Try Demo
                </BigButton>
              </Link>
              <Link href="/caregiver" className="w-full sm:w-auto">
                <BigButton size="xl" variant="secondary" fullWidth>
                  Caregiver View
                </BigButton>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">🔒 Offline-first</span>
              <span className="flex items-center gap-1">♿ AAA Accessibility</span>
              <span className="flex items-center gap-1">🌐 Hindi + English</span>
              <span className="flex items-center gap-1">🛡️ Human-in-the-loop</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[var(--color-bg-secondary)]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[var(--color-text-primary)]">
            Three Features That Go Beyond Alarms
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Feature 1: Kyun Chhoda */}
            <article className="card p-6">
              <div className="text-5xl mb-4" aria-hidden="true">🧠</div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                Kyun Chhoda? (Why Skipped?)
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                When a dose is missed, Saathi asks why — by voice, text, or tap cards.
                Classifies into 7 reasons and takes specific action for each.
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• Forgot → Routine anchoring</li>
                <li>• Side effect → Doctor alert</li>
                <li>• Feels better → Education</li>
                <li>• Cost/Stock → Refill alert</li>
                <li>• Swallowing → Format question</li>
                <li>• Fear/Belief → Empathy + family heads-up</li>
              </ul>
            </article>

            {/* Feature 2: Doctor Ki Baat */}
            <article className="card p-6">
              <div className="text-5xl mb-4" aria-hidden="true">🩺</div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                Doctor Ki Baat (Memory Bridge)
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                Paste or dictate what the doctor said. Get 5 simple lines in your language,
                a draft medicine list, and overlap warnings across prescriptions.
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• 5 plain-language lines</li>
                <li>• Draft medicines (need confirmation)</li>
                <li>• Duplicate ingredient detection</li>
                <li>• Pre-visit summary for doctor</li>
              </ul>
            </article>

            {/* Feature 3: Vrat Planner */}
            <article className="card p-6">
              <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">
                Vrat-Roza-Tyohar Planner
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                Tell Saathi about a fasting day. Get per-medicine guidance
                (with food / empty stomach OK / ask doctor) with questions for your doctor.
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• Ekadashi, Navratri, Roza</li>
                <li>• Paryushan, Karva Chauth</li>
                <li>• High-risk meds → always "ask doctor"</li>
                <li>• Draft until caregiver confirms</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
            Built for Elders, Not Just About Them
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)] flex items-center gap-2">
                <span aria-hidden="true">👁️</span> Vision
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>• 20px minimum body text</li>
                <li>• A / A+ / A++ text size toggle</li>
                <li>• High contrast mode (WCAG AAA)</li>
                <li>• Read-aloud on every screen</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)] flex items-center gap-2">
                <span aria-hidden="true">🤲</span> Motor & Cognitive
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>• 64px minimum tap targets</li>
                <li>• No swipe/hover-only actions</li>
                <li>• Single column, one task per screen</li>
                <li>• Icon + label on every control</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)] flex items-center gap-2">
                <span aria-hidden="true">🗣️</span> Language & Voice
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>• Hindi (Devanagari) + English</li>
                <li>• Voice input (Web Speech API)</li>
                <li>• Tap cards as fallback</li>
                <li>• Mixed Hinglish understood</li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text-primary)] flex items-center gap-2">
                <span aria-hidden="true">🛡️</span> Safety First
              </h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>• AI never changes doses</li>
                <li>• All AI outputs are drafts</li>
                <li>• Human confirmation required</li>
                <li>• Works offline (no API key needed)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-light)]">
        <div className="container mx-auto text-center text-sm text-[var(--color-text-muted)]">
          <p>Saathi — Elderly Medication Companion for Catalyst Solo AI Hackathon</p>
          <p className="mt-1">Not a medical device. Always consult your doctor.</p>
        </div>
      </footer>
    </div>
  );
}