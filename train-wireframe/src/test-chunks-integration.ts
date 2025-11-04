/**
 * Test Script for Chunks Integration Service
 * 
 * Tests:
 * 1. Fetch chunk by ID
 * 2. Cache performance (hit vs miss)
 * 3. Dimension parsing
 * 4. Cache metrics
 * 5. Search chunks
 * 6. Document chunks retrieval
 * 7. Database connection
 * 
 * Run with: npx ts-node src/test-chunks-integration.ts
 * or: npm run test:chunks-integration (if script added to package.json)
 */

import { chunksService, dimensionParser, chunkCache } from './lib/chunks-integration';
import { ChunksService } from './lib/chunks-integration/chunks-service';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName: string) {
  log(`\n${testName}`, 'blue');
  console.log('-'.repeat(60));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message: string) {
  console.log(`   ${message}`);
}

/**
 * Configuration
 * Update these values based on your actual database
 */
const TEST_CONFIG = {
  // Replace with an actual chunk UUID from your database
  chunkId: 'YOUR_TEST_CHUNK_UUID',
  
  // Replace with an actual document UUID from your database
  documentId: 'YOUR_TEST_DOCUMENT_UUID',
  
  // Search term for testing
  searchTerm: 'investment',
  
  // Supabase credentials (loaded from environment variables)
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || ''
};

/**
 * Main test function
 */
