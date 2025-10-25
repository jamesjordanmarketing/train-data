import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { workflowService } from '@/lib/database'

/**
 * Dimension key mapping for frontend → database UUID conversion
 * Maps frontend string keys to database dimension UUIDs
 */
const dimensionKeyMap: Record<string, string> = {
  'authorship': '550e8400-e29b-41d4-a716-446655440003',
  'format': '550e8400-e29b-41d4-a716-446655440004',
  'disclosure-risk': '550e8400-e29b-41d4-a716-446655440005',
  'intended-use': '550e8400-e29b-41d4-a716-446655440006',
  'evidence-type': '550e8400-e29b-41d4-a716-446655440021',
  'audience-level': '550e8400-e29b-41d4-a716-446655440022',
  'gating-level': '550e8400-e29b-41d4-a716-446655440023'
};

/**
 * Tag slug to UUID mapping
 * Maps frontend tag keys/slugs to database UUIDs
 */
const tagSlugToUuidMap: Record<string, string> = {
  // Authorship
  'brand-company': '550e8400-e29b-41d4-a716-446655440007',
  'team-member': '550e8400-e29b-41d4-a716-446655440008',
  'customer': '550e8400-e29b-41d4-a716-446655440024',
  'mixed-collaborative': '550e8400-e29b-41d4-a716-446655440025',
  'third-party': '550e8400-e29b-41d4-a716-446655440026',
  
  // Content Format
  'how-to-guide': '550e8400-e29b-41d4-a716-446655440027',
  'strategy-note': '550e8400-e29b-41d4-a716-446655440028',
  'case-study': '550e8400-e29b-41d4-a716-446655440029',
  'story-narrative': '550e8400-e29b-41d4-a716-446655440030',
  'sales-page': '550e8400-e29b-41d4-a716-446655440031',
  'email': '550e8400-e29b-41d4-a716-446655440032',
  'transcript': '550e8400-e29b-41d4-a716-446655440033',
  'presentation-slide': '550e8400-e29b-41d4-a716-446655440034',
  'whitepaper': '550e8400-e29b-41d4-a716-446655440035',
  'brief-summary': '550e8400-e29b-41d4-a716-446655440036',
  
  // Disclosure Risk
  'level-1-minimal-risk': '550e8400-e29b-41d4-a716-446655440009',
  'level-2-low-risk': '550e8400-e29b-41d4-a716-446655440037',
  'level-3-moderate-risk': '550e8400-e29b-41d4-a716-446655440038',
  'level-4-high-risk': '550e8400-e29b-41d4-a716-446655440039',
  'level-5-critical-risk': '550e8400-e29b-41d4-a716-446655440040',
  
  // Intended Use
  'training': '550e8400-e29b-41d4-a716-446655440010',
  'marketing': '550e8400-e29b-41d4-a716-446655440011',
  'sales-enablements': '550e8400-e29b-41d4-a716-446655440041',
  'delivery-operations': '550e8400-e29b-41d4-a716-446655440042',
  'investor-relations': '550e8400-e29b-41d4-a716-446655440043',
  'legal-compliance': '550e8400-e29b-41d4-a716-446655440044',
  
  // Evidence Types
  'metrics-kpis': '550e8400-e29b-41d4-a716-446655440045',
  'quotes-testimonials': '550e8400-e29b-41d4-a716-446655440046',
  'before-after-results': '550e8400-e29b-41d4-a716-446655440047',
  'screenshots-visuals': '550e8400-e29b-41d4-a716-446655440048',
  'data-tables': '550e8400-e29b-41d4-a716-446655440049',
  'external-references': '550e8400-e29b-41d4-a716-446655440050',
  
  // Audience Level
  'public': '550e8400-e29b-41d4-a716-446655440051',
  'lead': '550e8400-e29b-41d4-a716-446655440052',
  'customer-audience': '550e8400-e29b-41d4-a716-446655440053',
  'internal': '550e8400-e29b-41d4-a716-446655440054',
  'executive': '550e8400-e29b-41d4-a716-446655440055',
  
  // Gating Level
  'public-gating': '550e8400-e29b-41d4-a716-446655440056',
  'ungated-email': '550e8400-e29b-41d4-a716-446655440057',
  'soft-gated': '550e8400-e29b-41d4-a716-446655440058',
  'hard-gated': '550e8400-e29b-41d4-a716-446655440059',
  'internal-only': '550e8400-e29b-41d4-a716-446655440060',
  'nda-only': '550e8400-e29b-41d4-a716-446655440061'
};

