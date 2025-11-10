/**
 * Mock Data Population Script for Train-Data Application
 *
 * This script transforms 10 LoRA training JSON files into SQL INSERT statements
 * for populating the conversations and templates tables in Supabase.
 *
 * Input: 10 JSON files in training-data-seeds directory
 * Output: SQL INSERT statements in generated-sql directory
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
  mockUserId: '12345678-1234-1234-1234-123456789012', // Consistent mock user UUID
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

/**
 * Escape single quotes for SQL
 */
function escapeSql(text) {
  if (!text) return '';
  return String(text).replace(/'/g, "''");
}

/**
 * Estimate token count (rough estimate: 4 chars = 1 token)
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Assign status based on distribution percentages
 * 40% approved, 30% pending_review, 20% generated, 10% needs_revision
 */
function assignStatus(index, total) {
  const rand = Math.random();
  if (rand < 0.4) return 'approved';
  if (rand < 0.7) return 'pending_review';
  if (rand < 0.9) return 'generated';
  return 'needs_revision';
}

/**
 * Assign tier based on quality score
 * High quality (9+) = template, medium (7-8.9) = scenario, lower = edge_case
 */
function assignTier(qualityScore) {
  if (qualityScore >= 9) return 'template';
  if (qualityScore >= 7) return 'scenario';
  return 'edge_case';
}

/**
 * Generate timestamp within last 30 days with variation
 */
function generateTimestamp(index, total) {
  const now = new Date();
  const daysAgo = Math.floor((index / total) * 30);
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  // Add some random hours/minutes for variation
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

/**
 * Create review history entries for approved conversations
 */
function createReviewHistory(status, timestamp) {
  const history = [];

  if (status === 'approved') {
    // Add generated entry
    const generatedDate = new Date(new Date(timestamp).getTime() - (2 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: generatedDate.toISOString(),
      comment: 'AI-generated training conversation'
    });

    // Add moved to review entry
    const reviewDate = new Date(new Date(timestamp).getTime() - (1 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'moved_to_review',
      performedBy: CONFIG.mockUserId,
      timestamp: reviewDate.toISOString()
    });

    // Add approved entry
    history.push({
      action: 'approved',
      performedBy: CONFIG.mockUserId,
      timestamp: timestamp,
      comment: 'High quality training example',
      reasons: ['excellent_empathy', 'clear_education', 'strong_voice_alignment']
    });
  } else if (status === 'pending_review') {
    // Add generated and moved to review
    const generatedDate = new Date(new Date(timestamp).getTime() - (1 * 24 * 60 * 60 * 1000));
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: generatedDate.toISOString()
    });

    history.push({
      action: 'moved_to_review',
      performedBy: CONFIG.mockUserId,
      timestamp: timestamp
    });
  } else if (status === 'generated') {
    history.push({
      action: 'generated',
      performedBy: 'system',
      timestamp: timestamp
    });
  }

  return history;
}

/**
 * Extract topic from conversation metadata or content
 */
function extractTopic(trainingPair, datasetMetadata) {
  // Try to extract from dataset notes first
  if (datasetMetadata.notes) {
    const match = datasetMetadata.notes.match(/- (.*?)$/);
    if (match) return match[1];
  }

  // Otherwise use conversation phase or background
  if (trainingPair.conversation_metadata?.conversation_phase) {
    return trainingPair.conversation_metadata.conversation_phase.replace(/_/g, ' ');
  }

  return 'financial planning consultation';
}

/**
 * Create conversation title from persona and topic
 */
function createTitle(persona, topic, turnNumber) {
  const personaShort = persona.split('-')[0].trim();
  if (turnNumber === 1) {
    return `${personaShort}: ${topic}`;
  }
  return `${personaShort}: ${topic} (Turn ${turnNumber})`;
}

// ============================================================================
// Main Transformation Logic
// ============================================================================

