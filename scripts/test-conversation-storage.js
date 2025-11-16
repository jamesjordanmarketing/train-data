#!/usr/bin/env node

/**
 * Conversation Storage Service Validation Script
 * 
 * Tests all CRUD operations of ConversationStorageService:
 * - Create conversation (file upload + metadata insert)
 * - Get conversation
 * - List conversations with filtering
 * - Update conversation status
 * - Download conversation file
 * - Delete conversation (soft/hard)
 * 
 * Usage:
 *   node scripts/test-conversation-storage.js
 * 
 * Prerequisites:
 *   - Conversations table created
 *   - Conversation_turns table created
 *   - conversation-files storage bucket created
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars set
 */

const { createClient } = require('@supabase/supabase-js');
const { ConversationStorageService } = require('../src/lib/services/conversation-storage-service.ts');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Test user ID (use a real UUID or create a test user)
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_CONVERSATION_ID = 'test-conv-' + Date.now();

// ============================================================================
// Sample Conversation Data
// ============================================================================

const SAMPLE_CONVERSATION = {
  dataset_metadata: {
    dataset_name: 'Test Conversation - Business Strategy',
    version: '1.0',
    created_date: new Date().toISOString(),
    vertical: 'business_consulting',
    consultant_persona: 'Strategic Business Advisor',
    target_use: 'lora_training',
    conversation_source: 'automated_generation',
    quality_tier: 'template',
    total_conversations: 1,
    total_turns: 3,
    notes: 'Test conversation for validation',
  },
  consultant_profile: {
    name: 'Alex Morgan',
    business: 'Business Strategy Consulting',
    expertise: 'Strategic Planning',
    years_experience: 10,
    core_philosophy: {
      approach: 'Data-driven decision making',
      values: 'Client success and sustainable growth',
    },
    communication_style: {
      tone: 'Professional and supportive',
      techniques: ['Active listening', 'Strategic questioning', 'Clear frameworks'],
      avoid: ['Jargon overload', 'Prescriptive advice without context'],
    },
  },
  training_pairs: [
    {
      id: 'turn-001',
      conversation_id: TEST_CONVERSATION_ID,
      turn_number: 1,
      system_prompt: 'You are a business strategy consultant...',
      conversation_history: [],
      current_user_input: 'I need help developing a growth strategy for my business.',
      emotional_context: {
        detected_emotions: {
          primary: 'uncertainty',
          primary_confidence: 0.85,
          intensity: 0.6,
        },
      },
      response_strategy: {
        primary_strategy: 'exploratory_questioning',
        tone_selection: 'supportive',
      },
      target_response: "I understand you're looking to develop a growth strategy. Let's start by understanding your current situation. Can you tell me about your business - what industry you're in, your current revenue, and what specific growth challenges you're facing?",
      response_breakdown: {
        empathy_markers: ['I understand'],
        strategic_elements: ['exploratory questions', 'context gathering'],
      },
      expected_user_response_patterns: {
        likely_topics: ['business details', 'challenges', 'goals'],
      },
      training_metadata: {
        quality_score: 8.5,
        quality_criteria: {
          empathy_score: 9.0,
          clarity_score: 8.5,
          appropriateness_score: 8.5,
          brand_voice_alignment: 8.0,
        },
      },
    },
    {
      id: 'turn-002',
      conversation_id: TEST_CONVERSATION_ID,
      turn_number: 2,
      system_prompt: 'You are a business strategy consultant...',
      conversation_history: [],
      current_user_input: "We're a SaaS company with $2M ARR, but growth has plateaued.",
      emotional_context: {
        detected_emotions: {
          primary: 'concern',
          primary_confidence: 0.78,
          intensity: 0.7,
        },
      },
      response_strategy: {
        primary_strategy: 'diagnostic_questioning',
        tone_selection: 'analytical',
      },
      target_response: "Thank you for sharing that. A plateau at $2M ARR is a common inflection point for SaaS companies. To help identify the right growth levers, I'd like to understand: What's your current customer acquisition cost (CAC), what's your customer lifetime value (LTV), and where are you seeing the most friction - in acquiring new customers or retaining existing ones?",
      response_breakdown: {
        empathy_markers: ['Thank you for sharing'],
        strategic_elements: ['diagnostic questions', 'framework introduction'],
      },
      expected_user_response_patterns: {
        likely_topics: ['metrics', 'challenges', 'customer data'],
      },
      training_metadata: {
        quality_score: 8.8,
        quality_criteria: {
          empathy_score: 8.5,
          clarity_score: 9.0,
          appropriateness_score: 9.0,
          brand_voice_alignment: 8.5,
        },
      },
    },
    {
      id: 'turn-003',
      conversation_id: TEST_CONVERSATION_ID,
      turn_number: 3,
      system_prompt: 'You are a business strategy consultant...',
      conversation_history: [],
      current_user_input: 'CAC is $500, LTV is $2000. Main issue is customer acquisition.',
      emotional_context: {
        detected_emotions: {
          primary: 'frustration',
          primary_confidence: 0.82,
          intensity: 0.65,
        },
      },
      response_strategy: {
        primary_strategy: 'framework_introduction',
        tone_selection: 'solution-oriented',
      },
      target_response: "Those are solid metrics - your LTV:CAC ratio of 4:1 is healthy. Since acquisition is the bottleneck, let's focus there. I recommend we explore three key areas: 1) Channel optimization - are you maximizing your best-performing channels? 2) Conversion rate improvement - where are prospects dropping off? 3) Sales cycle efficiency - can we shorten time-to-close? Which of these resonates most with your current challenges?",
      response_breakdown: {
        empathy_markers: ['solid metrics'],
        strategic_elements: ['framework presentation', 'prioritization'],
      },
      expected_user_response_patterns: {
        likely_topics: ['channel selection', 'conversion issues', 'sales process'],
      },
      training_metadata: {
        quality_score: 9.0,
        quality_criteria: {
          empathy_score: 8.5,
          clarity_score: 9.5,
          appropriateness_score: 9.0,
          brand_voice_alignment: 9.0,
        },
      },
    },
  ],
};

