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
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Documents fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents', success: false },
        { status: 500 }
      )
    }

    // Transform the data to match expected format
    const transformedDocuments = (documents || []).map(document => ({
      id: document.id,
      title: document.title,
      content: document.content || '',
      summary: document.summary || '',
      createdAt: document.created_at.split('T')[0], // Format as YYYY-MM-DD
      authorId: document.author_id,
      status: document.status
    }))

    return NextResponse.json({
      documents: transformedDocuments,
      total: transformedDocuments.length,
      success: true
    })
  } catch (error) {
    console.error('Documents API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents', success: false },
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
    
    // Validate required fields
    const { title, content, summary } = body
    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    // Create new document in database
    const { data: newDocument, error: insertError } = await supabase
      .from('documents')
      .insert({
        title,
        content,
        summary,
        author_id: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Document creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create document', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      document: {
        id: newDocument.id,
        title: newDocument.title,
        content: newDocument.content,
        summary: newDocument.summary,
        authorId: newDocument.author_id,
        createdAt: newDocument.created_at.split('T')[0],
        status: newDocument.status
      },
      success: true
    }, { status: 201 })
  } catch (error) {
    console.error('Document creation API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create document', success: false },
      { status: 500 }
    )
  }
}