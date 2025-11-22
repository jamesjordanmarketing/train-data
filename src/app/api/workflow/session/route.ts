import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { workflowService } from '../../../../lib/database'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Reverse dimension mapping: UUID → frontend key
 */
const dimensionIdToKey: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440003': 'authorship',
  '550e8400-e29b-41d4-a716-446655440004': 'format',
  '550e8400-e29b-41d4-a716-446655440005': 'disclosure-risk',
  '550e8400-e29b-41d4-a716-446655440006': 'intended-use',
  '550e8400-e29b-41d4-a716-446655440021': 'evidence-type',
  '550e8400-e29b-41d4-a716-446655440022': 'audience-level',
  '550e8400-e29b-41d4-a716-446655440023': 'gating-level'
};

/**
 * Transform normalized tags to frontend display format
 * Converts: [{ tag_id: 'uuid', dimension_id: 'uuid' }] → { 'dimension-key': ['tag-uuid'] }
 */
function transformNormalizedToDisplay(normalizedTags: any[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  normalizedTags.forEach(tagAssignment => {
    const dimensionKey = dimensionIdToKey[tagAssignment.dimension_id];
    if (!dimensionKey) {
      console.warn(`Unknown dimension ID: ${tagAssignment.dimension_id}`);
      return;
    }
    
    if (!grouped[dimensionKey]) {
      grouped[dimensionKey] = [];
    }
    grouped[dimensionKey].push(tagAssignment.tag_id);
  });
  
  return grouped;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create authenticated Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error', success: false },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const workflowId = searchParams.get('workflowId')
    const useNormalized = process.env.NEXT_PUBLIC_USE_NORMALIZED_TAGS === 'true'

    // Case 1: Fetch specific workflow by ID with normalized data
    if (workflowId && useNormalized) {
      try {
        console.log('Fetching workflow with normalized data:', workflowId)
        
        // Use workflowService to get complete workflow with relations
        const workflowData = await workflowService.getWorkflowWithRelations(workflowId)
        
        // Transform normalized tags to frontend format
        const displayTags = transformNormalizedToDisplay(workflowData.tags.raw)
        
        // Build enriched response
        const enrichedWorkflow = {
          ...workflowData.session,
          category: workflowData.category?.categories || null,
          selectedTags: displayTags,
          normalizedTags: workflowData.tags.raw,
          normalizedCategory: workflowData.category
        }
        
        return NextResponse.json({
          session: enrichedWorkflow,
          success: true,
          source: 'normalized'
        })
      } catch (error) {
        console.error('Error fetching normalized workflow:', error)
        return NextResponse.json(
          { error: 'Failed to fetch workflow', success: false },
          { status: 500 }
        )
      }
    }

    // Case 2: Fetch by documentId (existing behavior)
    if (documentId) {
      const { data: session, error } = await supabase
        .from('workflow_sessions')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Session fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch session', success: false },
          { status: 500 }
        )
      }

      return NextResponse.json({
        session: session || null,
        success: true,
        source: 'jsonb'
      })
    }

    return NextResponse.json(
      { error: 'Either documentId or workflowId is required', success: false },
      { status: 400 }
    )
  } catch (error) {
    console.error('Workflow Session API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session', success: false },
      { status: 500 }
    )
  }
}