/**
 * Transform frontend tag format to database format
 * Converts: { 'dimension-key': ['tag-slug'] } → [{ tagId: 'uuid', dimensionId: 'uuid' }]
 */
function transformTagsToNormalized(
  selectedTags: Record<string, string[]>
): Array<{ tagId: string; dimensionId: string }> {
  const result = [];
  
  for (const [dimensionKey, tagSlugs] of Object.entries(selectedTags)) {
    const dimensionId = dimensionKeyMap[dimensionKey];
    
    if (!dimensionId) {
      console.warn(`Unknown dimension key: ${dimensionKey}`);
      continue;
    }
    
    for (const tagSlug of tagSlugs) {
      // Convert tag slug to UUID (or use as-is if already a UUID)
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const tagId = tagSlug.match(UUID_REGEX) ? tagSlug : (tagSlugToUuidMap[tagSlug] || tagSlug);
      
      if (!tagSlugToUuidMap[tagSlug] && !tagSlug.match(UUID_REGEX)) {
        console.warn(`Unknown tag slug: ${tagSlug} - using as-is`);
      }
      
      result.push({ tagId, dimensionId });
    }
  }
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== WORKFLOW API CALLED ===')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { 
      documentId, 
      belongingRating, 
      selectedCategory, 
      selectedTags, 
      customTags,
      action,
      step
    } = body
    
    console.log('Parsed values:', {
      documentId,
      belongingRating,
      selectedCategory: selectedCategory?.id || 'none',
      action,
      step
    })

    // Handle all UUID conversions from mock data to real UUIDs
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    // Document ID conversion
    let realDocumentId = documentId
    if (!documentId.match(UUID_REGEX)) {
      // Map mock IDs to real UUIDs
      const mockIdMap: Record<string, string> = {
        'doc-1': '550e8400-e29b-41d4-a716-446655440012',
        'doc-2': '550e8400-e29b-41d4-a716-446655440024',
        'doc-3': '550e8400-e29b-41d4-a716-446655440025'
      }
      realDocumentId = mockIdMap[documentId] || '550e8400-e29b-41d4-a716-446655440012'
      console.log('Converting mock document ID to real UUID:', documentId, '->', realDocumentId)
    }
    
    // Category ID conversion - Complete mapping for all 10 categories
    let realCategoryId = selectedCategory?.id
    if (realCategoryId && !realCategoryId.match(UUID_REGEX)) {
      const categoryMappings = {
        // Original categories (already exist in database)
        'complete-systems-&-methodologies': '550e8400-e29b-41d4-a716-446655440001',
        'proprietary-strategies-&-approaches': '550e8400-e29b-41d4-a716-446655440002',
        // New categories (added by migration)
        'process-documentation-&-workflows': '550e8400-e29b-41d4-a716-446655440013',
        'customer-insights-&-case-studies': '550e8400-e29b-41d4-a716-446655440014',
        'market-research-&-competitive-intelligence': '550e8400-e29b-41d4-a716-446655440015',
        'sales-enablement-&-customer-facing-content': '550e8400-e29b-41d4-a716-446655440016',
        'training-materials-&-educational-content': '550e8400-e29b-41d4-a716-446655440017',
        'knowledge-base-&-reference-materials': '550e8400-e29b-41d4-a716-446655440018',
        'communication-templates-&-messaging': '550e8400-e29b-41d4-a716-446655440019',
        'project-artifacts-&-deliverables': '550e8400-e29b-41d4-a716-446655440020',
        // Legacy mappings (for backward compatibility)
        'complete-systems': '550e8400-e29b-41d4-a716-446655440001',
        'proprietary-strategies': '550e8400-e29b-41d4-a716-446655440002',
        'process-documentation': '550e8400-e29b-41d4-a716-446655440013',
        'customer-insights': '550e8400-e29b-41d4-a716-446655440014',
        'market-research': '550e8400-e29b-41d4-a716-446655440015',
        'sales-enablement': '550e8400-e29b-41d4-a716-446655440016',
        'training-materials': '550e8400-e29b-41d4-a716-446655440017',
        'knowledge-base': '550e8400-e29b-41d4-a716-446655440018',
        'communication-templates': '550e8400-e29b-41d4-a716-446655440019',
        'project-artifacts': '550e8400-e29b-41d4-a716-446655440020'
      }
      realCategoryId = categoryMappings[realCategoryId] || '550e8400-e29b-41d4-a716-446655440001'
      console.log('Converting mock category ID to real UUID:', selectedCategory?.id, '->', realCategoryId)
    }
    
    console.log('UUID conversions applied:', {
      originalDocumentId: documentId,
      realDocumentId,
      originalCategoryId: selectedCategory?.id,
      realCategoryId
    })

    // Get user from auth header or session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    // Extract user from token
    const token = authHeader.replace('Bearer ', '')
    console.log('Token received:', token.substring(0, 50) + '...')
    
    // Create Supabase client with user's JWT token for RLS policies
    // Use server-side environment variables (fallback to NEXT_PUBLIC_ for compatibility)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 20)
    })
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables:', {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      return NextResponse.json(
        { error: 'Server configuration error', success: false },
        { status: 500 }
      )
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    console.log('Getting user from token...')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }
    
    console.log('User authenticated:', user.id)

    if (!documentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    switch (action) {
      case 'save_draft':
        // Save workflow as draft with real database operations
        console.log('Saving draft for user:', user.id, 'document:', realDocumentId)
        console.log('Draft data:', {
          document_id: realDocumentId,
          user_id: user.id,
          step: step || 'A',
          belonging_rating: belongingRating,
          selected_category_id: realCategoryId,
          selected_tags: selectedTags || {},
          custom_tags: customTags || [],
          is_draft: true,
          completed_steps: [step || 'A']
        })
        
        const { data: draftData, error: draftError } = await supabase
          .from('workflow_sessions')
          .insert({
            document_id: realDocumentId,
            user_id: user.id,
            step: step || 'A',
            belonging_rating: belongingRating,
            selected_category_id: realCategoryId,
            selected_tags: selectedTags || {},
            custom_tags: customTags || [],
            is_draft: true,
            completed_steps: [step || 'A'],
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (draftError) {
          console.error('Draft save error:', draftError)
          console.error('Draft error details:', {
            code: draftError.code,
            message: draftError.message,
            details: draftError.details,
            hint: draftError.hint
          })
          return NextResponse.json(
            { 
              error: 'Failed to save draft', 
              success: false,
              details: draftError.message
            },
            { status: 500 }
          )
        }
        
        console.log('Draft saved successfully:', draftData?.id)

        return NextResponse.json({
          message: 'Draft saved successfully',
          workflowId: draftData.id,
          savedAt: new Date().toISOString(),
          success: true
        })

      case 'submit':
        // Validate all required fields for submission
        if (!belongingRating || !realCategoryId || !selectedTags) {
          return NextResponse.json(
            { error: 'Incomplete workflow data', success: false },
            { status: 400 }
          )
        }

        // Feature flag: Use normalized structure or legacy JSONB storage
        // During migration period, this allows safe rollback to old method
        const USE_NORMALIZED = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true';

        if (USE_NORMALIZED) {
          // ===== NEW NORMALIZED METHOD =====
          // Uses junction tables: document_categories, document_tags, custom_tags
          
          try {
            // First, check if there's an existing session or create one
            const { data: existingSession } = await supabase
              .from('workflow_sessions')
              .select('id')
              .eq('document_id', realDocumentId)
              .eq('user_id', user.id)
              .eq('is_draft', true)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            let workflowSessionId: string;

            if (existingSession) {
              workflowSessionId = existingSession.id;
              console.log('Using existing workflow session:', workflowSessionId);
            } else {
              // Create new workflow session
              const { data: newSession, error: sessionError } = await supabase
                .from('workflow_sessions')
                .insert({
                  document_id: realDocumentId,
                  user_id: user.id,
                  step: 'A',
                  is_draft: true,
                  completed_steps: [],
                  updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

              if (sessionError) throw sessionError;
              workflowSessionId = newSession.id;
              console.log('Created new workflow session:', workflowSessionId);
            }

            // Transform frontend tag format to normalized database format
            const transformedTags = transformTagsToNormalized(selectedTags);
            console.log('Transformed tags for normalized structure:', transformedTags);

            // Transform custom tags to normalized format (if any)
            const transformedCustomTags = (customTags || []).map((tag: any) => ({
              dimensionId: tag.dimensionId,
              name: tag.name,
              description: tag.description || ''
            }));

            // Call the new workflow service to complete workflow with normalized structure
            // This will:
            // 1. Insert into document_categories
            // 2. Create custom tags in custom_tags table
            // 3. Insert into document_tags (both standard and custom)
            // 4. Update workflow_sessions to complete
            // 5. Update documents status
            const result = await workflowService.completeWorkflow({
              workflowSessionId: workflowSessionId,
              documentId: realDocumentId,
              userId: user.id,
              categoryId: realCategoryId,
              belongingRating: belongingRating,
              tags: transformedTags,
              customTags: transformedCustomTags
            });

            console.log('Workflow completed successfully with normalized structure:', result.id);

            return NextResponse.json({
              message: 'Workflow submitted successfully',
              workflowId: result.id,
              submittedAt: new Date().toISOString(),
              success: true
            });

          } catch (error) {
            console.error('Error completing workflow with normalized structure:', error);
            console.error('Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            
            return NextResponse.json(
              { 
                error: 'Failed to submit workflow', 
                success: false,
                details: error instanceof Error ? error.message : 'Unknown error'
              },
              { status: 500 }
            );
          }

        } else {
          // ===== LEGACY JSONB METHOD (Backward Compatibility) =====
          // Stores all data in workflow_sessions JSONB columns
          
          console.log('Using legacy JSONB storage method');
          
          const { data: submitData, error: submitError } = await supabase
            .from('workflow_sessions')
            .insert({
              document_id: realDocumentId,
              user_id: user.id,
              step: 'complete',
              belonging_rating: belongingRating,
              selected_category_id: realCategoryId,
              selected_tags: selectedTags,
              custom_tags: customTags || [],
              is_draft: false,
              completed_steps: ['A', 'B', 'C'],
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (submitError) {
            console.error('Submit error:', submitError)
            return NextResponse.json(
              { error: 'Failed to submit workflow', success: false },
              { status: 500 }
            )
          }

          return NextResponse.json({
            message: 'Workflow submitted successfully',
            workflowId: submitData.id,
            submittedAt: new Date().toISOString(),
            success: true
          })
        }

      case 'validate':
        // Validate workflow step
        const errors: Record<string, string> = {}
        
        if (body.step === 'A' && !belongingRating) {
          errors.belongingRating = 'Please provide a relationship rating'
        }
        
        if (body.step === 'B' && !selectedCategory) {
          errors.selectedCategory = 'Please select a primary category'
        }
        
        if (body.step === 'C') {
          const requiredDimensions = ['authorship', 'disclosure-risk', 'intended-use']
          requiredDimensions.forEach(dim => {
            if (!selectedTags || !selectedTags[dim] || selectedTags[dim].length === 0) {
              errors[dim] = `Please select at least one ${dim.replace('-', ' ')} tag`
            }
          })
        }

        return NextResponse.json({
          valid: Object.keys(errors).length === 0,
          errors,
          success: true
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action', success: false },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Workflow API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
    })
    return NextResponse.json(
      { 
        error: 'Workflow operation failed', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}