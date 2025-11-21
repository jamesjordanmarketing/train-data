#!/usr/bin/env node

/**
 * Fix emotional arc and template mismatches
 * 
 * Issues to fix:
 * 1. Template "anxiety_to_confidence" exists but arc is "fear_to_confidence"
 * 2. Arc "frustration_to_relief" has no template (should be disabled)
 * 3. Templates for "emergency_to_calm" and "grief_to_healing" exist but no matching arcs (check if they're being used)
 */

const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function fixMismatches() {
  console.log('🔧 Fixing emotional arc and template mismatches...\n');

  try {
    // Fix 1: Update template anxiety_to_confidence to fear_to_confidence
    console.log('1️⃣  Updating template anxiety_to_confidence → fear_to_confidence...');
    const { error: updateError } = await supabase
      .from('prompt_templates')
      .update({ emotional_arc_type: 'fear_to_confidence' })
      .eq('emotional_arc_type', 'anxiety_to_confidence');

    if (updateError) {
      console.error('   ❌ Error:', updateError.message);
    } else {
      console.log('   ✅ Updated successfully');
    }

    // Fix 2: Disable frustration_to_relief arc (no template)
    console.log('\n2️⃣  Disabling frustration_to_relief arc (no template)...');
    const { error: disableError } = await supabase
      .from('emotional_arcs')
      .update({ is_active: false })
      .eq('arc_key', 'frustration_to_relief');

    if (disableError) {
      console.error('   ❌ Error:', disableError.message);
    } else {
      console.log('   ✅ Disabled successfully');
    }

    // Check for orphaned templates
    console.log('\n3️⃣  Checking for orphaned templates...');
    const { data: templates, error: templateError } = await supabase
      .from('prompt_templates')
      .select('emotional_arc_type, template_name');

    if (templateError) {
      console.error('   ❌ Error:', templateError.message);
      return;
    }

    const { data: arcs, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key');

    if (arcError) {
      console.error('   ❌ Error:', arcError.message);
      return;
    }

    const arcKeys = new Set(arcs.map(a => a.arc_key));
    const orphanedTemplates = templates.filter(t => !arcKeys.has(t.emotional_arc_type));

    if (orphanedTemplates.length > 0) {
      console.log('   ⚠️  Found orphaned templates (templates without matching arcs):');
      orphanedTemplates.forEach(t => {
        console.log(`      - ${t.emotional_arc_type}: ${t.template_name}`);
      });
      console.log('   ℹ️  These templates will not be selectable in the UI.');
      console.log('   ℹ️  Consider either:');
      console.log('      a) Creating matching emotional arcs for them');
      console.log('      b) Removing these templates if not needed');
    } else {
      console.log('   ✅ No orphaned templates found');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✨ Fix complete! Running coverage check...\n');

    // Re-run coverage check
    const { data: finalArcs, error: finalArcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key, name, is_active')
      .order('name');

    const { data: finalTemplates, error: finalTemplateError } = await supabase
      .from('prompt_templates')
      .select('emotional_arc_type');

    if (finalArcError || finalTemplateError) {
      console.error('Error in final check');
      return;
    }

    const templateMap = {};
    finalTemplates.forEach(t => {
      if (!templateMap[t.emotional_arc_type]) {
        templateMap[t.emotional_arc_type] = [];
      }
      templateMap[t.emotional_arc_type].push(t);
    });

    console.log('Final Coverage:\n');
    let activeWithTemplates = 0;
    let activeWithoutTemplates = 0;

    finalArcs.forEach(arc => {
      const hasTemplates = templateMap[arc.arc_key] && templateMap[arc.arc_key].length > 0;
      const status = arc.is_active ? '🟢' : '⚫';
      const coverage = hasTemplates ? `✅ ${templateMap[arc.arc_key].length} template(s)` : '❌ NO TEMPLATES';

      console.log(`${status} | ${coverage.padEnd(20)} | ${arc.name} (${arc.arc_key})`);

      if (arc.is_active && hasTemplates) activeWithTemplates++;
      if (arc.is_active && !hasTemplates) activeWithoutTemplates++;
    });

    console.log('\nSummary:');
    console.log(`  ✅ Active arcs with templates: ${activeWithTemplates}`);
    console.log(`  ⚠️  Active arcs WITHOUT templates: ${activeWithoutTemplates}`);
    console.log(`  ⚫ Inactive arcs: ${finalArcs.length - activeWithTemplates - activeWithoutTemplates}`);

    if (activeWithoutTemplates === 0) {
      console.log('\n🎉 SUCCESS! All active arcs now have templates!');
      console.log('   Your production app should now work correctly.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixMismatches();
