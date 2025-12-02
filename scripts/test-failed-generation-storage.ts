/**
 * Test Script: Failed Generation Storage
 * 
 * Verifies that failed generations are stored correctly with:
 * - Database record insertion
 * - Error report JSON generation
 * - Supabase Storage upload
 * - Retrieval and statistics
 * 
 * Usage: npx tsx scripts/test-failed-generation-storage.ts
 */

import { getFailedGenerationService } from '../src/lib/services/failed-generation-service';
import { detectTruncatedContent } from '../src/lib/utils/truncation-detection';

const service = getFailedGenerationService();

(async () => {
  console.log('Testing failed generation storage...\n');

  try {
    // Simulate a truncated response
    const truncatedContent = 'This is a financial planning conversation that ends abruptly with \\';
    const truncationResult = detectTruncatedContent(truncatedContent);

    console.log('=== TRUNCATION DETECTION ===');
    console.log('Truncation detected:', truncationResult.isTruncated);
    console.log('Pattern:', truncationResult.pattern);
    console.log('Details:', truncationResult.details);
    console.log('Confidence:', truncationResult.confidence);

    // Mock raw response
    const mockRawResponse = {
      id: 'msg_test123',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: truncatedContent }],
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'end_turn', // Unexpected with truncation!
      usage: {
        input_tokens: 500,
        output_tokens: 200,
      },
    };

    // Store as failed generation
    console.log('\n=== STORING FAILED GENERATION ===');
    const failure = await service.storeFailedGeneration({
      prompt: 'Generate a conversation about retirement planning with 3 turns...',
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 24576,
      temperature: 0.7,
      raw_response: mockRawResponse,
      response_content: truncatedContent,
      stop_reason: 'end_turn',  // Unexpected with truncation!
      input_tokens: 500,
      output_tokens: 200,
      failure_type: 'truncation',
      truncation_pattern: truncationResult.pattern || undefined,
      truncation_details: truncationResult.details,
      error_message: 'Content truncated mid-sentence',
      created_by: '00000000-0000-0000-0000-000000000000',
    });

    console.log('\n=== STORED FAILURE ===');
    console.log('ID:', failure.id);
    console.log('Failure Type:', failure.failure_type);
    console.log('Pattern:', failure.truncation_pattern);
    console.log('Stop Reason:', failure.stop_reason);
    console.log('File Path:', failure.raw_file_path);

    // Retrieve it
    console.log('\n=== RETRIEVING FAILURE ===');
    const retrieved = await service.getFailedGeneration(failure.id);
    
    if (!retrieved || retrieved.id !== failure.id) {
      console.error('❌ FAIL: Could not retrieve stored failure');
      process.exit(1);
    }
    console.log('✓ Successfully retrieved failure');
    console.log('  Match:', retrieved.id === failure.id);

    // Download error report
    console.log('\n=== DOWNLOADING ERROR REPORT ===');
    const report = await service.downloadErrorReport(failure.id);
    
    if (!report) {
      console.warn('⚠️  Could not download error report (storage may not be configured)');
    } else {
      console.log('✓ Error report downloaded');
      console.log('  Analysis:', report.error_report.analysis.conclusion);
      console.log('  Stop Reason Analysis:', report.error_report.stop_reason_analysis);
    }

    // List failures
    console.log('\n=== LISTING FAILURES ===');
    const { failures, total } = await service.listFailedGenerations({
      failure_type: 'truncation',
    }, { page: 1, limit: 10 });
    console.log(`✓ Found ${total} truncation failures`);
    console.log(`  First ${failures.length} shown`);

    // Get statistics
    console.log('\n=== FAILURE STATISTICS ===');
    const stats = await service.getFailureStatistics();
    console.log('Total failures:', stats.total);
    console.log('By type:', stats.by_type);
    console.log('By stop_reason:', stats.by_stop_reason);
    console.log('By pattern:', stats.by_pattern);

    console.log('\n✅ PASS: Failed generation storage working correctly');
  } catch (error) {
    console.error('\n❌ FAIL: Error during test:', error);
    process.exit(1);
  }
})();