class ConversationTransformer {
  constructor() {
    this.conversations = [];
    this.templates = new Map(); // Use map to track unique templates
    this.statistics = {
      totalFiles: 0,
      totalConversations: 0,
      totalTurns: 0,
      byStatus: {},
      byTier: {},
      totalTokens: 0,
      avgQualityScore: 0,
      templateCount: 0
    };
  }

  /**
   * Process all JSON files
   */
  async processAllFiles() {
    console.log('🚀 Starting transformation process...\n');

    let conversationIndex = 0;
    const allConversations = [];

    for (const filename of CONFIG.files) {
      const filePath = path.join(CONFIG.inputDir, filename);

      try {
        console.log(`📄 Processing: ${filename}`);
        const data = await this.readJsonFile(filePath);

        // Skip if data is null (file had JSON errors and couldn't be fixed)
        if (data === null) {
          console.log(`   ⏭️  Skipping ${filename} due to JSON errors\n`);
          continue;
        }

        const conversations = await this.transformFile(data, conversationIndex);

        allConversations.push(...conversations);
        conversationIndex += conversations.length;

        this.statistics.totalFiles++;
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
        console.log(`   ⏭️  Continuing with next file...\n`);
        // Don't throw - continue with other files
      }
    }

    this.conversations = allConversations;
    console.log(`\n✅ Processed ${this.statistics.totalFiles} files\n`);
  }

  /**
   * Read and parse JSON file
   */
  async readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');

    try {
      return JSON.parse(content);
    } catch (error) {
      console.log(`⚠️  Warning: JSON parse error in ${path.basename(filePath)}`);
      console.log(`   Attempting to fix common issues...`);

      // Try to fix common JSON issues
      let fixedContent = content;

      // Fix unescaped quotes in strings (common issue)
      // This is a simple attempt - may not catch all cases
      fixedContent = fixedContent.replace(/([^\\])"([^"]*)"([^:])/g, '$1\\"$2\\"$3');

