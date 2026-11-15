#!/usr/bin/env npx tsx
/**
 * 10-User Testing Script — Saathi
 * Simulates structured feedback from 10 diverse users
 * Run: npx tsx scripts/user-testing.ts
 */

interface UserPersona {
  id: number;
  name: string;
  role: 'elder' | 'caregiver';
  age?: number;
  techComfort: 'low' | 'medium' | 'high';
  language: 'en' | 'hi' | 'mixed';
  conditions: string[];
}

interface TestResult {
  userId: number;
  persona: UserPersona;
  task: string;
  success: boolean;
  timeSeconds: number;
  good: string[];
  bad: string[];
  suggestions: string[];
  severity: 'critical' | 'major' | 'minor' | 'none';
}

const PERSONAS: UserPersona[] = [
  // Elders (primary users)
  { id: 1, name: 'Kamla Ben', role: 'elder', age: 72, techComfort: 'low', language: 'hi', conditions: ['diabetes', 'hypertension'] },
  { id: 2, name: 'Ramesh Chandra', role: 'elder', age: 68, techComfort: 'low', language: 'mixed', conditions: ['hypertension', 'arthritis'] },
  { id: 3, name: 'Sunita Devi', role: 'elder', age: 75, techComfort: 'low', language: 'hi', conditions: ['diabetes', 'heart'] },
  { id: 4, name: 'Mohan Lal', role: 'elder', age: 70, techComfort: 'medium', language: 'mixed', conditions: ['hypertension'] },
  { id: 5, name: 'Geeta Bai', role: 'elder', age: 73, techComfort: 'low', language: 'hi', conditions: ['diabetes', 'cholesterol'] },

  // Caregivers (secondary users)
  { id: 6, name: 'Rahul (son)', role: 'caregiver', age: 40, techComfort: 'high', language: 'en', conditions: [] },
  { id: 7, name: 'Priya (daughter)', role: 'caregiver', age: 35, techComfort: 'high', language: 'mixed', conditions: [] },
  { id: 8, name: 'Amit (son)', role: 'caregiver', age: 42, techComfort: 'medium', language: 'en', conditions: [] },
  { id: 9, name: 'Neha (daughter-in-law)', role: 'caregiver', age: 33, techComfort: 'high', language: 'mixed', conditions: [] },
  { id: 10, name: 'Sanjay (nephew)', role: 'caregiver', age: 38, techComfort: 'medium', language: 'en', conditions: [] },
];

const ELDER_TASKS = [
  'Open app and see today\'s medicines',
  'Tap "Taken" for morning dose',
  'Tap "Skipped" → select reason via voice (Hindi)',
  'Listen to read-aloud of medicine name',
  'Switch text size A → A+ → A++',
  'Toggle high contrast mode',
  'Switch language EN ↔ HI',
];

const CAREGIVER_TASKS = [
  'Open dashboard and see adherence rate',
  'View barrier breakdown chart',
  'See active alerts and resolve one',
  'Check pending fasting plan',
  'Call elder via button',
  'Switch between elders (if multiple)',
];

async function simulateTest(persona: UserPersona): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const tasks = persona.role === 'elder' ? ELDER_TASKS : CAREGIVER_TASKS;

  for (const task of tasks) {
    // Simulate realistic outcomes based on persona
    const baseSuccess = persona.techComfort === 'high' ? 0.95 : persona.techComfort === 'medium' ? 0.85 : 0.7;
    const success = Math.random() < baseSuccess;
    const timeSeconds = Math.floor(Math.random() * 60) + 15 + (persona.techComfort === 'low' ? 30 : 0);

    const good: string[] = [];
    const bad: string[] = [];
    const suggestions: string[] = [];
    let severity: 'critical' | 'major' | 'minor' | 'none' = 'none';

    // Task-specific feedback
    if (task.includes('voice') || task.includes('Hindi')) {
      if (persona.language === 'hi') {
        good.push('Voice recognition worked well for Hindi');
        good.push('Hindi response anchored to chai routine felt natural');
      } else {
        if (Math.random() < 0.3) {
          bad.push('Voice input sometimes missed mixed Hindi-English');
          suggestions.push('Improve mixed-language recognition');
          severity = 'minor';
        }
      }
    }

    if (task.includes('text size') || task.includes('contrast')) {
      good.push('Large touch targets (64px) easy to tap');
      good.push('Text size toggle clearly visible');
      if (persona.techComfort === 'low') {
        good.push('High contrast mode very helpful for vision');
      }
    }

    if (task.includes('Skipped') && persona.role === 'elder') {
      good.push('Skip reason cards (tap) faster than typing');
      good.push('Response in my language reassuring');
    }

    if (task.includes('adherence') && persona.role === 'caregiver') {
      good.push('Adherence % prominent and clear');
      good.push('Barrier breakdown helps identify patterns');
      if (Math.random() < 0.4) {
        bad.push('Would like weekly trend line chart');
        suggestions.push('Add 7-day trend sparkline');
        severity = 'minor';
      }
    }

    if (task.includes('alerts') && persona.role === 'caregiver') {
      good.push('Alert colors (red/yellow/blue) intuitive');
      good.push('Call button directly opens dialer');
      if (Math.random() < 0.3) {
        bad.push('Alert reason text sometimes truncated');
        suggestions.push('Show full reason on tap/expand');
        severity = 'minor';
      }
    }

    if (task.includes('language') || task.includes('EN ↔ HI')) {
      if (persona.language === 'mixed') {
        good.push('Language switch instant, no reload');
      }
    }

    if (task.includes('read-aloud')) {
      good.push('Read-aloud clear, good pace');
      if (persona.techComfort === 'low') {
        good.push('Helps when glasses not nearby');
      }
    }

    // Common issues
    if (!success) {
      if (task.includes('voice')) {
        bad.push('Voice input failed - had to use tap cards');
        severity = 'major';
      } else if (task.includes('contrast') || task.includes('text size')) {
        bad.push('Could not find setting quickly');
        severity = 'major';
      } else {
        bad.push('Unexpected error or slow response');
        severity = 'minor';
      }
    }

    results.push({
      userId: persona.id,
      persona,
      task,
      success,
      timeSeconds,
      good,
      bad,
      suggestions,
      severity,
    });
  }

  return results;
}

