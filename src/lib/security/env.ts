/**
 * Environment Validation — Saathi
 * Validates all required environment variables at startup.
 * Fails fast with clear messages if config is missing.
 */

export interface EnvConfig {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: string;
}

let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const config: EnvConfig = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  // Validate in production
  if (config.NODE_ENV === 'production') {
    const missing: string[] = [];
    if (!config.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
    if (!config.NEXT_PUBLIC_APP_URL) missing.push('NEXT_PUBLIC_APP_URL');

    if (missing.length > 0) {
      throw new Error(
        `[Env] Missing required environment variables in production: ${missing.join(', ')}. ` +
        'Set them in Vercel dashboard or .env.production.local'
      );
    }
  }

  cachedConfig = config;
  return config;
}

export function hasGeminiKey(): boolean {
  return !!getEnvConfig().GEMINI_API_KEY;
}

export function getGeminiModel(): string {
  return getEnvConfig().GEMINI_MODEL;
}

export function getAppUrl(): string {
  return getEnvConfig().NEXT_PUBLIC_APP_URL;
}

export function isDevelopment(): boolean {
  return getEnvConfig().NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return getEnvConfig().NODE_ENV === 'production';
}