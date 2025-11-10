#!/usr/bin/env node

/**
 * Insert Conversations Directly via Supabase Client
 * Reads JSON training data and inserts into conversations table
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const TEMPLATE_ID = 'c5ed68ed-4c6b-4915-80e1-e0871229d360';
const MOCK_USER_UUID = '12345678-1234-1234-1234-123456789012';

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function assignStatus(index, total) {
  const rand = Math.random();
  if (rand < 0.4) return 'approved';
  if (rand < 0.7) return 'pending_review';
  if (rand < 0.9) return 'generated';
  return 'needs_revision';
}

function generateTimestamp(index, total) {
  const now = new Date('2025-11-09T07:00:00Z');
  const daysAgo = Math.floor((index / total) * 30);
  const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return timestamp.toISOString();
}

function createReviewHistory(status, timestamp) {
  const history = [
    {
      action: 'generated',
      performedBy: 'system',
      timestamp: new Date(new Date(timestamp).getTime() - 86400000).toISOString()
    }
  ];

  if (status !== 'generated') {
    history.push({
      action: status === 'needs_revision' ? 'moved_to_review' : 'moved_to_review',
      performedBy: MOCK_USER_UUID,
      timestamp: timestamp
    });
  }

  if (status === 'approved') {
    history.push({
      action: 'approved',
      performedBy: MOCK_USER_UUID,
      timestamp: timestamp
    });
  }

  return history;
}

function transformTrainingPair(pair, fileIndex, pairIndex, totalPairs) {
  const globalIndex = (fileIndex - 1) * 4 + pairIndex;
  const userText = pair.conversations[0].value;
  const assistantText = pair.conversations[1].value;

  const combinedText = userText + ' ' + assistantText;
  const totalTokens = estimateTokens(combinedText);

  const persona = pair.consultant.persona;
  const emotion = pair.client.emotion;
  const topic = pair.training_metadata.topic;
  const conversationId = `fp_${persona.split(' - ')[0].toLowerCase().replace(/\s+/g, '_')}_${String(globalIndex).padStart(3, '0')}`;

  const status = assignStatus(globalIndex, totalPairs);
  const createdAt = generateTimestamp(globalIndex, totalPairs);
  const updatedAt = createdAt;

  return {
    id: uuidv4(),
    conversation_id: conversationId,
    title: `${persona}: ${topic}`,
    persona: persona,
    emotion: emotion,
    topic: topic,
    intent: pair.training_metadata.response_strategy_rationale,
    tone: 'warm_reassuring_with_educator_energy',
    tier: 'template',
    status: status,
    category: [
      pair.consultant.category,
      pair.training_metadata.conversation_phase,
      emotion
    ],
    quality_score: 10,
    quality_metrics: {
      overall: 10,
      relevance: 10,
      accuracy: 10,
      naturalness: 10,
      methodology: 10,
      coherence: 10,
      confidence: 'high',
      uniqueness: 10,
      trainingValue: 'high'
    },
    confidence_level: 'high',
    turn_count: 1,
    total_tokens: totalTokens,
    estimated_cost_usd: totalTokens * 0.000015,
    actual_cost_usd: null,
    generation_duration_ms: Math.floor(Math.random() * 3000) + 2000,
    approved_by: status === 'approved' ? MOCK_USER_UUID : null,
    approved_at: status === 'approved' ? createdAt : null,
    reviewer_notes: null,
    parent_id: TEMPLATE_ID,
    parent_type: 'template',
    parameters: {
      consultant_persona: pair.consultant.name,
      client_background: pair.client.background,
      session_context: pair.client.session_context,
      conversation_phase: pair.training_metadata.conversation_phase,
      expected_outcome: pair.training_metadata.expected_outcome,
      emotional_context: {
        primary_emotion: emotion,
        confidence: 0.8,
        intensity: 0.8,
        valence: 'negative'
      },
      response_strategy: pair.training_metadata.response_strategy,
      strategy_rationale: pair.training_metadata.response_strategy_rationale,
      key_learning_objective: pair.training_metadata.key_learning_objective,
      demonstrates_skills: pair.training_metadata.demonstrates_skills
    },
    review_history: createReviewHistory(status, createdAt),
    error_message: null,
    retry_count: 0,
    created_at: createdAt,
    updated_at: updatedAt,
    created_by: MOCK_USER_UUID
  };
}

async function loadAndInsertConversations() {
  console.log('======================================================================');
  console.log('🚀 INSERTING CONVERSATIONS VIA SUPABASE CLIENT');
  console.log('======================================================================\n');

  const trainingDataDir = path.join(__dirname, '../../pmc/context-ai/pmct/training-data-seeds');
  const files = [];

  // Load files 01-09 (file 10 has parsing errors)
  for (let i = 1; i <= 9; i++) {
    const fileNum = String(i).padStart(2, '0');
    const filePath = path.join(trainingDataDir, `c-alpha-build_v3.4-LoRA-FP-convo-${fileNum}-complete.json`);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        files.push({ fileNum, data });
        console.log(`✅ Loaded file ${fileNum}: ${data.training_pairs?.length || 0} pairs`);
      } catch (error) {
        console.log(`⚠️  Skipping file ${fileNum}: ${error.message}`);
      }
    }
  }

  let totalInserted = 0;
  let totalFailed = 0;

  for (const file of files) {
    const pairs = file.data.training_pairs || [];
    const fileIndex = parseInt(file.fileNum);

    for (let pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
      const pair = pairs[pairIndex];
      const conversation = transformTrainingPair(pair, fileIndex, pairIndex, 35);

      console.log(`\nInserting: ${conversation.conversation_id}`);

      const { data, error } = await supabase
        .from('conversations')
        .insert(conversation);

      if (error) {
        console.error(`  ❌ Error:`, error.message);
        totalFailed++;
      } else {
        console.log(`  ✅ Success`);
        totalInserted++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 INSERTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successfully inserted: ${totalInserted} conversations`);
  console.log(`❌ Failed: ${totalFailed} conversations`);

  if (totalFailed === 0) {
    console.log('\n🎉 ALL CONVERSATIONS INSERTED SUCCESSFULLY!\n');
    console.log('Next step: Run verification');
    console.log('  node src/scripts/verify-data-insertion.js\n');
  } else {
    console.log('\n⚠️  Some insertions failed. Please review errors above.\n');
  }
}

loadAndInsertConversations().catch(console.error);
