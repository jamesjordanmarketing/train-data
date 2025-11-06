import { NextRequest, NextResponse } from 'next/server';
import { TemplateSubstitution } from '@/lib/template-engine/substitution';
import { z } from 'zod';

const previewSchema = z.object({
  template: z.string(),
  variables: z.record(z.string(), z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, variables } = previewSchema.parse(body);
    
    const substitution = new TemplateSubstitution(variables);
    
    // Validate
    const validation = substitution.validate(template);
    
    // Substitute
    const resolved = substitution.substitute(template);
    
    return NextResponse.json({
      resolved,
      validation,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Template preview error:', error);
    return NextResponse.json({
      error: 'Failed to preview template',
      details: error.message,
    }, { status: 500 });
  }
}

