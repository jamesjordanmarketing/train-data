import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, step, data } = body

    if (!documentId || !step) {
      return NextResponse.json(
        { error: 'Document ID and step are required', success: false },
        { status: 400 }
      )
    }

    // Mock assessment logic based on step
    let assessment: any = {
      documentId,
      step,
      timestamp: new Date().toISOString()
    }

    switch (step) {
      case 'A':
        if (!data.belongingRating) {
          return NextResponse.json(
            { error: 'Belonging rating is required', success: false },
            { status: 400 }
          )
        }

        assessment = {
          ...assessment,
          belongingRating: data.belongingRating,
          recommendations: data.belongingRating >= 4 
            ? ['High-value content identified', 'Proceed with detailed categorization']
            : ['Consider additional context review', 'May require supplementary documentation'],
          confidence: data.belongingRating >= 4 ? 0.92 : 0.76,
          nextStep: 'B'
        }
        break

      case 'B':
        if (!data.selectedCategory) {
          return NextResponse.json(
            { error: 'Selected category is required', success: false },
            { status: 400 }
          )
        }

        assessment = {
          ...assessment,
          selectedCategory: data.selectedCategory,
          processingStrategy: data.selectedCategory.isHighValue 
            ? 'Enhanced processing with priority queuing'
            : 'Standard processing pipeline',
          estimatedValue: data.selectedCategory.isHighValue ? 'High' : 'Standard',
          suggestedTags: [
            'authorship:original-content',
            'disclosure-risk:low-risk',
            'intended-use:training-data'
          ],
          nextStep: 'C'
        }
        break

      case 'C':
        if (!data.selectedTags) {
          return NextResponse.json(
            { error: 'Selected tags are required', success: false },
            { status: 400 }
          )
        }

        const tagCount = Object.values(data.selectedTags).flat().length
        assessment = {
          ...assessment,
          selectedTags: data.selectedTags,
          tagCount,
          completeness: tagCount >= 5 ? 'Complete' : 'Partial',
          riskAssessment: 'Low', // Based on selected risk tags
          processingReady: true,
          finalRecommendations: [
            'Categorization complete and validated',
            'Ready for AI training pipeline',
            'Estimated processing time: 5-10 minutes'
          ]
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid step', success: false },
          { status: 400 }
        )
    }

    return NextResponse.json({
      assessment,
      success: true
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Assessment failed', success: false },
      { status: 500 }
    )
  }
}