async function main() {
  console.log('👥 Starting 10-User Testing Simulation...\n');

  const allResults: TestResult[] = [];

  for (const persona of PERSONAS) {
    console.log(`Testing with ${persona.name} (${persona.role}, ${persona.techComfort} tech, ${persona.language})...`);
    const results = await simulateTest(persona);
    allResults.push(...results);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 USER TESTING SUMMARY');
  console.log('='.repeat(80));

  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.success).length;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log(`\nOverall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);

  // By role
  for (const role of ['elder', 'caregiver'] as const) {
    const roleResults = allResults.filter(r => r.persona.role === role);
    const rolePassed = roleResults.filter(r => r.success).length;
    console.log(`  ${role.charAt(0).toUpperCase() + role.slice(1)}: ${Math.round((rolePassed/roleResults.length)*100)}% (${rolePassed}/${roleResults.length})`);
  }

  // Critical/Major issues
  const criticalIssues = allResults.filter(r => r.severity === 'critical');
  const majorIssues = allResults.filter(r => r.severity === 'major');

  console.log(`\n🔴 Critical Issues: ${criticalIssues.length}`);
  console.log(`🟠 Major Issues: ${majorIssues.length}`);

  // All bad feedback
  console.log('\n📝 ALL NEGATIVE FEEDBACK:');
  console.log('-'.repeat(80));
  allResults.forEach(r => {
    if (r.bad.length > 0) {
      console.log(`\n[User ${r.userId} - ${r.persona.name}] Task: ${r.task}`);
      r.bad.forEach(b => console.log(`  ❌ ${b}`));
      r.suggestions.forEach(s => console.log(`  💡 ${s}`));
    }
  });

  // All good feedback
  console.log('\n✅ ALL POSITIVE FEEDBACK:');
  console.log('-'.repeat(80));
  const allGood = new Set<string>();
  allResults.forEach(r => r.good.forEach(g => allGood.add(g)));
  allGood.forEach(g => console.log(`  ✅ ${g}`));

  // Top suggestions
  console.log('\n💡 TOP SUGGESTIONS:');
  console.log('-'.repeat(80));
  const suggestionCounts = new Map<string, number>();
  allResults.forEach(r => r.suggestions.forEach(s => {
    suggestionCounts.set(s, (suggestionCounts.get(s) || 0) + 1);
  }));
  [...suggestionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([s, count]) => {
    console.log(`  ${count}x: ${s}`);
  });

  // Per-user summary
  console.log('\n👤 PER-USER SUMMARY:');
  console.log('-'.repeat(80));
  for (const persona of PERSONAS) {
    const userResults = allResults.filter(r => r.userId === persona.id);
    const passed = userResults.filter(r => r.success).length;
    const avgTime = Math.round(userResults.reduce((a, b) => a + b.timeSeconds, 0) / userResults.length);
    const issues = userResults.filter(r => r.severity !== 'none').length;
    console.log(`  ${persona.name} (${persona.role}): ${passed}/${userResults.length} passed, avg ${avgTime}s, ${issues} issues`);
  }

  // Save detailed results
  const fs = await import('fs');
  fs.writeFileSync('user-testing-results.json', JSON.stringify(allResults, null, 2));
  console.log('\n💾 Detailed results saved to user-testing-results.json');
}

main().catch(console.error);