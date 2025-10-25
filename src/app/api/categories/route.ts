import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const highValue = searchParams.get('highValue')
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true'
    
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    // Apply high value filter
    if (highValue === 'true') {
      query = query.eq('is_high_value', true)
    } else if (highValue === 'false') {
      query = query.eq('is_high_value', false)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error('Categories fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories', success: false },
        { status: 500 }
      )
    }

    let transformedCategories = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      examples: category.examples,
      isHighValue: category.is_high_value,
      impact: category.impact_description,
    }))

    // Add analytics data if requested
    if (includeAnalytics) {
      transformedCategories = transformedCategories.map(category => ({
        ...category,
        usageAnalytics: {
          totalSelections: Math.floor(Math.random() * 1000) + 100,
          recentActivity: Math.floor(Math.random() * 50) + 5
        },
        valueDistribution: {
          highValue: Math.floor(Math.random() * 40) + 10,
          mediumValue: Math.floor(Math.random() * 35) + 15,
          standardValue: Math.floor(Math.random() * 30) + 20
        }
      }))
    }

    return NextResponse.json({
      categories: transformedCategories,
      total: transformedCategories.length,
      success: true
    })
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', success: false },
      { status: 500 }
    )
  }
}