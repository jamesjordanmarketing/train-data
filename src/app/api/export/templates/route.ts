import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { TemplateService } from '@/lib/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, jsonl, csv
    const ids = searchParams.get('ids')?.split(','); // Optional: specific IDs
    
    // Fetch templates
    const templates = ids && ids.length > 0
      ? await Promise.all(ids.map(id => templateService.getById(id)))
      : await templateService.getAll();
    
    // Filter out nulls
    const validTemplates = templates.filter(t => t !== null);
    
    if (format === 'csv') {
      const csv = convertTemplatesToCSV(validTemplates);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.csv"`,
        },
      });
    }
    
    if (format === 'jsonl') {
      const jsonl = validTemplates.map(t => JSON.stringify(t)).join('\n');
      return new NextResponse(jsonl, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.jsonl"`,
        },
      });
    }
    
    // Default: JSON
    return NextResponse.json(
      {
        data: validTemplates,
        exportedAt: new Date().toISOString(),
        count: validTemplates.length,
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="templates-${Date.now()}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Export templates error:', error);
    return NextResponse.json(
      { error: 'Failed to export templates', details: error.message },
      { status: 500 }
    );
  }
}

function convertTemplatesToCSV(templates: any[]): string {
  if (templates.length === 0) return '';
  
  // CSV headers
  const headers = ['id', 'name', 'description', 'category', 'structure', 'tone', 'complexity_baseline', 'quality_threshold', 'usage_count', 'rating'];
  
  // CSV rows
  const rows = templates.map(t => [
    t.id,
    `"${t.name.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category,
    `"${t.structure.replace(/"/g, '""')}"`,
    t.tone,
    t.complexityBaseline || t.complexity_baseline,
    t.qualityThreshold || t.quality_threshold,
    t.usageCount || t.usage_count || 0,
    t.rating || 0,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

