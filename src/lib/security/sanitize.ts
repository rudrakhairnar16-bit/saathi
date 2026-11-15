/**
 * Input Sanitization — Saathi
 * Strips control characters, enforces length limits, prevents injection.
 */

const MAX_TEXT_LENGTH = 500;
const MAX_SINGLE_LINE_LENGTH = 200;

// Control characters to remove (except newline, tab)
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Potential injection patterns
const INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
];

export interface SanitizeOptions {
  maxLength?: number;
  allowNewlines?: boolean;
  stripHtml?: boolean;
}

export interface SanitizeResult {
  sanitized: string;
  wasModified: boolean;
  removedChars: number;
  truncated: boolean;
}

/**
 * Sanitizes user input text.
 * Removes control characters, limits length, strips potential injection attempts.
 */
export function sanitizeText(
  input: string,
  options: SanitizeOptions = {}
): SanitizeResult {
  const {
    maxLength = MAX_TEXT_LENGTH,
    allowNewlines = true,
    stripHtml = true,
  } = options;

  let text = input || '';
  let wasModified = false;
  let removedChars = 0;

  // 1. Remove control characters
  const beforeControl = text.length;
  text = text.replace(CONTROL_CHARS_REGEX, '');
  removedChars += beforeControl - text.length;
  if (beforeControl !== text.length) wasModified = true;

  // 2. Strip HTML tags if requested
  if (stripHtml) {
    const beforeHtml = text.length;
    text = text.replace(/<[^>]*>/g, '');
    removedChars += beforeHtml - text.length;
    if (beforeHtml !== text.length) wasModified = true;
  }

  // 3. Remove potential injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    const before = text.length;
    text = text.replace(pattern, '');
    removedChars += before - text.length;
    if (before !== text.length) wasModified = true;
  }

  // 4. Normalize whitespace
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  if (!allowNewlines) {
    text = text.replace(/\n/g, ' ');
  }

  // 5. Trim
  text = text.trim();

  // 6. Enforce length limit
  let truncated = false;
  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
    truncated = true;
    wasModified = true;
  }

  // 7. Enforce single line length (prevent extremely long lines)
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    if (line.length > MAX_SINGLE_LINE_LENGTH) {
      wasModified = true;
      return line.slice(0, MAX_SINGLE_LINE_LENGTH).trim();
    }
    return line;
  });

  const finalText = processedLines.join('\n');

  return {
    sanitized: finalText,
    wasModified,
    removedChars,
    truncated,
  };
}

/**
 * Sanitizes a single-line input (for form fields, etc.)
 */
export function sanitizeSingleLine(input: string, maxLength = MAX_SINGLE_LINE_LENGTH): SanitizeResult {
  return sanitizeText(input, { maxLength, allowNewlines: false });
}

/**
 * Validates and sanitizes language code
 */
export function sanitizeLanguage(lang: string): 'en' | 'hi' {
  const normalized = lang.toLowerCase().trim();
  if (normalized === 'hi' || normalized === 'hindi') return 'hi';
  return 'en'; // default
}

/**
 * Validates and sanitizes occasion
 */
export function sanitizeOccasion(occasion: string): string {
  const valid = ['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom'];
  const normalized = occasion.toLowerCase().trim().replace(/\s+/g, '_');
  return valid.includes(normalized) ? normalized : 'custom';
}

/**
 * Validates ISO date string (YYYY-MM-DD)
 */
export function sanitizeDate(date: string): string | null {
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(date)) return null;

  const parsed = new Date(date + 'T00:00:00');
  if (isNaN(parsed.getTime())) return null;

  return date;
}

/**
 * Validates time string (HH:MM)
 */
export function sanitizeTime(time: string): string | null {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) return null;
  return time;
}

/**
 * Validates UUID-like string
 */
export function sanitizeId(id: string): string | null {
  const uuidRegex = /^[a-f0-9-]{8,36}$/i;
  if (!uuidRegex.test(id)) return null;
  return id;
}