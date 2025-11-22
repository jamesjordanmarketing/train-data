import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dimension = searchParams.get('dimension')
    const required = searchParams.get('required')
    
    let query = supabase
      .from('tag_dimensions')
      .select(`
        *,
        tags (*)
      `)
      .order('sort_order', { ascending: true })

    // Filter by dimension if specified
    if (dimension) {
      query = query.eq('id', dimension)
    }

    // Filter by required status
    if (required === 'true') {
      query = query.eq('required', true)
    } else if (required === 'false') {
      query = query.eq('required', false)
    }

    const { data: tagDimensions, error } = await query

    if (error) {
      console.error('Tag dimensions fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tag dimensions', success: false },
        { status: 500 }
      )
    }

    // Transform the data to match expected format
    const transformedDimensions = (tagDimensions || []).map(dimension => ({
      id: dimension.id,
      name: dimension.name,
      description: dimension.description,
      multiSelect: dimension.multi_select,
      required: dimension.required,
      tags: (dimension.tags || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        icon: tag.icon,
        riskLevel: tag.risk_level
      }))
    }))

    return NextResponse.json({
      dimensions: transformedDimensions,
      total: transformedDimensions.length,
      success: true
    })
  } catch (error) {
    console.error('Tags API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag dimensions', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header for authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const { dimensionId, name, description, riskLevel } = body
    
    if (!dimensionId || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    // Create new custom tag in database
    const { data: newTag, error: insertError } = await supabase
      .from('tags')
      .insert({
        dimension_id: dimensionId,
        name,
        description,
        risk_level: riskLevel,
        sort_order: 999 // Custom tags go at the end
      })
      .select()
      .single()

    if (insertError) {
      console.error('Custom tag creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create custom tag', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tag: {
        id: newTag.id,
        name: newTag.name,
        description: newTag.description,
        riskLevel: newTag.risk_level
      },
      dimensionId,
      success: true
    }, { status: 201 })
  } catch (error) {
    console.error('Custom tag API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create custom tag', success: false },
      { status: 500 }
    )
  }
}