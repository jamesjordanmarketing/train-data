import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService } from '@/lib/services/edge-case-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const edgeCaseService = new EdgeCaseService(supabase);
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, jsonl, csv
    const ids = searchParams.get('ids')?.split(','); // Optional: specific IDs
    
    // Fetch edge cases
    const edgeCases = ids && ids.length > 0
      ? await Promise.all(ids.map(id => edgeCaseService.getById(id)))
      : await edgeCaseService.getAll();
    
    // Filter out nulls
    const validEdgeCases = edgeCases.filter(e => e !== null);
    
    if (format === 'csv') {
      const csv = convertEdgeCasesToCSV(validEdgeCases);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="edge-cases-${Date.now()}.csv"`,
        },
      });
    }
    
    if (format === 'jsonl') {
      const jsonl = validEdgeCases.map(e => JSON.stringify(e)).join('\n');
      return new NextResponse(jsonl, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': `attachment; filename="edge-cases-${Date.now()}.jsonl"`,
        },
      });
    }
    
    // Default: JSON
    return NextResponse.json(
      {
        data: validEdgeCases,
        exportedAt: new Date().toISOString(),
        count: validEdgeCases.length,
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="edge-cases-${Date.now()}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Export edge cases error:', error);
    return NextResponse.json(
      { error: 'Failed to export edge cases', details: error.message },
      { status: 500 }
    );
  }
}

function convertEdgeCasesToCSV(edgeCases: any[]): string {
  if (edgeCases.length === 0) return '';
  
  // CSV headers
  const headers = ['id', 'name', 'description', 'scenario_id', 'trigger_condition', 'expected_behavior', 'severity', 'resolution_strategy', 'test_coverage'];
  
  // CSV rows
  const rows = edgeCases.map(e => [
    e.id,
    `"${e.name.replace(/"/g, '""')}"`,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.scenarioId || e.scenario_id,
    `"${(e.triggerCondition || e.trigger_condition || '').replace(/"/g, '""')}"`,
    `"${(e.expectedBehavior || e.expected_behavior || '').replace(/"/g, '""')}"`,
    e.severity,
    `"${(e.resolutionStrategy || e.resolution_strategy || '').replace(/"/g, '""')}"`,
    e.testCoverage || e.test_coverage || false,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

