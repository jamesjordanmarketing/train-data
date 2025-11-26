import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateService } from '@/lib/services/template-service';
import { z } from 'zod';
import { createTemplateSchema } from '@/lib/validation/templates';

// Import schema (array of templates)
const importTemplatesSchema = z.object({
  templates: z.array(createTemplateSchema),
  overwriteExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false), // Preview mode
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const templateService = new TemplateService(supabase);
    
    const body = await request.json();
    const { templates, overwriteExisting, validateOnly } = importTemplatesSchema.parse(body);
    
    // Validation phase
    const validationResults = await validateTemplates(templates, templateService);
    
    if (validateOnly) {
      // Return validation results for preview
      return NextResponse.json({
        valid: validationResults.valid,
        invalid: validationResults.invalid,
        summary: {
          total: templates.length,
          validCount: validationResults.valid.length,
          invalidCount: validationResults.invalid.length,
          duplicates: validationResults.duplicates.length,
        },
      }, { status: 200 });
    }
    
    // Import phase
    if (validationResults.invalid.length > 0) {
      return NextResponse.json({
        error: 'Some templates failed validation',
        invalid: validationResults.invalid,
      }, { status: 400 });
    }
    
    const imported = [];
    const errors = [];
    
    for (const template of validationResults.valid) {
      try {
        // Check if exists (by name)
        const existing = await templateService.getByName(template.name);
        
        if (existing && !overwriteExisting) {
          errors.push({
            template: template.name,
            error: 'Template already exists (use overwriteExisting flag)',
          });
          continue;
        }
        
        if (existing && overwriteExisting) {
          // Update existing
          const updated = await templateService.update(existing.id, template);
          imported.push(updated);
        } else {
          // Create new
          const created = await templateService.create(template);
          imported.push(created);
        }
      } catch (error: any) {
        errors.push({
          template: template.name,
          error: error.message,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: errors.length,
      results: {
        imported,
        errors,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues,
      }, { status: 400 });
    }
    
    console.error('Import templates error:', error);
    return NextResponse.json({
      error: 'Failed to import templates',
      details: error.message,
    }, { status: 500 });
  }
}

async function validateTemplates(templates: Record<string, unknown>[], _service: unknown) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  
  for (const template of templates) {
    const errors = [];
    
    // Check required fields
    if (!template.name || (template.name as string).length === 0) {
      errors.push('Name is required');
    }
    
    if (!template.structure || (template.structure as string).length < 10) {
      errors.push('Structure must be at least 10 characters');
    }
    
    // Validate variables match placeholders
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const placeholders = new Set<string>();
    let match;
    while ((match = placeholderRegex.exec(template.structure as string)) !== null) {
      placeholders.add(match[1]);
    }
    
    const variableNames = new Set((template.variables as { name: string }[] | undefined)?.map((v) => v.name) || []);
    const missingVars = Array.from(placeholders).filter(p => !variableNames.has(p));
    
    if (missingVars.length > 0) {
      errors.push(`Missing variables: ${missingVars.join(', ')}`);
    }
    
    // Check for duplicates in batch
    const duplicateInBatch = templates.filter(t => t.name === template.name).length > 1;
    if (duplicateInBatch) {
      duplicates.push(template.name);
    }
    
    if (errors.length > 0) {
      invalid.push({
        template: template.name,
        errors,
      });
    } else {
      valid.push(template);
    }
  }
  
  return { valid, invalid, duplicates };
}

