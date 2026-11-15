/**
 * Fallback Keyword Classifier — Saathi Barrier Engine
 * Deterministic, no-LLM classification for offline mode.
 * Supports Hindi (Devanagari), English, and Hinglish (mixed).
 */

import type { Barrier, Language, AISource } from '@/types';
import type { ClassificationResult, DecisionContext } from './types';
import { BARRIER_CATEGORIES, isRedFlag, getEmergencyMessage } from './types';

// ============================================================================
// Text Normalization
// ============================================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove punctuation except spaces
    .replace(/[.,!?;:()[\]{}"'`~@#$%^&*_+=|\\/<>-]/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(t => t.length > 0);
}

// ============================================================================
// Scoring Functions
// ============================================================================

function scorePhrases(text: string, phrases: string[]): { score: number; matched: string[] } {
  const normalized = normalizeText(text);
  let score = 0;
  const matched: string[] = [];

  for (const phrase of phrases) {
    const normPhrase = normalizeText(phrase);
    if (normalized.includes(normPhrase)) {
      // Longer phrases get higher weight
      const weight = normPhrase.split(' ').length;
      score += weight * 2;
      matched.push(phrase);
    }
  }

  return { score, matched };
}

function scoreTokens(text: string, phrases: string[]): { score: number; matched: string[] } {
  const tokens = tokenize(text);
  let score = 0;
  const matched: string[] = [];

  for (const phrase of phrases) {
    const phraseTokens = tokenize(phrase);
    for (const pToken of phraseTokens) {
      if (tokens.includes(pToken)) {
        score += 1;
        matched.push(pToken);
      }
    }
  }

  return { score, matched };
}

// ============================================================================
// Main Classification Function
// ============================================================================

export function classifyBarrierFallback(
  text: string,
  language: Language,
  context?: DecisionContext
): ClassificationResult {
  // 1. Check red flags FIRST (overrides everything)
  const redFlag = isRedFlag(text, language);

  if (redFlag) {
    return {
      category: 'side_effect', // Red flags route through side_effect for urgent handling
      confidence: 0.95,
      redFlag: true,
      matchedPhrases: ['red_flag_detected'],
      source: 'fallback',
    };
  }

  // 2. Score each barrier category
  const scores: Record<Barrier, { score: number; matched: string[] }> = {
    forgot: { score: 0, matched: [] },
    side_effect: { score: 0, matched: [] },
    feels_better: { score: 0, matched: [] },
    cost_or_stock: { score: 0, matched: [] },
    swallowing: { score: 0, matched: [] },
    fear_or_belief: { score: 0, matched: [] },
    other: { score: 0, matched: [] },
  };

  // Select phrase lists based on language
  for (const [barrier, category] of Object.entries(BARRIER_CATEGORIES)) {
    const barrierKey = barrier as Barrier;
    const phrases = language === 'hi'
      ? [...category.typicalPhrases.hi, ...category.typicalPhrases.mixed]
      : language === 'en'
        ? [...category.typicalPhrases.en, ...category.typicalPhrases.mixed]
        : [...category.typicalPhrases.en, ...category.typicalPhrases.hi, ...category.typicalPhrases.mixed];

    // Exact phrase matching (higher weight)
    const phraseScore = scorePhrases(text, phrases);
    // Token matching (lower weight)
    const tokenScore = scoreTokens(text, phrases);

    scores[barrierKey] = {
      score: phraseScore.score + tokenScore.score * 0.5,
      matched: [...phraseScore.matched, ...tokenScore.matched],
    };
  }

  // 3. Find highest scoring category
  let bestCategory: Barrier = 'other';
  let bestScore = -1;
  let bestMatched: string[] = [];

  for (const [barrier, result] of Object.entries(scores)) {
    if (result.score > bestScore) {
      bestScore = result.score;
      bestCategory = barrier as Barrier;
      bestMatched = result.matched;
    }
  }

  // 4. Calculate confidence (normalized)
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s.score, 0);
  const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1) : 0.1;

  // 5. If no clear match, return 'other' with low confidence
  if (bestScore === 0) {
    return {
      category: 'other',
      confidence: 0.1,
      redFlag: false,
      matchedPhrases: [],
      source: 'fallback',
    };
  }

  return {
    category: bestCategory,
    confidence: Math.max(confidence, 0.3), // Minimum 30% if matched
    redFlag: false,
    matchedPhrases: bestMatched,
    source: 'fallback',
  };
}

// ============================================================================
// Batch Classification (for testing)
// ============================================================================

export interface TestCase {
  text: string;
  language: Language;
  expectedCategory: Barrier;
  shouldRedFlag?: boolean;
}

