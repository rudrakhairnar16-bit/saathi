/**
 * POST /api/dose/skip
 * Classify skip reason, decide action, persist SkipReport
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { makeDecision } from '@/lib/barrier';
import { classifyBarrier as classifyBarrierAI } from '@/lib/ai';
import { getClientIP } from '@/lib/security';
import { getMessage } from '@/lib/messages';
import type { Barrier, Language } from '@/types';

const SkipDoseSchema = z.object({
  doseEventId: z.string().min(1),
  elderId: z.string().min(1),
  text: z.string().min(1).max(500),
  language: z.enum(['en', 'hi']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIP(request);
    const { allowed, retryAfter } = (await import('@/lib/security')).aiRateLimiter(ip);
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
    const parsed = SkipDoseSchema.safeParse(body);

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

    const { doseEventId, elderId, text, language } = parsed.data;
    const repo = await getRepository();

    // Verify dose event exists and belongs to elder
    const doseEvent = await repo.getDoseEvent(doseEventId);
    if (!doseEvent || doseEvent.elderId !== elderId) {
      return NextResponse.json(
        { error: 'not_found', message: getMessage('somethingWentWrong', language) },
        { status: 404 }
      );
    }

    // Mark dose as skipped
    await repo.markDoseSkipped(doseEventId, new Date().toISOString());

    // Get context for decision
    const medicines = await repo.getMedicinesByElder(elderId);
    const skipReports = await repo.getSkipReportsByElder(elderId, 10);
    const barrierHistory = skipReports.map(r => r.category as Barrier);
    const previousSkips = skipReports.length;

    // Classify barrier (AI with fallback)
    const classification = await classifyBarrierAI({
      text,
      language: language as Language,
      context: {
        doseTime: doseEvent.scheduledAt.slice(11, 16), // HH:MM
        previousSkips,
        barrierHistory,
      },
    }, ip);

    // Make decision
    const context = {
      elderId,
      medicineId: doseEvent.medicineId,
      doseTime: doseEvent.scheduledAt.slice(11, 16),
      previousSkips,
      barrierHistory,
      language: language as Language,
    };

    const { action, redFlag } = makeDecision(
      classification.category as Barrier,
      classification.redFlag,
      context
    );

    // Create skip report
    const skipReport = await repo.createSkipReport({
      id: `sr_${Date.now()}`,
      doseEventId,
      elderId,
      rawText: text,
      language,
      category: classification.category as Barrier,
      confidence: classification.confidence,
      redFlag,
      action,
      source: classification.source,
      createdAt: new Date().toISOString(),
    });

    // Create alert if needed
    if (redFlag || classification.category === 'side_effect' || classification.category === 'cost_or_stock') {
      const level = redFlag ? 'urgent' : classification.category === 'side_effect' ? 'warning' : 'info';
      await repo.createAlert({
        id: `alert_${Date.now()}`,
        elderId,
        level,
        reason: `${skipReports.length + 1} skips this week: ${action.caregiverAlert || 'Skipped dose'}`,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    }

    // Return response
    return NextResponse.json({
      skipReport: {
        id: skipReport.id,
        category: skipReport.category,
        confidence: skipReport.confidence,
        redFlag: skipReport.redFlag,
        source: skipReport.source,
      },
      action,
      redFlag,
      emergencyMessage: redFlag ? getMessage('emergencyMessage', language) : undefined,
    });
  } catch (error) {
    console.error('[API] /dose/skip error:', error);

    // Handle rate limit errors from AI
    if (error instanceof Error && error.message.startsWith('RATE_LIMITED:')) {
      const [, retryAfter, message] = error.message.split(':');
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