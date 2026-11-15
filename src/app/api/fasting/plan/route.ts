/**
 * POST /api/fasting/plan
 * Build fasting plan for an occasion
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { enhanceFastingPlan } from '@/lib/ai';
import { buildFastingPlan } from '@/lib/fasting/buildPlan';
import { getClientIP } from '@/lib/security';
import { getMessage } from '@/lib/messages';

const FastingPlanSchema = z.object({
  elderId: z.string().min(1),
  occasion: z.enum(['ekadashi', 'navratri', 'roza', 'paryushan', 'karva_chauth', 'custom']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  language: z.enum(['en', 'hi']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIP(request);
    const { allowed, retryAfter } = (await import('@/lib/security')).aiRateLimiterCheck(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: getMessage('rateLimited', 'en'),
          retryAfter,
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // Parse and validate
    const body = await request.json();
    const parsed = FastingPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'validation_error',
          message: getMessage('somethingWentWrong', 'en'),
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { elderId, occasion, date, language } = parsed.data;
    const repo = await getRepository();

    // Get active medicines
    const medicines = await repo.getMedicinesByElder(elderId);
    const activeMedicines = medicines.filter(m => m.status === 'active');

    if (activeMedicines.length === 0) {
      return NextResponse.json(
        { error: 'no_medicines', message: getMessage('noDosesToday', language) },
        { status: 400 }
      );
    }

    // Build plan with AI enhancement (with fallback)
    const basePlan = buildFastingPlan({
      elderId,
      occasion,
      date,
      medicines: activeMedicines,
      language,
    });

    const enhanced = await enhanceFastingPlan(
      {
        elderId,
        occasion,
        date,
        medicines: basePlan.entries.map(e => ({
          id: e.medicineId,
          name: activeMedicines.find(m => m.id === e.medicineId)?.name || 'Unknown',
          drugClass: activeMedicines.find(m => m.id === e.medicineId)?.drugClass || 'other',
          guidance: e.guidance,
          reason: e.reason,
          askDoctor: e.askDoctor,
        })),
        language,
      },
      ip
    );

    // Create fasting plan
    const plan = await repo.createFastingPlan({
      id: `fp_${Date.now()}`,
      elderId,
      occasion,
      date,
      entries: enhanced.entries,
      status: 'draft',
      source: enhanced.source,
    });

    // Create alert for high-risk items
    const highRiskEntries = enhanced.entries.filter(e => e.guidance === 'ask_doctor');
    if (highRiskEntries.length > 0) {
      await repo.createAlert({
        id: `alert_${Date.now()}`,
        elderId,
        level: 'warning',
        reason: `Fasting plan for ${occasion} has ${highRiskEntries.length} medicine(s) requiring doctor confirmation.`,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    }

    return NextResponse.json({
      plan: {
        id: plan.id,
        occasion: plan.occasion,
        date: plan.date,
        entries: plan.entries,
        status: plan.status,
        source: plan.source,
      },
    });
  } catch (error) {
    console.error('[API] /fasting/plan error:', error);

    if (error instanceof Error && error.message.startsWith('RATE_LIMITED|')) {
      const [, retryAfter, message] = error.message.split('|');
      return NextResponse.json(
        { error: 'rate_limited', message, retryAfter: parseInt(retryAfter) },
        { status: 429, headers: { 'Retry-After': retryAfter } }
      );
    }

    return NextResponse.json(
      { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
      { status: 500 }
    );
  }
}