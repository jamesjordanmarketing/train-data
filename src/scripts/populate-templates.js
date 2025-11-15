#!/usr/bin/env node

/**
 * Populate Templates Script
 * 
 * Imports all Tier 1 template definitions into the prompt_templates database table.
 * Links templates to emotional arcs and populates all required fields.
 * 
 * Usage: node src/scripts/populate-templates.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

// Set environment variables for SAOL
process.env.SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Now require SAOL after setting environment variables
const saol = require('../../supa-agent-ops');

// Import template definitions (we'll require them as modules)
const CONFUSION_TO_CLARITY_TEMPLATE = require('../lib/templates/definitions/tier1-templates/confusion-to-clarity').CONFUSION_TO_CLARITY_TEMPLATE;
const SHAME_TO_ACCEPTANCE_TEMPLATE = require('../lib/templates/definitions/tier1-templates/shame-to-acceptance').SHAME_TO_ACCEPTANCE_TEMPLATE;
const COUPLE_CONFLICT_TO_ALIGNMENT_TEMPLATE = require('../lib/templates/definitions/tier1-templates/couple-conflict-to-alignment').COUPLE_CONFLICT_TO_ALIGNMENT_TEMPLATE;
const ANXIETY_TO_CONFIDENCE_TEMPLATE = require('../lib/templates/definitions/tier1-templates/anxiety-to-confidence').ANXIETY_TO_CONFIDENCE_TEMPLATE;
const GRIEF_TO_HEALING_TEMPLATE = require('../lib/templates/definitions/tier1-templates/grief-to-healing').GRIEF_TO_HEALING_TEMPLATE;
const OVERWHELM_TO_EMPOWERMENT_TEMPLATE = require('../lib/templates/definitions/tier1-templates/overwhelm-to-empowerment').OVERWHELM_TO_EMPOWERMENT_TEMPLATE;
const EMERGENCY_TO_CALM_TEMPLATE = require('../lib/templates/definitions/tier1-templates/emergency-to-calm').EMERGENCY_TO_CALM_TEMPLATE;

// All template definitions
const TEMPLATE_DEFINITIONS = [
  CONFUSION_TO_CLARITY_TEMPLATE,
  SHAME_TO_ACCEPTANCE_TEMPLATE,
  COUPLE_CONFLICT_TO_ALIGNMENT_TEMPLATE,
  ANXIETY_TO_CONFIDENCE_TEMPLATE,
  GRIEF_TO_HEALING_TEMPLATE,
  OVERWHELM_TO_EMPOWERMENT_TEMPLATE,
  EMERGENCY_TO_CALM_TEMPLATE
];

async function populateTemplates() {
  console.log('🚀 Starting template population...\n');
  console.log(`📋 Found ${TEMPLATE_DEFINITIONS.length} template definitions to import\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const template of TEMPLATE_DEFINITIONS) {
    try {
      console.log(`\n📝 Processing: ${template.template_name}`);
      console.log(`   Arc Type: ${template.emotional_arc_type}`);

      // Step 1: Get emotional arc ID
      console.log(`   🔍 Looking up emotional arc: ${template.emotional_arc_type}...`);
      
      const arcResult = await saol.agentQuery({
        table: 'emotional_arcs',
        where: [{ column: 'arc_key', operator: 'eq', value: template.emotional_arc_type }],
        limit: 1
      });

      if (!arcResult.data || arcResult.data.length === 0) {
        console.warn(`   ⚠️  Warning: Emotional arc not found: ${template.emotional_arc_type}`);
        console.warn(`   ⏭️  Importing template without emotional_arc_id (will need to be linked later)`);
      }

      const emotionalArcId = arcResult.data?.[0]?.id;

      // Step 2: Prepare template record
      console.log(`   📦 Preparing template record...`);
      
      const templateRecord = {
        template_name: template.template_name,
        description: template.description,
        category: template.category,
        tier: template.tier,
        template_text: template.template_text,
        structure: template.structure,
        variables: template.variables,
        tone: template.tone,
        complexity_baseline: template.complexity_baseline,
        style_notes: template.style_notes,
        example_conversation: template.example_conversation,
        quality_threshold: template.quality_threshold,
        required_elements: template.required_elements,
        emotional_arc_type: template.emotional_arc_type,
        suitable_personas: template.suitable_personas,
        suitable_topics: template.suitable_topics,
        methodology_principles: template.methodology_principles,
        usage_count: 0,
        rating: 0,
        success_rate: 0,
        version: 1,
        is_active: true
      };

      // Add emotional_arc_id if found
      if (emotionalArcId) {
        templateRecord.emotional_arc_id = emotionalArcId;
      }

      // Step 3: Import using SAOL
      console.log(`   💾 Importing to database...`);
      
      const importResult = await saol.agentImportTool({
        source: [templateRecord],
        table: 'prompt_templates',
        mode: 'upsert',
        onConflict: 'template_name'
      });

      if (importResult.success) {
        console.log(`   ✅ Successfully imported: ${template.template_name}`);
        successCount++;
      } else {
        console.error(`   ❌ Failed to import: ${template.template_name}`);
        console.error(`   Error: ${JSON.stringify(importResult.summary)}`);
        errorCount++;
        errors.push({
          template: template.template_name,
          error: JSON.stringify(importResult.summary)
        });
      }

    } catch (error) {
      console.error(`   ❌ Exception during import: ${template.template_name}`);
      console.error(`   Error: ${error.message || String(error)}`);
      errorCount++;
      errors.push({
        template: template.template_name,
        error: error.message || String(error)
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful imports: ${successCount}/${TEMPLATE_DEFINITIONS.length}`);
  console.log(`❌ Failed imports: ${errorCount}/${TEMPLATE_DEFINITIONS.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ template, error }) => {
      console.log(`   - ${template}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  
  if (successCount === TEMPLATE_DEFINITIONS.length) {
    console.log('✅ All templates imported successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Verify templates: node -e "const saol=require(\'./supa-agent-ops\');(async()=>{const r=await saol.agentCount({table:\'prompt_templates\'});console.log(\'Total templates:\',r.count);})();"');
    console.log('   2. Check emotional arc links for any templates imported without arc_id');
    console.log('   3. Test template retrieval using template-service.ts');
  } else {
    console.log('⚠️  Some templates failed to import. Please review errors above.');
  }
  
  console.log('='.repeat(80) + '\n');
}

// Run the population script
populateTemplates().catch((error) => {
  console.error('\n💥 FATAL ERROR during template population:');
  console.error(error);
  process.exit(1);
});