      try {
        return JSON.parse(fixedContent);
      } catch (e2) {
        console.error(`   ❌ Could not fix JSON. Skipping this file.`);
        console.error(`   Error: ${e2.message.substring(0, 100)}`);
        return null; // Return null to skip this file
      }
    }
  }

  /**
   * Transform a single JSON file into conversation records
   */
  async transformFile(data, startIndex) {
    const conversations = [];
    const { dataset_metadata, consultant_profile, training_pairs } = data;

    // Extract template from consultant profile (one template per conversation file)
    this.extractTemplate(consultant_profile, dataset_metadata, training_pairs);

    // Process each training pair
    training_pairs.forEach((pair, index) => {
      const conversation = this.transformTrainingPair(
        pair,
        dataset_metadata,
        consultant_profile,
        startIndex + index
      );

      conversations.push(conversation);
      this.updateStatistics(conversation);
    });

    return conversations;
  }

  /**
   * Transform a training pair into a conversation record
   */
  transformTrainingPair(pair, datasetMetadata, consultantProfile, index) {
    const id = uuidv4();
    const conversationId = pair.conversation_id;
    const persona = pair.conversation_metadata?.client_persona || 'Unknown Client';
    const emotion = pair.emotional_context?.detected_emotions?.primary || 'neutral';
    const topic = extractTopic(pair, datasetMetadata);
    const intent = pair.conversation_metadata?.expected_outcome || null;
    const tone = pair.response_strategy?.tone_selection || consultantProfile.communication_style?.tone;

    // Calculate quality score from training metadata
    const qualityScore = pair.training_metadata?.quality_score
      ? pair.training_metadata.quality_score * 2 // Convert 5-point to 10-point scale
      : 8.0;

    const tier = assignTier(qualityScore);
    const status = assignStatus(index, 100);
    const timestamp = generateTimestamp(index, 100);

    // Calculate tokens from user input and target response
    const userInputTokens = estimateTokens(pair.current_user_input);
    const responseTokens = estimateTokens(pair.target_response);
    const totalTokens = userInputTokens + responseTokens;

    // Build parameters object
    const parameters = {
      consultant_persona: consultantProfile.name,
      client_background: pair.conversation_metadata?.client_background,
      session_context: pair.conversation_metadata?.session_context,
      conversation_phase: pair.conversation_metadata?.conversation_phase,
      expected_outcome: pair.conversation_metadata?.expected_outcome,
      emotional_context: {
        primary_emotion: emotion,
        confidence: pair.emotional_context?.detected_emotions?.primary_confidence,
        intensity: pair.emotional_context?.detected_emotions?.intensity,
        valence: pair.emotional_context?.detected_emotions?.valence
      },
      response_strategy: pair.response_strategy?.primary_strategy,
      strategy_rationale: pair.response_strategy?.primary_rationale,
      key_learning_objective: pair.training_metadata?.key_learning_objective,
      demonstrates_skills: pair.training_metadata?.demonstrates_skills
    };

    // Build quality metrics
    const qualityMetrics = {
      overall: qualityScore,
      relevance: pair.training_metadata?.quality_criteria?.appropriateness_score * 2 || qualityScore,
      accuracy: pair.training_metadata?.quality_criteria?.clarity_score * 2 || qualityScore,
      naturalness: qualityScore,
      methodology: pair.training_metadata?.quality_criteria?.educational_effectiveness * 2 || qualityScore,
      coherence: qualityScore,
      confidence: 'high',
      uniqueness: qualityScore,
      trainingValue: qualityScore >= 9 ? 'high' : qualityScore >= 7 ? 'medium' : 'low'
    };

    // Create review history
    const reviewHistory = createReviewHistory(status, timestamp);

    // Category tags
    const category = [
      datasetMetadata.vertical || 'financial_planning',
      pair.conversation_metadata?.conversation_phase || 'general',
      emotion
    ];

    const title = createTitle(persona, topic, pair.turn_number);

    // Find parent template ID if this conversation should be linked to a template
    let parentId = null;
    let parentType = null;
    if (tier === 'template' && this.templates.size > 0) {
      // Link to the template created from this consultant profile
      const templateKey = consultantProfile.name;
      if (this.templates.has(templateKey)) {
        parentId = this.templates.get(templateKey).id;
        parentType = 'template';
      }
    }

    return {
      id,
      conversation_id: conversationId,
      title,
      persona,
      emotion,
      topic,
      intent,
      tone,
      tier,
      status,
      category,
      quality_score: qualityScore,
      quality_metrics: qualityMetrics,
      confidence_level: 'high',
      turn_count: pair.turn_number || 1,
      total_tokens: totalTokens,
      estimated_cost_usd: (totalTokens / 1000) * 0.015, // Rough estimate
      actual_cost_usd: null,
      generation_duration_ms: Math.floor(Math.random() * 5000) + 2000, // 2-7 seconds
      approved_by: status === 'approved' ? CONFIG.mockUserId : null,
      approved_at: status === 'approved' ? timestamp : null,
      reviewer_notes: status === 'approved' ? pair.training_metadata?.reviewer_notes : null,
      parent_id: parentId,
      parent_type: parentType,
      parameters,
      review_history: reviewHistory,
      error_message: status === 'failed' ? 'Generation failed due to timeout' : null,
      retry_count: 0,
      created_at: timestamp,
      updated_at: timestamp,
      created_by: CONFIG.mockUserId
    };
  }

  /**
   * Extract template from consultant profile and training data
   */
  extractTemplate(consultantProfile, datasetMetadata, trainingPairs) {
    const templateKey = consultantProfile.name;

    // Only create one template per consultant (avoid duplicates)
    if (this.templates.has(templateKey)) {
      return;
    }

    // Get first training pair for strategy info
    const firstPair = trainingPairs[0];
    if (!firstPair) return;

    const id = uuidv4();
    const strategyName = firstPair.response_strategy?.primary_strategy || 'general_financial_planning';
    const templateName = strategyName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const template = {
      id,
      template_name: `${templateName} - ${consultantProfile.name}`,
      description: firstPair.response_strategy?.primary_rationale || consultantProfile.expertise,
      category: datasetMetadata.vertical || 'financial_planning',
      tier: 'template',
      template_text: firstPair.system_prompt || '',
      structure: firstPair.response_breakdown?.structure_type || 'conversational',
      variables: {
        consultant_name: consultantProfile.name,
        consultant_business: consultantProfile.business,
        tone: consultantProfile.communication_style?.tone,
        techniques: consultantProfile.communication_style?.techniques || [],
        avoid: consultantProfile.communication_style?.avoid || []
      },
      tone: consultantProfile.communication_style?.tone || 'professional',
      complexity_baseline: 7.5,
      style_notes: {
        core_philosophy: consultantProfile.core_philosophy,
        communication_style: consultantProfile.communication_style
      },
      example_conversation: {
        user_input: firstPair.current_user_input,
        assistant_response: firstPair.target_response
      },
      quality_threshold: {
        minimum_quality_score: 7.0,
        minimum_empathy_score: 4.0,
        minimum_clarity_score: 4.0
      },
      required_elements: {
        acknowledge_emotions: true,
        provide_education: true,
        use_specific_numbers: true,
        avoid_jargon: true
      },
      applicable_personas: {
        primary: ['mid-career professionals', 'tech workers', 'financially anxious'],
        situations: ['equity compensation', 'inheritance', 'major life changes']
      },
      applicable_emotions: {
        primary: ['overwhelm', 'shame', 'confusion', 'guilt', 'anxiety'],
        handles_well: ['complex negative emotions', 'social comparison anxiety']
      },
      applicable_topics: {
        core: ['financial planning', 'equity compensation', 'inheritance', 'debt management'],
        approach: 'emotional-first financial education'
      },
      usage_count: 0,
      rating: 4.8,
      success_rate: 95.0,
      version: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: {
        id: CONFIG.mockUserId,
        name: 'System Administrator',
        type: 'system'
      },
      last_modified_by: {
        id: CONFIG.mockUserId,
        name: 'System Administrator'
      },
      last_modified: new Date().toISOString()
    };

    this.templates.set(templateKey, template);
    this.statistics.templateCount++;
  }

  /**
   * Update statistics
   */
  updateStatistics(conversation) {
    this.statistics.totalConversations++;
    this.statistics.totalTurns += conversation.turn_count;
    this.statistics.totalTokens += conversation.total_tokens;

    // Track by status
    this.statistics.byStatus[conversation.status] =
      (this.statistics.byStatus[conversation.status] || 0) + 1;

    // Track by tier
    this.statistics.byTier[conversation.tier] =
      (this.statistics.byTier[conversation.tier] || 0) + 1;

    // Update average quality score
    const currentAvg = this.statistics.avgQualityScore;
    const count = this.statistics.totalConversations;
    this.statistics.avgQualityScore =
      ((currentAvg * (count - 1)) + conversation.quality_score) / count;
  }

  /**
   * Generate SQL INSERT statements for conversations
   */
  generateConversationsSql() {
    console.log('📝 Generating conversations SQL...');

    const sqlStatements = [];

    // Add header comment
    sqlStatements.push('-- Mock Data: Conversations Table');
    sqlStatements.push('-- Generated from LoRA training data');
    sqlStatements.push(`-- Total records: ${this.conversations.length}`);
    sqlStatements.push(`-- Generated at: ${new Date().toISOString()}`);
    sqlStatements.push('');

    this.conversations.forEach((conv, index) => {
      const sql = `INSERT INTO conversations (
  id,
  conversation_id,
  title,
  persona,
  emotion,
  topic,
  intent,
  tone,
  tier,
  status,
  category,
  quality_score,
  quality_metrics,
  confidence_level,
  turn_count,
  total_tokens,
  estimated_cost_usd,
  actual_cost_usd,
  generation_duration_ms,
  approved_by,
  approved_at,
  reviewer_notes,
  parent_id,
  parent_type,
  parameters,
  review_history,
  error_message,
  retry_count,
  created_at,
  updated_at,
  created_by
) VALUES (
  '${conv.id}',
  '${escapeSql(conv.conversation_id)}',
  '${escapeSql(conv.title)}',
  '${escapeSql(conv.persona)}',
  '${escapeSql(conv.emotion)}',
  '${escapeSql(conv.topic)}',
  ${conv.intent ? `'${escapeSql(conv.intent)}'` : 'NULL'},
  '${escapeSql(conv.tone)}',
  '${conv.tier}',
  '${conv.status}',
  ARRAY[${conv.category.map(c => `'${escapeSql(c)}'`).join(', ')}],
  ${conv.quality_score},
  '${JSON.stringify(conv.quality_metrics)}'::jsonb,
  '${conv.confidence_level}',
  ${conv.turn_count},
  ${conv.total_tokens},
  ${conv.estimated_cost_usd},
  ${conv.actual_cost_usd || 'NULL'},
  ${conv.generation_duration_ms},
  ${conv.approved_by ? `'${conv.approved_by}'` : 'NULL'},
  ${conv.approved_at ? `'${conv.approved_at}'` : 'NULL'},
  ${conv.reviewer_notes ? `'${escapeSql(conv.reviewer_notes)}'` : 'NULL'},
  ${conv.parent_id ? `'${conv.parent_id}'` : 'NULL'},
  ${conv.parent_type ? `'${conv.parent_type}'` : 'NULL'},
  '${JSON.stringify(conv.parameters)}'::jsonb,
  '${JSON.stringify(conv.review_history)}'::jsonb,
  ${conv.error_message ? `'${escapeSql(conv.error_message)}'` : 'NULL'},
  ${conv.retry_count},
  '${conv.created_at}',
  '${conv.updated_at}',
  '${conv.created_by}'
);`;

      sqlStatements.push(sql);
      sqlStatements.push('');
    });

    return sqlStatements.join('\n');
  }

  /**
   * Generate SQL INSERT statements for templates
   */
  generateTemplatesSql() {
    console.log('📝 Generating templates SQL...');

    const sqlStatements = [];

    // Add header comment
    sqlStatements.push('-- Mock Data: Templates Table');
    sqlStatements.push('-- Generated from LoRA training data');
    sqlStatements.push(`-- Total records: ${this.templates.size}`);
    sqlStatements.push(`-- Generated at: ${new Date().toISOString()}`);
    sqlStatements.push('');

    this.templates.forEach((template) => {
      const sql = `INSERT INTO templates (
  id,
  template_name,
  description,
  category,
  tier,
  template_text,
  structure,
  variables,
  tone,
  complexity_baseline,
  style_notes,
  example_conversation,
  quality_threshold,
  required_elements,
  applicable_personas,
  applicable_emotions,
  applicable_topics,
  usage_count,
  rating,
  success_rate,
  version,
  is_active,
  created_at,
  updated_at,
  created_by,
  last_modified_by,
  last_modified
) VALUES (
  '${template.id}',
  '${escapeSql(template.template_name)}',
  '${escapeSql(template.description)}',
  '${escapeSql(template.category)}',
  '${template.tier}',
  '${escapeSql(template.template_text)}',
  '${escapeSql(template.structure)}',
  '${JSON.stringify(template.variables)}'::jsonb,
  '${escapeSql(template.tone)}',
  ${template.complexity_baseline},
  '${JSON.stringify(template.style_notes)}'::jsonb,
  '${JSON.stringify(template.example_conversation)}'::jsonb,
  '${JSON.stringify(template.quality_threshold)}'::jsonb,
  '${JSON.stringify(template.required_elements)}'::jsonb,
  '${JSON.stringify(template.applicable_personas)}'::jsonb,
  '${JSON.stringify(template.applicable_emotions)}'::jsonb,
  '${JSON.stringify(template.applicable_topics)}'::jsonb,
  ${template.usage_count},
  ${template.rating},
  ${template.success_rate},
  ${template.version},
  ${template.is_active},
  '${template.created_at}',
  '${template.updated_at}',
  '${JSON.stringify(template.created_by)}'::jsonb,
  '${JSON.stringify(template.last_modified_by)}'::jsonb,
  '${template.last_modified}'
);`;

      sqlStatements.push(sql);
      sqlStatements.push('');
    });

    return sqlStatements.join('\n');
  }

  /**
   * Write SQL files
   */
  async writeSqlFiles() {
    console.log('\n💾 Writing SQL files...');

    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Write conversations SQL
    const conversationsSql = this.generateConversationsSql();
    const conversationsSqlPath = path.join(CONFIG.outputDir, 'insert-conversations.sql');
    fs.writeFileSync(conversationsSqlPath, conversationsSql);
    console.log(`✅ Written: ${conversationsSqlPath}`);

    // Write templates SQL
    const templatesSql = this.generateTemplatesSql();
    const templatesSqlPath = path.join(CONFIG.outputDir, 'insert-templates.sql');
    fs.writeFileSync(templatesSqlPath, templatesSql);
    console.log(`✅ Written: ${templatesSqlPath}`);
  }

  /**
   * Generate and write mapping documentation
   */
  async generateMappingDocumentation() {
    console.log('\n📄 Generating mapping documentation...');

    const doc = `# Data Transformation Mapping Documentation

Generated: ${new Date().toISOString()}

## Overview

This document describes how data from the LoRA training JSON files is mapped to the train-data application's database schema.

## Source Data Structure

### JSON File Structure
\`\`\`
{
  "dataset_metadata": { ... },
  "consultant_profile": { ... },
  "training_pairs": [ ... ]
}
\`\`\`

### Training Pair Structure
Each training pair contains:
- \`id\`: Unique identifier for the turn
- \`conversation_id\`: Identifier for the conversation
- \`turn_number\`: Turn number in conversation
- \`conversation_metadata\`: Client persona, background, context
- \`emotional_context\`: Detected emotions and analysis
- \`response_strategy\`: How to respond
- \`target_response\`: The actual response text
- \`training_metadata\`: Quality scores and learning objectives

## Field Mappings

### Conversations Table

| Database Field | Source | Transformation |
|---|---|---|
| \`id\` | Generated | UUID v4 |
| \`conversation_id\` | \`training_pair.conversation_id\` | Direct mapping |
| \`title\` | Derived | "\${persona}: \${topic} (Turn \${n})" |
| \`persona\` | \`conversation_metadata.client_persona\` | Direct mapping |
| \`emotion\` | \`emotional_context.detected_emotions.primary\` | Direct mapping |
| \`topic\` | \`dataset_metadata.notes\` or \`conversation_phase\` | Extracted/derived |
| \`intent\` | \`conversation_metadata.expected_outcome\` | Direct mapping |
| \`tone\` | \`response_strategy.tone_selection\` | Direct mapping |
| \`tier\` | Derived | Based on quality_score (9+ = template, 7-9 = scenario, <7 = edge_case) |
| \`status\` | Generated | Random distribution (40% approved, 30% pending_review, 20% generated, 10% needs_revision) |
| \`category\` | Derived | Array: [vertical, conversation_phase, emotion] |
| \`quality_score\` | \`training_metadata.quality_score\` | Converted from 5-point to 10-point scale (×2) |
| \`quality_metrics\` | \`training_metadata.quality_criteria\` | Mapped to detailed quality metrics object |
| \`confidence_level\` | Fixed | 'high' (all seed data is high quality) |
| \`turn_count\` | \`training_pair.turn_number\` | Direct mapping |
| \`total_tokens\` | Calculated | Sum of estimated tokens from user input + response (length / 4) |
| \`estimated_cost_usd\` | Calculated | (total_tokens / 1000) × 0.015 |
| \`generation_duration_ms\` | Generated | Random between 2000-7000ms |
| \`approved_by\` | Conditional | Mock user UUID if status = 'approved' |
| \`approved_at\` | Conditional | Timestamp if status = 'approved' |
| \`reviewer_notes\` | \`training_metadata.reviewer_notes\` | If status = 'approved' |
| \`parent_id\` | Linked | UUID of template if tier = 'template' |
| \`parent_type\` | Conditional | 'template' if linked |
| \`parameters\` | Composite | JSONB object with metadata, emotional context, strategy |
| \`review_history\` | Generated | Array of review actions based on status |
| \`error_message\` | Conditional | Set if status = 'failed' |
| \`retry_count\` | Fixed | 0 |
| \`created_at\` | Generated | ISO timestamp distributed over last 30 days |
| \`updated_at\` | Same as created_at | ISO timestamp |
| \`created_by\` | Fixed | Mock user UUID |

### Templates Table

| Database Field | Source | Transformation |
|---|---|---|
| \`id\` | Generated | UUID v4 |
| \`template_name\` | Derived | "\${strategy_name} - \${consultant_name}" |
| \`description\` | \`response_strategy.primary_rationale\` | Direct mapping |
| \`category\` | \`dataset_metadata.vertical\` | Direct mapping |
| \`tier\` | Fixed | 'template' |
| \`template_text\` | \`system_prompt\` | Direct mapping |
| \`structure\` | \`response_breakdown.structure_type\` | Direct mapping |
| \`variables\` | \`consultant_profile\` + \`response_strategy\` | Composite JSONB |
| \`tone\` | \`consultant_profile.communication_style.tone\` | Direct mapping |
| \`complexity_baseline\` | Fixed | 7.5 |
| \`style_notes\` | \`consultant_profile.core_philosophy\` + \`communication_style\` | Composite JSONB |
| \`example_conversation\` | First \`training_pair\` | user_input + target_response |
| \`quality_threshold\` | Fixed | Minimum scores object |
| \`required_elements\` | Derived | From consultant communication principles |
| \`applicable_personas\` | Derived | From consultant expertise |
| \`applicable_emotions\` | Derived | From training pairs emotional contexts |
| \`applicable_topics\` | Derived | From dataset metadata and pairs |
| \`usage_count\` | Fixed | 0 |
| \`rating\` | Fixed | 4.8 |
| \`success_rate\` | Fixed | 95.0 |
| \`version\` | Fixed | 1 |
| \`is_active\` | Fixed | true |
| \`created_at\` | Generated | Current timestamp |
| \`updated_at\` | Same as created_at | Current timestamp |
| \`created_by\` | Fixed | Mock user object (JSONB) |
| \`last_modified_by\` | Same as created_by | Mock user object |
| \`last_modified\` | Same as created_at | Current timestamp |

## Data Quality Transformations

### Quality Score Conversion
- Source: 5-point scale (1-5)
- Target: 10-point scale (0-10)
- Formula: source_score × 2

### Token Estimation
- Source: Text content (user input + response)
- Formula: Math.ceil(text.length / 4)
- Rationale: Rough estimate of 4 characters per token

### Status Distribution
- 40% approved
- 30% pending_review
- 20% generated
- 10% needs_revision

### Tier Assignment
- quality_score >= 9.0: 'template'
- quality_score >= 7.0: 'scenario'
- quality_score < 7.0: 'edge_case'

### Timestamp Generation
- Distributed over last 30 days
- Each conversation gets unique timestamp
- Variation added for hours/minutes

## Review History Generation

### For Approved Conversations
1. **Generated** action (2 days before approval)
2. **Moved to review** action (1 day before approval)
3. **Approved** action (at created_at timestamp)

### For Pending Review
1. **Generated** action (1 day before)
2. **Moved to review** action (at created_at)

### For Generated
1. **Generated** action (at created_at)

## Template Extraction Logic

One template is created per unique consultant profile (consultant_name):

1. **Identify unique consultant** from consultant_profile.name
2. **Extract primary strategy** from first training_pair.response_strategy
3. **Build template name** from strategy + consultant name
4. **Populate template fields** from consultant profile and first training pair
5. **Link conversations** with tier='template' to parent template via parent_id

## Validation Rules

### Required Fields (NOT NULL)
- id, conversation_id, persona, emotion, tier, status
- turn_count, total_tokens, retry_count
- created_at, updated_at, created_by

### UUID Validation
- All UUIDs must match pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

### Enum Validation
- tier: must be in ['template', 'scenario', 'edge_case']
- status: must be in ['draft', 'generated', 'pending_review', 'approved', 'rejected', 'needs_revision', 'failed']
- confidence_level: must be in ['high', 'medium', 'low']

### JSONB Validation
- All JSONB fields must contain valid JSON
- parameters, quality_metrics, review_history must be objects/arrays

### Numeric Validation
- quality_score: 0.0 - 10.0
- total_tokens: > 0
- turn_count: > 0

## SQL Escaping

All text fields are escaped for SQL injection prevention:
- Single quotes are doubled: ' → ''
- Example: "It's okay" → "It''s okay"

## Statistics

After processing all files, the script outputs:
- Total files processed
- Total conversations created
- Total turns processed
- Breakdown by status
- Breakdown by tier
- Average quality score
- Total tokens
- Total templates created
`;

    const docPath = path.join(CONFIG.outputDir, 'mapping-documentation.md');
    fs.writeFileSync(docPath, doc);
    console.log(`✅ Written: ${docPath}`);
  }

  /**
   * Display statistics
   */
  displayStatistics() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TRANSFORMATION STATISTICS');
    console.log('='.repeat(60));
    console.log(`Files Processed: ${this.statistics.totalFiles}`);
    console.log(`Total Conversations: ${this.statistics.totalConversations}`);
    console.log(`Total Turns: ${this.statistics.totalTurns}`);
    console.log(`Total Tokens: ${this.statistics.totalTokens.toLocaleString()}`);
    console.log(`Avg Quality Score: ${this.statistics.avgQualityScore.toFixed(2)}/10`);
    console.log(`Templates Created: ${this.statistics.templateCount}`);
    console.log('');
    console.log('By Status:');
    Object.entries(this.statistics.byStatus).forEach(([status, count]) => {
      const percentage = ((count / this.statistics.totalConversations) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    console.log('');
    console.log('By Tier:');
    Object.entries(this.statistics.byTier).forEach(([tier, count]) => {
      const percentage = ((count / this.statistics.totalConversations) * 100).toFixed(1);
      console.log(`  ${tier}: ${count} (${percentage}%)`);
    });
    console.log('='.repeat(60));
    console.log('');
  }

  /**
   * Run the complete transformation process
   */
  async run() {
    try {
      await this.processAllFiles();
      await this.writeSqlFiles();
      await this.generateMappingDocumentation();
      this.displayStatistics();

      console.log('✨ Transformation complete!\n');
      console.log('📁 Generated files:');
      console.log(`   - ${path.join(CONFIG.outputDir, 'insert-conversations.sql')}`);
      console.log(`   - ${path.join(CONFIG.outputDir, 'insert-templates.sql')}`);
      console.log(`   - ${path.join(CONFIG.outputDir, 'mapping-documentation.md')}`);
      console.log('');
      console.log('🚀 Next step: Execute PROMPT E02 to insert data into database');
    } catch (error) {
      console.error('\n❌ Error during transformation:', error);
      process.exit(1);
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

if (require.main === module) {
  const transformer = new ConversationTransformer();
  transformer.run();
}

module.exports = { ConversationTransformer };
