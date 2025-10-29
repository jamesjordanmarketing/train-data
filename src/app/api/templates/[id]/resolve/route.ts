/**
 * API Route: /api/templates/[id]/resolve
 * 
 * Resolves template placeholders with provided parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/template-service';
import { AppError } from '@/lib/types/errors';
import { z } from 'zod';

const ResolveTemplateSchema = z.object({
  parameters: z.record(z.any()),
});

/**
 * POST /api/templates/[id]/resolve
 * Resolve template with parameters
 * 
 * Body:
 * - parameters: Record<string, any> - Key-value pairs for template variables
 * 
 * Example:
 * ```json
 * {
 *   "parameters": {
 *     "topic": "retirement planning",
 *     "persona": "Anxious Investor",
 *     "emotion": "Worried"
 *   }
 * }
 * ```
 * 
 * Returns:
 * ```json
 * {
 *   "resolvedText": "Generate a conversation about retirement planning with an Anxious Investor feeling Worried..."
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validatedData = ResolveTemplateSchema.parse(body);

    // Resolve template
    const resolvedText = await templateService.resolveTemplate(id, validatedData.parameters);

    return NextResponse.json(
      { resolvedText },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/templates/[id]/resolve:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to resolve template' },
      { status: 500 }
    );
  }
}

