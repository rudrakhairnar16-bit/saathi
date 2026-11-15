/**
 * In-Memory Rate Limiter — Saathi
 * Per-IP rate limiting for AI routes. Swap for Redis/Upstash at scale.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimiter {
  check: (identifier: string) => RateLimitResult;
  store: Map<string, RateLimitRecord>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  maxRequests: 20,
};

const AI_ROUTE_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  maxRequests: 10, // Stricter for AI calls
};

function createRateLimiter(config: RateLimitConfig = DEFAULT_CONFIG): RateLimiter {
  const store = new Map<string, RateLimitRecord>();

  function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = store.get(identifier);

    if (!record || now > record.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + config.windowMs });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
        retryAfter,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }

  return { check: checkRateLimit, store };
}

// Global rate limiter instances
export const globalRateLimiter = createRateLimiter(DEFAULT_CONFIG);
export const aiRateLimiter = createRateLimiter(AI_ROUTE_CONFIG);

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const limiter of [globalRateLimiter, aiRateLimiter]) {
      for (const [key, record] of limiter.store.entries()) {
        if (now > record.resetAt) {
          limiter.store.delete(key);
        }
      }
    }
  }, 5 * 60 * 1000);
}

// Helper to get client IP from request
export function getClientIP(request: Request): string {
  // Check various headers for real IP (Vercel, proxies, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

// Re-export check functions for backward compatibility
export const checkRateLimit = globalRateLimiter.check;
export const aiRateLimiterCheck = aiRateLimiter.check;