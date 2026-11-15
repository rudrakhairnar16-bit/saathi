/**
 * GET /api/elder/[id]/schedule
 * Get today's dose events for an elder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { getMessage } from '@/lib/messages';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repo = await getRepository();

    // Verify elder exists
    const elder = await repo.getPerson(id);
    if (!elder || elder.role !== 'elder') {
      return NextResponse.json(
        { error: 'not_found', message: getMessage('somethingWentWrong', 'en') },
        { status: 404 }
      );
    }

    const doses = await repo.getTodaysDoseEvents(id);

    return NextResponse.json({
      doses: doses.map(d => ({
        id: d.id,
        medicineId: d.medicineId,
        medicineName: d.medicine.name,
        doseText: d.medicine.doseText,
        time: d.scheduledAt.slice(11, 16), // HH:MM
        withFood: d.medicine.withFood,
        status: d.status,
        actedAt: d.actedAt,
      })),
    });
  } catch (error) {
    console.error('[API] /elder/[id]/schedule error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
      { status: 500 }
    );
  }
}