// ============================================================================
// Test Functions
// ============================================================================

async function runTests() {
  console.log('========================================');
  console.log('CONVERSATION STORAGE SERVICE VALIDATION');
  console.log('========================================\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const storageService = new ConversationStorageService(supabase);

  let createdConversation = null;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Create Conversation
  console.log('TEST 1: Create Conversation');
  console.log('----------------------------');
  try {
    createdConversation = await storageService.createConversation({
      conversation_id: TEST_CONVERSATION_ID,
      conversation_name: 'Test: Business Strategy Conversation',
      file_content: SAMPLE_CONVERSATION,
      created_by: TEST_USER_ID,
    });

    console.log('✅ Conversation created successfully');
    console.log(`   ID: ${createdConversation.id}`);
    console.log(`   Conversation ID: ${createdConversation.conversation_id}`);
    console.log(`   File URL: ${createdConversation.file_url}`);
    console.log(`   Turn Count: ${createdConversation.turn_count}`);
    console.log(`   Status: ${createdConversation.status}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 2: Get Conversation
  console.log('TEST 2: Get Conversation');
  console.log('------------------------');
  try {
    const fetchedConversation = await storageService.getConversation(TEST_CONVERSATION_ID);
    
    if (!fetchedConversation) {
      throw new Error('Conversation not found');
    }

    if (fetchedConversation.conversation_id !== TEST_CONVERSATION_ID) {
      throw new Error('Conversation ID mismatch');
    }

    console.log('✅ Conversation retrieved successfully');
    console.log(`   Name: ${fetchedConversation.conversation_name}`);
    console.log(`   Quality Score: ${fetchedConversation.quality_score}`);
    console.log(`   Starting Emotion: ${fetchedConversation.starting_emotion}`);
    console.log(`   Ending Emotion: ${fetchedConversation.ending_emotion}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 3: Get Conversation Turns
  console.log('TEST 3: Get Conversation Turns');
  console.log('------------------------------');
  try {
    const turns = await storageService.getConversationTurns(TEST_CONVERSATION_ID);
    
    if (turns.length !== 3) {
      throw new Error(`Expected 3 turns, got ${turns.length}`);
    }

    console.log('✅ Turns retrieved successfully');
    console.log(`   Total turns: ${turns.length}`);
    turns.forEach((turn, index) => {
      console.log(`   Turn ${turn.turn_number}: ${turn.content.substring(0, 60)}...`);
    });
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 4: List Conversations
  console.log('TEST 4: List Conversations');
  console.log('--------------------------');
  try {
    const result = await storageService.listConversations(
      { status: 'pending_review' },
      { page: 1, limit: 10 }
    );

    console.log('✅ Conversations listed successfully');
    console.log(`   Total: ${result.total}`);
    console.log(`   Page: ${result.page} of ${result.totalPages}`);
    console.log(`   Conversations on this page: ${result.conversations.length}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 5: Download Conversation File
  console.log('TEST 5: Download Conversation File');
  console.log('----------------------------------');
  try {
    const fileContent = await storageService.downloadConversationFileById(TEST_CONVERSATION_ID);
    
    if (!fileContent.dataset_metadata) {
      throw new Error('Invalid file structure');
    }

    if (fileContent.training_pairs.length !== 3) {
      throw new Error(`Expected 3 training pairs, got ${fileContent.training_pairs.length}`);
    }

    console.log('✅ File downloaded successfully');
    console.log(`   Dataset: ${fileContent.dataset_metadata.dataset_name}`);
    console.log(`   Training pairs: ${fileContent.training_pairs.length}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 6: Update Conversation Status
  console.log('TEST 6: Update Conversation Status');
  console.log('----------------------------------');
  try {
    const updatedConversation = await storageService.updateConversationStatus(
      TEST_CONVERSATION_ID,
      'approved',
      TEST_USER_ID,
      'Test approval - automated validation'
    );

    if (updatedConversation.status !== 'approved') {
      throw new Error('Status not updated');
    }

    console.log('✅ Status updated successfully');
    console.log(`   New status: ${updatedConversation.status}`);
    console.log(`   Reviewed by: ${updatedConversation.reviewed_by}`);
    console.log(`   Review notes: ${updatedConversation.review_notes}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 7: Count Conversations
  console.log('TEST 7: Count Conversations');
  console.log('---------------------------');
  try {
    const totalCount = await storageService.countConversations();
    const approvedCount = await storageService.countConversations({ status: 'approved' });

    console.log('✅ Count operations successful');
    console.log(`   Total conversations: ${totalCount}`);
    console.log(`   Approved conversations: ${approvedCount}`);
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 8: Soft Delete Conversation
  console.log('TEST 8: Soft Delete Conversation');
  console.log('--------------------------------');
  try {
    await storageService.deleteConversation(TEST_CONVERSATION_ID, false);
    
    // Verify soft delete (should still exist but is_active = false)
    const { data } = await supabase
      .from('conversations')
      .select('is_active')
      .eq('conversation_id', TEST_CONVERSATION_ID)
      .single();

    if (data.is_active) {
      throw new Error('Conversation still active after soft delete');
    }

    console.log('✅ Soft delete successful');
    console.log('   Conversation marked as inactive');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 9: Hard Delete Conversation (Cleanup)
  console.log('TEST 9: Hard Delete Conversation (Cleanup)');
  console.log('------------------------------------------');
  try {
    await storageService.deleteConversation(TEST_CONVERSATION_ID, true);
    
    // Verify hard delete (should not exist)
    const conversation = await storageService.getConversation(TEST_CONVERSATION_ID);
    
    if (conversation !== null) {
      throw new Error('Conversation still exists after hard delete');
    }

    console.log('✅ Hard delete successful');
    console.log('   Conversation and file removed');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testsFailed++;
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log(`✅ Tests passed: ${testsPassed}`);
  console.log(`❌ Tests failed: ${testsFailed}`);
  console.log(`📊 Success rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('');

  if (testsFailed === 0) {
    console.log('🎉 All tests passed! Conversation Storage Service is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// ============================================================================
// Run Tests
// ============================================================================

runTests().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error);
  console.error(error.stack);
  process.exit(1);
});

