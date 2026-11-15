/**
 * Middleware — Saathi
 * Rate limiting and locale handling
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIP, checkRateLimit } from '@/lib/security';

export function middleware(request: NextRequest) {
  const ip = getClientIP(request);

  // Apply global rate limiting
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  const response = NextResponse.next();

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '20');
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        },
      }
    );
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};