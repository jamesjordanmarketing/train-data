import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const scenarioService = new ScenarioService(supabase);
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, jsonl, csv
    const ids = searchParams.get('ids')?.split(','); // Optional: specific IDs
    
    // Fetch scenarios
    const scenarios = ids && ids.length > 0
      ? await Promise.all(ids.map(id => scenarioService.getById(id)))
      : await scenarioService.getAll();
    
    // Filter out nulls
    const validScenarios = scenarios.filter(s => s !== null);
    
    if (format === 'csv') {
      const csv = convertScenariosToCSV(validScenarios);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="scenarios-${Date.now()}.csv"`,
        },
      });
    }
    
    if (format === 'jsonl') {
      const jsonl = validScenarios.map(s => JSON.stringify(s)).join('\n');
      return new NextResponse(jsonl, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': `attachment; filename="scenarios-${Date.now()}.jsonl"`,
        },
      });
    }
    
    // Default: JSON
    return NextResponse.json(
      {
        data: validScenarios,
        exportedAt: new Date().toISOString(),
        count: validScenarios.length,
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="scenarios-${Date.now()}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Export scenarios error:', error);
    return NextResponse.json(
      { error: 'Failed to export scenarios', details: error.message },
      { status: 500 }
    );
  }
}

function convertScenariosToCSV(scenarios: any[]): string {
  if (scenarios.length === 0) return '';
  
  // CSV headers
  const headers = ['id', 'name', 'description', 'template_id', 'context', 'expected_turns', 'difficulty', 'tags', 'usage_count'];
  
  // CSV rows
  const rows = scenarios.map(s => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${(s.description || '').replace(/"/g, '""')}"`,
    s.templateId || s.template_id,
    `"${(s.context || '').replace(/"/g, '""')}"`,
    s.expectedTurns || s.expected_turns || 0,
    s.difficulty,
    `"${(s.tags || []).join(',')}}"`,
    s.usageCount || s.usage_count || 0,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

