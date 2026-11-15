/**
 * POST /api/fasting/confirm
 * Confirm a fasting plan (caregiver/doctor only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { getMessage } from '@/lib/messages';

const ConfirmFastingPlanSchema = z.object({
  planId: z.string().min(1),
  elderId: z.string().min(1),
  confirmedBy: z.string().min(1), // Person ID (caregiver/doctor)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ConfirmFastingPlanSchema.safeParse(body);

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

    const { planId, elderId, confirmedBy } = parsed.data;
    const repo = await getRepository();

    // Verify confirmer is caregiver or doctor for this elder
    const confirmer = await repo.getPerson(confirmedBy);
    if (!confirmer || !['caregiver', 'doctor'].includes(confirmer.role) || confirmer.elderId !== elderId) {
      return NextResponse.json(
        { error: 'unauthorized', message: getMessage('somethingWentWrong', 'en') },
        { status: 403 }
      );
    }

    // Verify plan exists and is draft
    const plan = await repo.getFastingPlan(planId);
    if (!plan || plan.elderId !== elderId || plan.status !== 'draft') {
      return NextResponse.json(
        { error: 'not_found', message: getMessage('somethingWentWrong', 'en') },
        { status: 404 }
      );
    }

    // Confirm plan
    const confirmed = await repo.confirmFastingPlan(planId, confirmedBy);

    if (!confirmed) {
      return NextResponse.json(
        { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
        { status: 500 }
      );
    }

    return NextResponse.json({
      plan: {
        id: confirmed.id,
        occasion: confirmed.occasion,
        date: confirmed.date,
        status: confirmed.status,
        confirmedBy: confirmed.confirmedBy,
      },
    });
  } catch (error) {
    console.error('[API] /fasting/confirm error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
      { status: 500 }
    );
  }
}