import { NextRequest, NextResponse } from 'next/server'
import { primaryCategories as mockCategories } from '../../../../data/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = mockCategories.find(cat => cat.id === params.id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', success: false },
        { status: 404 }
      )
    }

    // Add detailed information for single category view
    const enhancedCategory = {
      ...category,
      usageAnalytics: {
        totalSelections: Math.floor(Math.random() * 1000) + 100,
        recentActivity: Math.floor(Math.random() * 50) + 5,
        averageProcessingTime: Math.floor(Math.random() * 120) + 30, // seconds
        successRate: (Math.random() * 0.15 + 0.85).toFixed(3) // 85-100%
      },
      valueDistribution: {
        highValue: Math.floor(Math.random() * 40) + 10,
        mediumValue: Math.floor(Math.random() * 35) + 15,
        standardValue: Math.floor(Math.random() * 30) + 20
      },
      relatedCategories: mockCategories
        .filter(c => c.id !== params.id)
        .slice(0, 3)
        .map(c => ({ id: c.id, name: c.name }))
    }

    return NextResponse.json({
      category: enhancedCategory,
      success: true
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category', success: false },
      { status: 500 }
    )
  }
}