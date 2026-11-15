/**
 * Translation Service — Saathi
 * Uses Google Translate API (via unofficial endpoint) for dynamic content translation.
 * Static UI strings should use the messages system in @/lib/messages.
 */

export type Language = 'en' | 'hi';

// Google Translate free endpoint (unofficial, rate limited)
// For production, use official Google Cloud Translation API
const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

class TranslationService {
  private cache = new Map<string, string>();

  private getCacheKey(text: string, targetLang: Language): string {
    return `${targetLang}:${text}`;
  }

  async translate(text: string, targetLang: Language): Promise<string> {
    if (!text || text.trim() === '') return text;

    // Return English as-is
    if (targetLang === 'en') return text;

    const cacheKey = this.getCacheKey(text, targetLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'en',
        tl: targetLang,
        dt: 't',
        q: text,
      });

      const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Saathi/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      // Google Translate returns: [[["translated", "original", ...]], ...]
      const translatedText = data[0]?.[0]?.[0] || text;

      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.warn('[Translation] Failed, returning original:', error);
      return text; // Fallback to original text
    }
  }

  async translateBatch(texts: string[], targetLang: Language): Promise<string[]> {
    return Promise.all(texts.map(text => this.translate(text, targetLang)));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();

// Helper function for easy use
export async function translate(text: string, targetLang: Language): Promise<string> {
  return translationService.translate(text, targetLang);
}

// For translating AI responses dynamically
export async function translateAIResponse(
  response: { elderMessage?: string; caregiverAlert?: string; doctorNote?: string },
  targetLang: Language
): Promise<typeof response> {
  if (targetLang === 'en') return response;

  return {
    elderMessage: response.elderMessage ? await translate(response.elderMessage, targetLang) : undefined,
    caregiverAlert: response.caregiverAlert ? await translate(response.caregiverAlert, targetLang) : undefined,
    doctorNote: response.doctorNote ? await translate(response.doctorNote, targetLang) : undefined,
  };
}