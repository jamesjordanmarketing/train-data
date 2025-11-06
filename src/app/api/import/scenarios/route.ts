import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScenarioService } from '@/lib/services/scenario-service';
import { z } from 'zod';
import { createScenarioSchema } from '@/lib/validation/scenarios';

// Import schema (array of scenarios)
const importScenariosSchema = z.object({
  scenarios: z.array(createScenarioSchema),
  overwriteExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false), // Preview mode
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const scenarioService = new ScenarioService(supabase);
    
    const body = await request.json();
    const { scenarios, overwriteExisting, validateOnly } = importScenariosSchema.parse(body);
    
    // Validation phase
    const validationResults = await validateScenarios(scenarios, scenarioService);
    
    if (validateOnly) {
      // Return validation results for preview
      return NextResponse.json({
        valid: validationResults.valid,
        invalid: validationResults.invalid,
        summary: {
          total: scenarios.length,
          validCount: validationResults.valid.length,
          invalidCount: validationResults.invalid.length,
          duplicates: validationResults.duplicates.length,
        },
      }, { status: 200 });
    }
    
    // Import phase
    if (validationResults.invalid.length > 0) {
      return NextResponse.json({
        error: 'Some scenarios failed validation',
        invalid: validationResults.invalid,
      }, { status: 400 });
    }
    
    const imported = [];
    const errors = [];
    
    for (const scenario of validationResults.valid) {
      try {
        // Check if exists (by name)
        const existing = await scenarioService.getByName(scenario.name);
        
        if (existing && !overwriteExisting) {
          errors.push({
            scenario: scenario.name,
            error: 'Scenario already exists (use overwriteExisting flag)',
          });
          continue;
        }
        
        if (existing && overwriteExisting) {
          // Update existing
          const updated = await scenarioService.update(existing.id, scenario);
          imported.push(updated);
        } else {
          // Create new
          const created = await scenarioService.create(scenario);
          imported.push(created);
        }
      } catch (error: any) {
        errors.push({
          scenario: scenario.name,
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
    
    console.error('Import scenarios error:', error);
    return NextResponse.json({
      error: 'Failed to import scenarios',
      details: error.message,
    }, { status: 500 });
  }
}

async function validateScenarios(scenarios: any[], service: any) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  
  for (const scenario of scenarios) {
    const errors = [];
    
    // Check required fields
    if (!scenario.name || scenario.name.length === 0) {
      errors.push('Name is required');
    }
    
    if (!scenario.templateId && !scenario.template_id) {
      errors.push('Template ID is required');
    }
    
    if (!scenario.context || scenario.context.length < 10) {
      errors.push('Context must be at least 10 characters');
    }
    
    // Check for duplicates in batch
    const duplicateInBatch = scenarios.filter(s => s.name === scenario.name).length > 1;
    if (duplicateInBatch) {
      duplicates.push(scenario.name);
    }
    
    if (errors.length > 0) {
      invalid.push({
        scenario: scenario.name,
        errors,
      });
    } else {
      valid.push(scenario);
    }
  }
  
  return { valid, invalid, duplicates };
}

