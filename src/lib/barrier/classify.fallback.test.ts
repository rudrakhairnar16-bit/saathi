/**
 * Unit Tests — Barrier Fallback Classifier
 * Tests the deterministic keyword-based classifier
 */

import { describe, it, expect } from 'vitest';
import { classifyBarrierFallback, FALLBACK_TEST_CASES } from './classify.fallback';
import type { Barrier, Language } from '@/types';

describe('classifyBarrierFallback', () => {
  // Test all predefined test cases
  FALLBACK_TEST_CASES.forEach(({ text, language, expectedCategory, shouldRedFlag }) => {
    it(`classifies "${text}" (${language}) as ${expectedCategory}${shouldRedFlag ? ' with red flag' : ''}`, () => {
      const result = classifyBarrierFallback(text, language as Language);
      expect(result.category).toBe(expectedCategory);
      if (shouldRedFlag) {
        expect(result.redFlag).toBe(true);
      }
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.source).toBe('fallback');
    });
  });

  // Additional edge cases
  it('returns "other" for unrecognized text with low confidence', () => {
    const result = classifyBarrierFallback('xyz random text', 'en');
    expect(result.category).toBe('other');
    expect(result.confidence).toBeLessThanOrEqual(0.2);
  });

  it('handles empty string', () => {
    const result = classifyBarrierFallback('', 'en');
    expect(result.category).toBe('other');
  });

  it('handles mixed case', () => {
    const result = classifyBarrierFallback('FORGOT to take it', 'en');
    expect(result.category).toBe('forgot');
  });

  it('detects red flags in English', () => {
    const result = classifyBarrierFallback('chest pain after medicine', 'en');
    expect(result.redFlag).toBe(true);
    expect(result.category).toBe('side_effect');
  });

  it('detects red flags in Hindi', () => {
    const result = classifyBarrierFallback('सीने में दर्द हो रहा है', 'hi');
    expect(result.redFlag).toBe(true);
  });

  it('detects red flags in mixed', () => {
    const result = classifyBarrierFallback('seene mein dard hai', 'hi');
    expect(result.redFlag).toBe(true);
  });

  it('returns matched phrases', () => {
    const result = classifyBarrierFallback('I forgot to take my medicine', 'en');
    expect(result.matchedPhrases.length).toBeGreaterThan(0);
    expect(result.matchedPhrases.some(p => p.includes('forgot'))).toBe(true);
  });
});

describe('Barrier Categories Coverage', () => {
  const categories: Barrier[] = [
    'forgot',
    'side_effect',
    'feels_better',
    'cost_or_stock',
    'swallowing',
    'fear_or_belief',
    'other',
  ];

  categories.forEach(category => {
    it(`has test cases for ${category}`, () => {
      const casesForCategory = FALLBACK_TEST_CASES.filter(c => c.expectedCategory === category);
      expect(casesForCategory.length).toBeGreaterThan(0);
    });
  });
});