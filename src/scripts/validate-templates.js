#!/usr/bin/env node

/**
 * Validate Templates Script
 * 
 * Verifies that templates were imported successfully into the database.
 * 
 * Usage: node src/scripts/validate-templates.js
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

async function validateTemplates() {
  console.log('🔍 Validating template import...\n');

  try {
    // 1. Count total templates
    console.log('1️⃣  Counting templates...');
    const countResult = await saol.agentCount({ table: 'prompt_templates' });
    console.log(`   ✅ Total templates in database: ${countResult.count}\n`);

    if (countResult.count === 0) {
      console.log('   ❌ No templates found! Import may have failed.');
      return;
    }

    // 2. Check template structure
    console.log('2️⃣  Checking template structure...');
    const queryResult = await saol.agentQuery({
      table: 'prompt_templates',
      where: [{ column: 'emotional_arc_type', operator: 'eq', value: 'confusion_to_clarity' }],
      limit: 1
    });

    if (queryResult.data && queryResult.data.length > 0) {
      const template = queryResult.data[0];
      console.log(`   ✅ Sample template found: ${template.template_name}`);
      console.log(`      - Arc Type: ${template.emotional_arc_type}`);
      console.log(`      - Tier: ${template.tier}`);
      console.log(`      - Category: ${template.category}`);
      console.log(`      - Variables: ${JSON.stringify(template.variables).substring(0, 100)}...`);
      console.log(`      - Template text length: ${template.template_text?.length || 0} chars`);
      console.log(`      - Required elements: ${template.required_elements?.length || 0}`);
      console.log(`      - Suitable personas: ${template.suitable_personas?.length || 0}`);
      console.log(`      - Suitable topics: ${template.suitable_topics?.length || 0}\n`);
    }

    // 3. List all templates
    console.log('3️⃣  Listing all templates...');
    const allTemplatesResult = await saol.agentQuery({
      table: 'prompt_templates',
      limit: 20
    });

    if (allTemplatesResult.data && allTemplatesResult.data.length > 0) {
      console.log(`   Found ${allTemplatesResult.data.length} templates:\n`);
      allTemplatesResult.data.forEach((t, i) => {
        const arcStatus = t.emotional_arc_id ? '✅' : '⚠️ ';
        console.log(`   ${i + 1}. ${arcStatus} ${t.template_name}`);
        console.log(`      Arc: ${t.emotional_arc_type} | Tier: ${t.tier} | Active: ${t.is_active}`);
      });
      console.log('');
    }

    // 4. Check for templates without emotional arc links
    console.log('4️⃣  Checking emotional arc links...');
    const unlinkedResult = await saol.agentQuery({
      table: 'prompt_templates',
      where: [{ column: 'emotional_arc_id', operator: 'is', value: null }],
      limit: 20
    });

    if (unlinkedResult.data && unlinkedResult.data.length > 0) {
      console.log(`   ⚠️  Found ${unlinkedResult.data.length} templates without emotional_arc_id:`);
      unlinkedResult.data.forEach((t) => {
        console.log(`      - ${t.template_name} (${t.emotional_arc_type})`);
      });
      console.log('   ℹ️  These templates need matching emotional arcs to be created in emotional_arcs table.\n');
    } else {
      console.log(`   ✅ All templates have emotional_arc_id links!\n`);
    }

    // 5. Summary
    console.log('=' .repeat(80));
    console.log('✅ VALIDATION COMPLETE');
    console.log('=' .repeat(80));
    console.log(`Total templates: ${countResult.count}`);
    console.log(`Templates with arc links: ${countResult.count - (unlinkedResult.data?.length || 0)}`);
    console.log(`Templates needing arc links: ${unlinkedResult.data?.length || 0}`);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Validation failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run validation
validateTemplates().catch((error) => {
  console.error('\n💥 FATAL ERROR during validation:');
  console.error(error);
  process.exit(1);
});

