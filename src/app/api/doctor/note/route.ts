/**
 * POST /api/doctor/note
 * Process doctor note/prescription, return simple lines + draft medicines + overlaps
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { processDoctorNote } from '@/lib/ai';
import { findOverlaps } from '@/lib/overlap';
import { getClientIP } from '@/lib/security';
import { getMessage } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';
import { DrugClass } from '@/types';

const DoctorNoteSchema = z.object({
  elderId: z.string().min(1),
  text: z.string().min(1).max(500),
  language: z.enum(['en', 'hi']).default('en'),
});

function generateId(): string {
  return uuidv4().slice(0, 8);
}

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
    const parsed = DoctorNoteSchema.safeParse(body);

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

    const { elderId, text, language } = parsed.data;
    const repo = await getRepository();

    // Get existing medicines for overlap check
    const existingMedicines = await repo.getMedicinesByElder(elderId);

    // Process with AI (with fallback)
    const result = await processDoctorNote(
      {
        elderId,
        text,
        language,
        existingMedicines: existingMedicines.map(m => ({
          name: m.name,
          activeIngredient: m.activeIngredient,
          drugClass: m.drugClass,
          doseText: m.doseText,
          times: m.times,
          withFood: m.withFood,
          status: m.status,
          prescribedBy: m.prescribedBy,
        })),
      },
      ip
    );

    // Create draft medicines with proper IDs (same ID for overlap check and visit note)
    const draftMedicines = result.draftMedicines.map(m => ({
      ...m,
      id: `med_${generateId()}`,
      elderId,
      drugClass: m.drugClass as DrugClass,
      status: 'draft' as const,
    }));

    // Create visit note
    const visitNote = await repo.createVisitNote({
      id: `vn_${generateId()}`,
      elderId,
      rawText: text,
      simpleLines: result.simpleLines,
      draftMedicines,
      overlaps: draftMedicines.length > 0
        ? findOverlaps([...existingMedicines, ...draftMedicines])
        : [],
      source: result.source,
      createdAt: new Date().toISOString(),
    });

    // Create alerts for overlaps
    if (visitNote.overlaps.length > 0) {
      for (const overlap of visitNote.overlaps) {
        if (overlap.severity === 'high') {
          await repo.createAlert({
            id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            elderId,
            level: 'warning',
            reason: `Medicine overlap detected: ${overlap.description}`,
            createdAt: new Date().toISOString(),
            resolved: false,
          });
        }
      }
    }

    return NextResponse.json({
      visitNote: {
        id: visitNote.id,
        simpleLines: visitNote.simpleLines,
        draftMedicines: visitNote.draftMedicines,
        overlaps: visitNote.overlaps,
        source: visitNote.source,
      },
    });
  } catch (error) {
    console.error('[API] /doctor/note error:', error);

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