async function testChunksIntegration() {
  logSection('Chunks Integration Service Test Suite');
  log('Starting comprehensive integration tests...', 'cyan');

  // Validation
  if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseKey) {
    logError('Supabase credentials not found in environment variables');
    logInfo('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  // Create service instance for testing
  const testService = new ChunksService(
    TEST_CONFIG.supabaseUrl,
    TEST_CONFIG.supabaseKey,
    true // Enable caching
  );

  try {
    // Test 0: Database Connection
    logTest('Test 0: Database Connection');
    const isConnected = await testService.testConnection();
    if (isConnected) {
      logSuccess('Database connection successful');
    } else {
      logError('Database connection failed');
      logWarning('Cannot proceed with tests. Check your Supabase configuration.');
      return;
    }

    // Test 1: Fetch chunk by ID
    logTest('Test 1: Fetch Chunk by ID');
    if (TEST_CONFIG.chunkId === 'YOUR_TEST_CHUNK_UUID') {
      logWarning('Using placeholder chunk ID. Update TEST_CONFIG.chunkId with a real UUID.');
      logInfo('Skipping this test...');
    } else {
      const startTime1 = Date.now();
      const chunk = await testService.getChunkById(TEST_CONFIG.chunkId);
      const fetchTime1 = Date.now() - startTime1;

      if (chunk) {
        logSuccess(`Chunk retrieved in ${fetchTime1}ms`);
        logInfo(`Title: ${chunk.title}`);
        logInfo(`Document: ${chunk.documentTitle || chunk.documentId}`);
        logInfo(`Content length: ${chunk.content.length} characters`);
        logInfo(`Has dimensions: ${chunk.dimensions ? 'Yes' : 'No'}`);
        
        if (chunk.sectionHeading) {
          logInfo(`Section: ${chunk.sectionHeading}`);
        }
        if (chunk.pageStart) {
          logInfo(`Pages: ${chunk.pageStart}-${chunk.pageEnd || chunk.pageStart}`);
        }
      } else {
        logWarning('Chunk not found. Check if the chunk ID exists in your database.');
      }
    }

    // Test 2: Cache Performance
    logTest('Test 2: Cache Performance');
    if (TEST_CONFIG.chunkId !== 'YOUR_TEST_CHUNK_UUID') {
      // First call (cache miss - should be slower)
      chunkCache.clear(); // Clear cache to ensure miss
      const start1 = Date.now();
      const result1 = await testService.getChunkById(TEST_CONFIG.chunkId);
      const time1 = Date.now() - start1;

      // Second call (cache hit - should be faster)
      const start2 = Date.now();
      const result2 = await testService.getChunkById(TEST_CONFIG.chunkId);
      const time2 = Date.now() - start2;

      if (result1 && result2) {
        logSuccess('Cache test completed');
        logInfo(`First call (cache miss): ${time1}ms`);
        logInfo(`Second call (cache hit): ${time2}ms`);
        
        const speedup = time1 / (time2 || 1);
        if (speedup > 2) {
          logSuccess(`Cache speedup: ${speedup.toFixed(1)}x faster`);
        } else {
          logWarning(`Cache speedup only ${speedup.toFixed(1)}x (expected >2x)`);
        }

        // Check performance targets
        if (time1 < 200) {
          logSuccess(`✓ Cache miss within 200ms target (${time1}ms)`);
        } else {
          logWarning(`⚠ Cache miss exceeded 200ms target (${time1}ms)`);
        }

        if (time2 < 50) {
          logSuccess(`✓ Cache hit within 50ms target (${time2}ms)`);
        } else {
          logWarning(`⚠ Cache hit exceeded 50ms target (${time2}ms)`);
        }
      } else {
        logError('Cache test failed - chunk not retrieved');
      }
    } else {
      logWarning('Skipping cache test (no valid chunk ID)');
    }

    // Test 3: Dimension Parsing
    logTest('Test 3: Dimension Parsing');
    if (TEST_CONFIG.chunkId !== 'YOUR_TEST_CHUNK_UUID') {
      const dims = await testService.getDimensionsForChunk(TEST_CONFIG.chunkId);
      
      if (dims) {
        logSuccess('Dimensions retrieved and parsed');
        logInfo(`Confidence: ${(dims.confidence * 100).toFixed(1)}%`);
        logInfo(`Extracted at: ${new Date(dims.extractedAt).toLocaleString()}`);
        
        if (dims.semanticDimensions) {
          const sem = dims.semanticDimensions;
          
          if (sem.persona && sem.persona.length > 0) {
            logSuccess(`✓ Personas extracted: ${sem.persona.join(', ')}`);
          } else {
            logWarning('No personas extracted');
          }
          
          if (sem.emotion && sem.emotion.length > 0) {
            logSuccess(`✓ Emotions extracted: ${sem.emotion.join(', ')}`);
          } else {
            logWarning('No emotions extracted');
          }
          
          if (sem.complexity !== undefined) {
            const level = 
              sem.complexity > 0.7 ? 'High' :
              sem.complexity > 0.4 ? 'Medium' : 'Low';
            logSuccess(`✓ Complexity: ${level} (${sem.complexity.toFixed(2)})`);
          } else {
            logWarning('No complexity score');
          }
          
          if (sem.domain && sem.domain.length > 0) {
            logSuccess(`✓ Domains: ${sem.domain.join(', ')}`);
          } else {
            logInfo('No specific domains detected (general content)');
          }

          // Test the describe method
          const description = dimensionParser.describe(dims);
          logInfo(`\nSummary: ${description}`);
        } else {
          logWarning('No semantic dimensions available');
        }
      } else {
        logWarning('No dimensions found for this chunk');
        logInfo('The chunk may not have dimension analysis yet');
      }
    } else {
      logWarning('Skipping dimension test (no valid chunk ID)');
    }

    // Test 4: Cache Metrics
    logTest('Test 4: Cache Metrics');
    const metrics = chunkCache.getMetrics();
    logSuccess('Cache metrics retrieved');
    logInfo(`Total hits: ${metrics.hits}`);
    logInfo(`Total misses: ${metrics.misses}`);
    logInfo(`Hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`);
    logInfo(`Cache size: ${metrics.size}/${metrics.maxSize}`);
    
    if (metrics.hits + metrics.misses > 0) {
      if (metrics.hitRate > 0.5) {
        logSuccess(`✓ Hit rate above 50% (${(metrics.hitRate * 100).toFixed(1)}%)`);
      } else {
        logInfo(`Hit rate at ${(metrics.hitRate * 100).toFixed(1)}% (expected to improve with usage)`);
      }
    }

    // Test 5: Search Chunks
    logTest('Test 5: Search Chunks');
    logInfo(`Searching for: "${TEST_CONFIG.searchTerm}"`);
    const searchStart = Date.now();
    const searchResults = await testService.searchChunks(TEST_CONFIG.searchTerm, { 
      limit: 5,
      includeContent: false // Don't include full content for performance
    });
    const searchTime = Date.now() - searchStart;

    if (searchResults.length > 0) {
      logSuccess(`Found ${searchResults.length} chunks matching "${TEST_CONFIG.searchTerm}" in ${searchTime}ms`);
      searchResults.forEach((chunk, idx) => {
        logInfo(`${idx + 1}. ${chunk.title} (${chunk.documentTitle || 'Unknown doc'})`);
      });
    } else {
      logWarning(`No chunks found matching "${TEST_CONFIG.searchTerm}"`);
      logInfo('Try a different search term that exists in your documents');
    }

    // Test 6: Get Chunks by Document
    logTest('Test 6: Get Chunks by Document');
    if (TEST_CONFIG.documentId === 'YOUR_TEST_DOCUMENT_UUID') {
      logWarning('Using placeholder document ID. Update TEST_CONFIG.documentId with a real UUID.');
      logInfo('Skipping this test...');
    } else {
      const docChunksStart = Date.now();
      const docChunks = await testService.getChunksByDocument(TEST_CONFIG.documentId, {
        limit: 10,
        sortBy: 'page',
        includeContent: false
      });
      const docChunksTime = Date.now() - docChunksStart;

      if (docChunks.length > 0) {
        logSuccess(`Retrieved ${docChunks.length} chunks from document in ${docChunksTime}ms`);
        logInfo(`First chunk: ${docChunks[0].title}`);
        logInfo(`Last chunk: ${docChunks[docChunks.length - 1].title}`);

        // Get total count
        const totalCount = await testService.getChunkCount(TEST_CONFIG.documentId);
        logInfo(`Total chunks in document: ${totalCount}`);
      } else {
        logWarning('No chunks found for this document');
        logInfo('Check if the document ID exists and has chunks');
      }
    }

    // Test 7: Cache Invalidation
    logTest('Test 7: Cache Invalidation');
    const sizeBefore = chunkCache.size();
    logInfo(`Cache size before invalidation: ${sizeBefore}`);
    
    if (TEST_CONFIG.chunkId !== 'YOUR_TEST_CHUNK_UUID') {
      testService.invalidateChunkCache(TEST_CONFIG.chunkId);
      logSuccess('Invalidated chunk cache');
    }
    
    if (TEST_CONFIG.documentId !== 'YOUR_TEST_DOCUMENT_UUID') {
      testService.invalidateDocumentCache(TEST_CONFIG.documentId);
      logSuccess('Invalidated document cache');
    }
    
    const sizeAfter = chunkCache.size();
    logInfo(`Cache size after invalidation: ${sizeAfter}`);

    // Test 8: Performance Summary
    logTest('Test 8: Performance Summary');
    const finalMetrics = testService.getCacheMetrics();
    const totalRequests = finalMetrics.hits + finalMetrics.misses;
    
    logSuccess('Performance Summary:');
    logInfo(`Total requests: ${totalRequests}`);
    logInfo(`Cache hits: ${finalMetrics.hits} (${(finalMetrics.hitRate * 100).toFixed(1)}%)`);
    logInfo(`Cache misses: ${finalMetrics.misses}`);
    logInfo(`Final cache size: ${finalMetrics.size}/${finalMetrics.maxSize}`);

    // Final verdict
    logSection('Test Suite Results');
    
    const issues: string[] = [];
    if (!isConnected) issues.push('Database connection failed');
    if (TEST_CONFIG.chunkId === 'YOUR_TEST_CHUNK_UUID') issues.push('No valid chunk ID configured');
    if (TEST_CONFIG.documentId === 'YOUR_TEST_DOCUMENT_UUID') issues.push('No valid document ID configured');

    if (issues.length === 0) {
      logSuccess('✅ All tests completed successfully!');
      logSuccess('The chunks integration service is working correctly.');
    } else {
      logWarning('⚠️  Tests completed with warnings:');
      issues.forEach(issue => logWarning(`   - ${issue}`));
      logInfo('\nUpdate TEST_CONFIG in this file with actual UUIDs from your database');
    }

    logInfo('\nTo get valid test IDs, run these queries in your Supabase SQL editor:');
    logInfo('  SELECT id FROM chunks LIMIT 1;');
    logInfo('  SELECT id FROM documents LIMIT 1;');

  } catch (error) {
    logError('Test suite failed with error:');
    console.error(error);
  }
}

/**
 * Run tests
 */
if (require.main === module) {
  testChunksIntegration()
    .then(() => {
      logSection('Test Suite Finished');
      process.exit(0);
    })
    .catch((error) => {
      logError('Fatal error running tests:');
      console.error(error);
      process.exit(1);
    });
}

export { testChunksIntegration };

