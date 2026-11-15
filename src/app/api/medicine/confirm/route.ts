/**
 * POST /api/medicine/confirm
 * Confirm a draft medicine (caregiver/doctor only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '@/lib/db';
import { getMessage } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';

const ConfirmMedicineSchema = z.object({
  medicineId: z.string().min(1),
  elderId: z.string().min(1),
  confirmedBy: z.string().min(1), // Person ID (caregiver/doctor)
});

function generateId(): string {
  return uuidv4().slice(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ConfirmMedicineSchema.safeParse(body);

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

    const { medicineId, elderId, confirmedBy } = parsed.data;
    const repo = await getRepository();

    // Verify confirmer is caregiver or doctor for this elder
    const confirmer = await repo.getPerson(confirmedBy);
    if (!confirmer || !['caregiver', 'doctor'].includes(confirmer.role) || confirmer.elderId !== elderId) {
      return NextResponse.json(
        { error: 'unauthorized', message: getMessage('somethingWentWrong', 'en') },
        { status: 403 }
      );
    }

    // Verify medicine exists and is draft
    const medicine = await repo.getMedicine(medicineId);
    if (!medicine || medicine.elderId !== elderId || medicine.status !== 'draft') {
      return NextResponse.json(
        { error: 'not_found', message: getMessage('somethingWentWrong', 'en') },
        { status: 404 }
      );
    }

    // Confirm medicine
    const confirmed = await repo.confirmMedicine(medicineId, confirmedBy);

    if (!confirmed) {
      return NextResponse.json(
        { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
        { status: 500 }
      );
    }

    // Create dose events for the newly confirmed medicine (check existing first)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for existing dose events to avoid duplicates
    const existingEvents = await repo.getDoseEventsByElder(elderId, today, new Date(today.getTime() + 14 * 86400000));
    const existingKeys = new Set(existingEvents.map(e => `${e.medicineId}|${e.scheduledAt}`));

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) { // 2 weeks ahead
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      for (const timeStr of confirmed.times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledAt = new Date(date);
        scheduledAt.setHours(hours, minutes, 0, 0);
        const scheduledAtISO = scheduledAt.toISOString();

        const key = `${confirmed.id}|${scheduledAtISO}`;
        if (existingKeys.has(key)) {
          continue; // Skip duplicate
        }

        await repo.createDoseEvent({
          id: `de_${generateId()}`,
          medicineId: confirmed.id,
          elderId,
          scheduledAt: scheduledAtISO,
          status: 'pending',
        });
      }
    }

    return NextResponse.json({
      medicine: {
        id: confirmed.id,
        name: confirmed.name,
        status: confirmed.status,
      },
    });
  } catch (error) {
    console.error('[API] /medicine/confirm error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
      { status: 500 }
    );
  }
}