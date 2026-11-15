import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Saathi — Elderly Medication Companion',
  description: 'Saathi helps elders manage medications by understanding why doses are missed, converting doctor notes, and planning for fasting days.',
  keywords: ['elderly care', 'medication adherence', 'health', 'accessibility', 'caregiver'],
  authors: [{ name: 'Saathi Team' }],
  creator: 'Saathi',
  publisher: 'Saathi',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://saathi.app',
    title: 'Saathi — Elderly Medication Companion',
    description: 'Understanding why elders miss doses, not just that they did.',
    siteName: 'Saathi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saathi — Elderly Medication Companion',
    description: 'Understanding why elders miss doses, not just that they did.',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefef8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${jetbrains.variable} h-full antialiased text-base`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Live region for screen reader announcements */}
        <div id="live-region" className="live-region" aria-live="polite" aria-atomic="true" />

        {children}
      </body>
    </html>
  );
}