export const FALLBACK_TEST_CASES: TestCase[] = [
  // English
  { text: 'I forgot to take it', language: 'en', expectedCategory: 'forgot' },
  { text: 'forgot my medicine', language: 'en', expectedCategory: 'forgot' },
  { text: 'slipped my mind completely', language: 'en', expectedCategory: 'forgot' },
  { text: 'was busy and forgot', language: 'en', expectedCategory: 'forgot' },

  { text: 'felt dizzy after taking it', language: 'en', expectedCategory: 'side_effect' },
  { text: 'nausea and vomiting', language: 'en', expectedCategory: 'side_effect' },
  { text: 'bad reaction to medicine', language: 'en', expectedCategory: 'side_effect' },
  { text: 'headache after dose', language: 'en', expectedCategory: 'side_effect' },

  { text: 'feeling better now', language: 'en', expectedCategory: 'feels_better' },
  { text: 'I am cured dont need it', language: 'en', expectedCategory: 'feels_better' },
  { text: 'no need for medicine anymore', language: 'en', expectedCategory: 'feels_better' },

  { text: 'medicine finished', language: 'en', expectedCategory: 'cost_or_stock' },
  { text: 'too expensive cannot afford', language: 'en', expectedCategory: 'cost_or_stock' },
  { text: 'out of stock at pharmacy', language: 'en', expectedCategory: 'cost_or_stock' },

  { text: 'hard to swallow the tablet', language: 'en', expectedCategory: 'swallowing' },
  { text: 'choking on big pill', language: 'en', expectedCategory: 'swallowing' },

  { text: 'worried about side effects', language: 'en', expectedCategory: 'fear_or_belief' },
  { text: 'scared of addiction', language: 'en', expectedCategory: 'fear_or_belief' },
  { text: 'afraid it will harm me', language: 'en', expectedCategory: 'fear_or_belief' },

  // Hindi (Devanagari)
  { text: 'भूल गई थी', language: 'hi', expectedCategory: 'forgot' },
  { text: 'याद नहीं आया', language: 'hi', expectedCategory: 'forgot' },
  { text: 'भूल गया दवा लेना', language: 'hi', expectedCategory: 'forgot' },

  { text: 'चक्कर आया', language: 'hi', expectedCategory: 'side_effect' },
  { text: 'उल्टी हुई', language: 'hi', expectedCategory: 'side_effect' },
  { text: 'तबीयत खराब लगी', language: 'hi', expectedCategory: 'side_effect' },
  { text: 'सिर दर्द हुआ', language: 'hi', expectedCategory: 'side_effect' },

  { text: 'अब ठीक हूँ', language: 'hi', expectedCategory: 'feels_better' },
  { text: 'जरूरत नहीं है अब', language: 'hi', expectedCategory: 'feels_better' },

  { text: 'दवा खत्म हो गई', language: 'hi', expectedCategory: 'cost_or_stock' },
  { text: 'बहुत महंगी है', language: 'hi', expectedCategory: 'cost_or_stock' },
  { text: 'पैसा नहीं है दवा के लिए', language: 'hi', expectedCategory: 'cost_or_stock' },

  { text: 'निगलने में दिक्कत', language: 'hi', expectedCategory: 'swallowing' },
  { text: 'गोली बड़ी है निगल नहीं पाती', language: 'hi', expectedCategory: 'swallowing' },

  { text: 'डर लगता है साइड इफेक्ट से', language: 'hi', expectedCategory: 'fear_or_belief' },
  { text: 'आदत पड़ जाएगी', language: 'hi', expectedCategory: 'fear_or_belief' },
  { text: 'नुकसान होगा', language: 'hi', expectedCategory: 'fear_or_belief' },

  // Mixed (Hinglish)
  { text: 'bhool gayi thi dawai', language: 'hi', expectedCategory: 'forgot' },
  { text: 'forget ho gaya', language: 'hi', expectedCategory: 'forgot' },
  { text: 'chakkar aaya medicine ke baad', language: 'hi', expectedCategory: 'side_effect' },
  { text: 'side effect hua', language: 'hi', expectedCategory: 'side_effect' },
  { text: 'ab theek hoon', language: 'hi', expectedCategory: 'feels_better' },
  { text: 'dawai khatam ho gayi', language: 'hi', expectedCategory: 'cost_or_stock' },
  { text: 'medicine mahngi hai', language: 'hi', expectedCategory: 'cost_or_stock' },
  { text: 'nigalne mein problem', language: 'hi', expectedCategory: 'swallowing' },
  { text: 'darr lagta hai side effects se', language: 'hi', expectedCategory: 'fear_or_belief' },

  // Red flags
  { text: 'chest pain after taking medicine', language: 'en', expectedCategory: 'side_effect', shouldRedFlag: true },
  { text: 'seene mein dard ho raha hai', language: 'hi', expectedCategory: 'side_effect', shouldRedFlag: true },
  { text: 'fainting feeling', language: 'en', expectedCategory: 'side_effect', shouldRedFlag: true },
  { text: 'behoshi si lag rahi', language: 'hi', expectedCategory: 'side_effect', shouldRedFlag: true },
  { text: 'cannot breathe properly', language: 'en', expectedCategory: 'side_effect', shouldRedFlag: true },
  { text: 'saans nahi aa rahi', language: 'hi', expectedCategory: 'side_effect', shouldRedFlag: true },

  // Other
  { text: 'some random reason', language: 'en', expectedCategory: 'other' },
  { text: 'any other reason', language: 'hi', expectedCategory: 'other' },
];

// ============================================================================
// Emergency Message Helper
// ============================================================================

export function getFallbackEmergencyMessage(language: Language): string {
  return getEmergencyMessage(language);
}