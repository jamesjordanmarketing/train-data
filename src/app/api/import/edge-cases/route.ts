import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EdgeCaseService } from '@/lib/services/edge-case-service';
import { z } from 'zod';
import { createEdgeCaseSchema } from '@/lib/validation/edge-cases';

// Import schema (array of edge cases)
const importEdgeCasesSchema = z.object({
  edgeCases: z.array(createEdgeCaseSchema),
  overwriteExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false), // Preview mode
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const edgeCaseService = new EdgeCaseService(supabase);
    
    const body = await request.json();
    const { edgeCases, overwriteExisting, validateOnly } = importEdgeCasesSchema.parse(body);
    
    // Validation phase
    const validationResults = await validateEdgeCases(edgeCases, edgeCaseService);
    
    if (validateOnly) {
      // Return validation results for preview
      return NextResponse.json({
        valid: validationResults.valid,
        invalid: validationResults.invalid,
        summary: {
          total: edgeCases.length,
          validCount: validationResults.valid.length,
          invalidCount: validationResults.invalid.length,
          duplicates: validationResults.duplicates.length,
        },
      }, { status: 200 });
    }
    
    // Import phase
    if (validationResults.invalid.length > 0) {
      return NextResponse.json({
        error: 'Some edge cases failed validation',
        invalid: validationResults.invalid,
      }, { status: 400 });
    }
    
    const imported = [];
    const errors = [];
    
    for (const edgeCase of validationResults.valid) {
      try {
        // Check if exists (by name)
        const existing = await edgeCaseService.getByName(edgeCase.name);
        
        if (existing && !overwriteExisting) {
          errors.push({
            edgeCase: edgeCase.name,
            error: 'Edge case already exists (use overwriteExisting flag)',
          });
          continue;
        }
        
        if (existing && overwriteExisting) {
          // Update existing
          const updated = await edgeCaseService.update(existing.id, edgeCase);
          imported.push(updated);
        } else {
          // Create new
          const created = await edgeCaseService.create(edgeCase);
          imported.push(created);
        }
      } catch (error: any) {
        errors.push({
          edgeCase: edgeCase.name,
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
    
    console.error('Import edge cases error:', error);
    return NextResponse.json({
      error: 'Failed to import edge cases',
      details: error.message,
    }, { status: 500 });
  }
}

async function validateEdgeCases(edgeCases: Record<string, unknown>[], _service: unknown) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  
  for (const edgeCase of edgeCases) {
    const errors = [];
    
    // Check required fields
    if (!edgeCase.name || (edgeCase.name as string).length === 0) {
      errors.push('Name is required');
    }
    
    if (!edgeCase.scenarioId && !edgeCase.scenario_id) {
      errors.push('Scenario ID is required');
    }
    
    if (!edgeCase.triggerCondition && !edgeCase.trigger_condition) {
      errors.push('Trigger condition is required');
    }
    
    if (!edgeCase.expectedBehavior && !edgeCase.expected_behavior) {
      errors.push('Expected behavior is required');
    }
    
    // Check for duplicates in batch
    const duplicateInBatch = edgeCases.filter(e => e.name === edgeCase.name).length > 1;
    if (duplicateInBatch) {
      duplicates.push(edgeCase.name);
    }
    
    if (errors.length > 0) {
      invalid.push({
        edgeCase: edgeCase.name,
        errors,
      });
    } else {
      valid.push(edgeCase);
    }
  }
  
  return { valid, invalid, duplicates };
}

