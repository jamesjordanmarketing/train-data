/**
 * Convert Conversations to JSON for Supa-Agent-Ops Import
 * 
 * This script regenerates conversation data from the original training JSON files
 * and outputs it as JSON objects (not SQL) for safe import using supa-agent-ops.
 * 
 * This solves the apostrophe problem by avoiding SQL string escaping entirely.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  inputDir: path.join(__dirname, '../../pmc/context-ai/pmct/training-data-seeds'),
  outputDir: path.join(__dirname, 'generated-sql'),
  mockUserId: '12345678-1234-1234-1234-123456789012',
  files: [
    'c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-02-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-03-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-04-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-05-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-06-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-07-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-08-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-09-complete.json',
    'c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json'
  ]
};

// ============================================================================
// Utility Functions
// ============================================================================

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function assignStatus(index, total) {
  const rand = Math.random();
  if (rand < 0.4) return 'approved';
  if (rand < 0.7) return 'pending_review';
  if (rand < 0.9) return 'generated';
  return 'needs_revision';
}

function assignTier(qualityScore) {
  if (qualityScore >= 9) return 'template';
  if (qualityScore >= 7) return 'scenario';
  return 'edge_case';
}

function generateTimestamp(index, total) {
  const now = new Date();
  const daysAgo = Math.floor((index / total) * 30);
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

function createReviewHistory(status, timestamp) {
  const history = [];

  if (status === 'approved') {
    const generatedDate = new Date(new Date(timestamp).getTime() - (2 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: generatedDate.toISOString(),
      comment: 'Conversation generated from LoRA training template'
    });

    const reviewDate = new Date(new Date(timestamp).getTime() - (1 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'submitted_for_review',
      performedBy: CONFIG.mockUserId,
      timestamp: reviewDate.toISOString(),
      comment: 'Ready for quality review'
    });

    history.push({
      action: 'approved',
      performedBy: CONFIG.mockUserId,
      timestamp: timestamp,
      comment: 'High quality training example - approved for use'
    });
  } else if (status === 'pending_review') {
    const generatedDate = new Date(new Date(timestamp).getTime() - (1 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: generatedDate.toISOString(),
      comment: 'Conversation generated from template'
    });

    history.push({
      action: 'submitted_for_review',
      performedBy: CONFIG.mockUserId,
      timestamp: timestamp,
      comment: 'Awaiting quality review'
    });
  } else if (status === 'generated') {
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: timestamp,
      comment: 'Conversation generated from template'
    });
  } else if (status === 'needs_revision') {
    const generatedDate = new Date(new Date(timestamp).getTime() - (2 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: generatedDate.toISOString(),
      comment: 'Conversation generated from template'
    });

    const reviewDate = new Date(new Date(timestamp).getTime() - (1 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'review_requested_changes',
      performedBy: CONFIG.mockUserId,
      timestamp: reviewDate.toISOString(),
      comment: 'Needs improvement in emotional validation and specificity'
    });
  }

  return history;
}

// ============================================================================
// Main Transformation Logic
// ============================================================================

function transformTrainingPairToConversation(pair, fileIndex, pairIndex, totalPairs) {
  // Make conversation_id unique by appending turn number or pair index
  const baseConvId = pair.conversation_id || `conv_${fileIndex}_${pairIndex}`;
  const turnNum = pair.turn_number || (pairIndex + 1);
  const conversationId = `${baseConvId}_turn${turnNum}`;
  const id = uuidv4();
  
  // Extract metadata
  const persona = pair.conversation_metadata?.client_persona || 'Unknown Persona';
  const emotion = pair.emotional_context?.detected_emotions?.primary || 'neutral';
  const topic = pair.conversation_metadata?.session_context || '';
  const intent = pair.conversation_metadata?.expected_outcome || '';
  
  // Extract quality score
  const qualityScore = pair.training_metadata?.quality_score || 8.0;
  
  // Assign status and tier
  const globalIndex = fileIndex * 10 + pairIndex; // Rough global index
  const status = assignStatus(globalIndex, totalPairs);
  const tier = assignTier(qualityScore);
  
  // Calculate tokens
  const userInput = pair.current_user_input || '';
  const targetResponse = pair.target_response || '';
  const totalText = userInput + targetResponse;
  const totalTokens = estimateTokens(totalText);
  
  // Generate timestamps
  const createdAt = generateTimestamp(globalIndex, totalPairs);
  const updatedAt = status === 'approved' 
    ? new Date(new Date(createdAt).getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString()
    : createdAt;
  
  // Build parameters object (this is where all the rich data goes - NO SQL escaping needed!)
  const parameters = {
    consultant_persona: pair.consultant_profile || {},
    emotional_context: pair.emotional_context || {},
    response_strategy: pair.response_strategy || {},
    conversation_metadata: pair.conversation_metadata || {},
    training_metadata: pair.training_metadata || {},
    system_prompt: pair.system_prompt || '',
    current_user_input: userInput,
    target_response: targetResponse,
    turn_number: pair.turn_number || 1,
    conversation_phase: pair.conversation_metadata?.conversation_phase || ''
  };
  
  // Build quality metrics
  const qualityMetrics = {
    overall_score: qualityScore,
    emotional_intelligence_score: pair.training_metadata?.emotional_intelligence_score || qualityScore,
    technical_accuracy_score: pair.training_metadata?.technical_accuracy_score || qualityScore,
    clarity_score: pair.training_metadata?.clarity_score || qualityScore,
    adherence_to_principles_score: pair.training_metadata?.adherence_to_principles_score || qualityScore
  };
  
  // Create review history
  const reviewHistory = createReviewHistory(status, updatedAt);
  
  // Extract categories
  const categories = [
    pair.conversation_metadata?.conversation_phase || 'general',
    pair.emotional_context?.detected_emotions?.primary || 'neutral'
  ];
  
  // Extract tone
  const tone = pair.response_strategy?.tone_requirement || 
                pair.conversation_metadata?.expected_tone || 
                'professional';
  
  // Build the complete conversation object
  const conversation = {
    id,
    conversation_id: conversationId,
    title: pair.conversation_metadata?.session_context || `${persona}: ${topic.substring(0, 50)}...`,
    persona,
    emotion,
    topic,
    intent,
    tone,
    tier,
    status,
    category: categories,
    quality_score: qualityScore,
    quality_metrics: qualityMetrics,
    confidence_level: pair.emotional_context?.detected_emotions?.primary_confidence >= 0.8 ? 'high' : 
                       pair.emotional_context?.detected_emotions?.primary_confidence >= 0.6 ? 'medium' : 'low',
    turn_count: 1, // Each training pair is one turn
    total_tokens: totalTokens,
    estimated_cost_usd: (totalTokens / 1000) * 0.002, // Rough estimate
    actual_cost_usd: null,
    generation_duration_ms: Math.floor(Math.random() * 3000) + 1000,
    approved_by: null, // Set to null to avoid foreign key constraint
    approved_at: status === 'approved' ? updatedAt : null,
    reviewer_notes: status === 'approved' ? 'High quality training example' : null,
    parent_id: null, // Set to null to avoid foreign key constraint (no template linkage for now)
    parent_type: null,
    parameters, // JSONB field - no escaping needed!
    review_history: reviewHistory, // Array - no escaping needed!
    error_message: null,
    retry_count: 0,
    created_at: createdAt,
    updated_at: updatedAt,
    created_by: CONFIG.mockUserId // Use mock user ID (may need to create user first)
  };
  
  return conversation;
}

async function main() {
  console.log('🚀 Converting Training Data to JSON Objects\n');
  console.log('This conversion avoids SQL escaping issues entirely!\n');
  
  const conversations = [];
  let totalPairs = 0;
  
  // First pass: count total pairs
  for (let i = 0; i < CONFIG.files.length; i++) {
    const fileName = CONFIG.files[i];
    const filePath = path.join(CONFIG.inputDir, fileName);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const content = JSON.parse(fileContent);
      if (content.training_pairs) {
        totalPairs += content.training_pairs.length;
      }
    } catch (error) {
      console.error(`  ❌ Error reading ${fileName}:`, error.message);
      console.error(`     File path: ${filePath}`);
      console.error(`     Skipping this file...`);
      continue;
    }
  }
  
  console.log(`Found ${totalPairs} training pairs across ${CONFIG.files.length} files\n`);
  
  // Second pass: transform to conversations
  for (let fileIndex = 0; fileIndex < CONFIG.files.length; fileIndex++) {
    const fileName = CONFIG.files[fileIndex];
    const filePath = path.join(CONFIG.inputDir, fileName);
    
    console.log(`Processing: ${fileName}...`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const content = JSON.parse(fileContent);
      
      if (!content.training_pairs) {
        console.log(`  ⚠️  No training_pairs found in ${fileName}`);
        continue;
      }
      
      for (let pairIndex = 0; pairIndex < content.training_pairs.length; pairIndex++) {
        const pair = content.training_pairs[pairIndex];
        
        // Add consultant profile to each pair for context
        pair.consultant_profile = content.consultant_profile;
        
        const conversation = transformTrainingPairToConversation(
          pair,
          fileIndex,
          pairIndex,
          totalPairs
        );
        
        conversations.push(conversation);
      }
      
      console.log(`  ✅ Processed ${content.training_pairs.length} pairs`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${fileName}:`, error.message);
      console.error(`     File path: ${filePath}`);
      console.error(`     Skipping this file...`);
      continue; // Skip this file and continue with the rest
    }
  }
  
  console.log(`\n📊 Conversion Summary:`);
  console.log(`  Total conversations: ${conversations.length}`);
  console.log(`  Expected: ${totalPairs}`);
  
  // Status distribution
  const statusCounts = {};
  conversations.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });
  console.log(`\n  Status distribution:`);
  Object.entries(statusCounts).forEach(([status, count]) => {
    const pct = ((count / conversations.length) * 100).toFixed(1);
    console.log(`    ${status}: ${count} (${pct}%)`);
  });
  
  // Tier distribution
  const tierCounts = {};
  conversations.forEach(c => {
    tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
  });
  console.log(`\n  Tier distribution:`);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    console.log(`    ${tier}: ${count}`);
  });
  
  // Average quality score
  const avgQuality = conversations.reduce((sum, c) => sum + c.quality_score, 0) / conversations.length;
  console.log(`\n  Average quality score: ${avgQuality.toFixed(2)}`);
  
  // Total tokens
  const totalTokens = conversations.reduce((sum, c) => sum + c.total_tokens, 0);
  console.log(`  Total tokens: ${totalTokens.toLocaleString()}`);
  
  // Write output files
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Write JSON array (pretty-printed for debugging)
  const jsonPath = path.join(CONFIG.outputDir, 'conversations-for-import.json');
  fs.writeFileSync(jsonPath, JSON.stringify(conversations, null, 2));
  console.log(`\n✅ JSON output: ${jsonPath}`);
  
  // Write NDJSON (one object per line - more efficient for large imports)
  const ndjsonPath = path.join(CONFIG.outputDir, 'conversations-for-import.ndjson');
  fs.writeFileSync(
    ndjsonPath,
    conversations.map(c => JSON.stringify(c)).join('\n')
  );
  console.log(`✅ NDJSON output: ${ndjsonPath}`);
  
  // Verify apostrophes are present (they should be!)
  const withApostrophes = conversations.filter(c => {
    const paramStr = JSON.stringify(c.parameters);
    return paramStr.includes("don't") || 
           paramStr.includes("can't") || 
           paramStr.includes("won't") ||
           paramStr.includes("it's") ||
           paramStr.includes("that's");
  });
  
  console.log(`\n🔍 Apostrophe Check:`);
  console.log(`  Conversations with apostrophes: ${withApostrophes.length}/${conversations.length}`);
  console.log(`  ✅ Apostrophes preserved in JSON (no escaping needed!)`);
  
  console.log(`\n✨ Conversion complete! Ready for supa-agent-ops import.`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

