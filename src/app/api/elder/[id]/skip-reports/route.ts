/**
 * GET /api/elder/[id]/skip-reports
 * Get skip reports for an elder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { getClientIP } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const repo = await getRepository();

    // Verify elder exists
    const person = await repo.getPerson(id);
    if (!person || person.role !== 'elder') {
      return NextResponse.json(
        { error: 'not_found', message: 'Elder not found' },
        { status: 404 }
      );
    }

    // Get skip reports
    const skipReports = await repo.getSkipReportsByElder(id, 50);

    return NextResponse.json({ skipReports });
  } catch (error) {
    console.error('[API] /elder/[id]/skip-reports error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch skip reports' },
      { status: 500 }
    );
  }
}