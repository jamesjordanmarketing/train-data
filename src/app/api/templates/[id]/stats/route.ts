/**
 * API Route: /api/templates/[id]/stats
 * 
 * Get usage statistics for a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/template-service';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/templates/[id]/stats
 * Get template usage statistics
 * 
 * Returns:
 * - usageCount: number
 * - rating: number
 * - successRate: number
 * - avgQualityScore: number
 * - conversationsGenerated: number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const stats = await templateService.getUsageStats(id);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/templates/[id]/stats:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch template stats' },
      { status: 500 }
    );
  }
}

