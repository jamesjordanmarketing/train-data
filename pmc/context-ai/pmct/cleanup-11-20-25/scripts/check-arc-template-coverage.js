#!/usr/bin/env node

/**
 * Check which emotional arcs have templates and which don't
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
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

async function checkCoverage() {
  console.log('🔍 Checking emotional arc and template coverage...\n');

  try {
    // Get all emotional arcs
    const { data: arcs, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key, name, is_active')
      .order('name');

    if (arcError) {
      console.error('❌ Error fetching arcs:', arcError.message);
      return;
    }

    // Get all templates
    const { data: templates, error: templateError } = await supabase
      .from('prompt_templates')
      .select('emotional_arc_type, template_name, is_active');

    if (templateError) {
      console.error('❌ Error fetching templates:', templateError.message);
      return;
    }

    // Build template map
    const templateMap = {};
    templates.forEach(t => {
      if (!templateMap[t.emotional_arc_type]) {
        templateMap[t.emotional_arc_type] = [];
      }
      templateMap[t.emotional_arc_type].push(t);
    });

    // Check each arc
    console.log('Emotional Arc Coverage:\n');
    console.log('=' .repeat(80));

    let activeWithTemplates = 0;
    let activeWithoutTemplates = 0;
    let inactiveArcs = 0;

    arcs.forEach(arc => {
      const hasTemplates = templateMap[arc.arc_key] && templateMap[arc.arc_key].length > 0;
      const status = arc.is_active ? '🟢 ACTIVE' : '⚫ INACTIVE';
      const coverage = hasTemplates ? `✅ ${templateMap[arc.arc_key].length} template(s)` : '❌ NO TEMPLATES';

      console.log(`${status} | ${coverage.padEnd(20)} | ${arc.name} (${arc.arc_key})`);

      if (arc.is_active && hasTemplates) activeWithTemplates++;
      if (arc.is_active && !hasTemplates) activeWithoutTemplates++;
      if (!arc.is_active) inactiveArcs++;
    });

    console.log('=' .repeat(80));
    console.log('\nSummary:');
    console.log(`  ✅ Active arcs with templates: ${activeWithTemplates}`);
    console.log(`  ⚠️  Active arcs WITHOUT templates: ${activeWithoutTemplates}`);
    console.log(`  ⚫ Inactive arcs: ${inactiveArcs}`);
    console.log(`  📊 Total arcs: ${arcs.length}`);

    if (activeWithoutTemplates > 0) {
      console.log('\n⚠️  WARNING: Some active arcs have no templates!');
      console.log('   These arcs will cause errors if selected in the UI.');
      console.log('   Consider either:');
      console.log('     1. Creating templates for them');
      console.log('     2. Setting them to inactive');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCoverage();
