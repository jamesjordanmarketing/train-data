import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowId, format, includeMetadata } = body

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required', success: false },
        { status: 400 }
      )
    }

    // Mock export data generation
    const exportData: any = {
      workflowId,
      exportedAt: new Date().toISOString(),
      format: format || 'json',
      document: {
        id: 'doc_1',
        title: 'Sample Document',
        summary: 'Document summary...'
      },
      categorization: {
        belongingRating: 4,
        primaryCategory: {
          id: 'technical-documentation',
          name: 'Technical Documentation'
        },
        secondaryTags: {
          authorship: ['original-content'],
          'disclosure-risk': ['low-risk'],
          'intended-use': ['training-data']
        }
      }
    }

    if (includeMetadata) {
      exportData.metadata = {
        processingTime: '2.3 seconds',
        confidence: 0.94,
        riskAssessment: 'Low',
        recommendations: [
          'Document is well-suited for AI training',
          'Consider adding more technical depth tags'
        ]
      }
    }

    // Generate different formats
    let responseData
    let contentType = 'application/json'
    let filename = `workflow_${workflowId}.json`

    switch (format) {
      case 'csv':
        contentType = 'text/csv'
        filename = `workflow_${workflowId}.csv`
        const csvHeaders = 'Document ID,Title,Belonging Rating,Primary Category,Tags Count'
        const csvData = `${exportData.document.id},${exportData.document.title},${exportData.categorization.belongingRating},${exportData.categorization.primaryCategory.name},${Object.keys(exportData.categorization.secondaryTags).length}`
        responseData = `${csvHeaders}\n${csvData}`
        break

      case 'xml':
        contentType = 'application/xml'
        filename = `workflow_${workflowId}.xml`
        responseData = `<?xml version="1.0" encoding="UTF-8"?>
<workflow id="${workflowId}">
  <document>
    <id>${exportData.document.id}</id>
    <title>${exportData.document.title}</title>
  </document>
  <categorization>
    <belongingRating>${exportData.categorization.belongingRating}</belongingRating>
    <primaryCategory>${exportData.categorization.primaryCategory.name}</primaryCategory>
  </categorization>
</workflow>`
        break

      default:
        responseData = JSON.stringify(exportData, null, 2)
    }

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Export failed', success: false },
      { status: 500 }
    )
  }
}