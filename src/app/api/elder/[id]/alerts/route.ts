/**
 * GET /api/elder/[id]/alerts
 * Get alerts for an elder (caregiver view)
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
    const { searchParams } = new URL(request.url);
    const unresolvedOnly = searchParams.get('unresolved') === 'true';

    const repo = await getRepository();

    // Verify elder exists
    const elder = await repo.getPerson(id);
    if (!elder) {
      return NextResponse.json(
        { error: 'not_found', message: getMessage('somethingWentWrong', 'en') },
        { status: 404 }
      );
    }

    const alerts = await repo.getAlertsByElder(id, unresolvedOnly);

    return NextResponse.json({
      alerts: alerts.map(a => ({
        id: a.id,
        level: a.level,
        reason: a.reason,
        createdAt: a.createdAt,
        resolved: a.resolved,
      })),
    });
  } catch (error) {
    console.error('[API] /elder/[id]/alerts error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: getMessage('somethingWentWrong', 'en') },
      { status: 500 }
    );
  }
}