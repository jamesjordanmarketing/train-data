#!/usr/bin/env node

/**
 * Diagnose conversation generation issues
 * 
 * This script checks:
 * 1. What personas exist and are active
 * 2. What emotional arcs exist and are active
 * 3. What topics exist and are active
 * 4. What templates exist and for which arcs
 * 5. What combinations should work
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

async function diagnose() {
  console.log('🔍 Diagnosing Conversation Generation Issues\n');
  console.log('='.repeat(80));

  try {
    // 1. Get all personas
    console.log('\n📋 PERSONAS:\n');
    const { data: personas, error: personaError } = await supabase
      .from('personas')
      .select('persona_key, name, archetype, is_active')
      .order('name');

    if (personaError) {
      console.error('❌ Error fetching personas:', personaError.message);
      return;
    }

    personas.forEach(p => {
      const status = p.is_active ? '🟢' : '⚫';
      console.log(`${status} ${p.persona_key.padEnd(30)} | ${p.name} (${p.archetype})`);
    });
    console.log(`\nTotal: ${personas.length} personas (${personas.filter(p => p.is_active).length} active)`);

    // 2. Get all emotional arcs
    console.log('\n' + '='.repeat(80));
    console.log('\n🎭 EMOTIONAL ARCS:\n');
    const { data: arcs, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key, name, is_active, suitable_personas')
      .order('name');

    if (arcError) {
      console.error('❌ Error fetching arcs:', arcError.message);
      return;
    }

    arcs.forEach(arc => {
      const status = arc.is_active ? '🟢' : '⚫';
      const suitablePersonas = arc.suitable_personas ? `Suitable for: ${arc.suitable_personas.slice(0, 3).join(', ')}${arc.suitable_personas.length > 3 ? '...' : ''}` : 'No persona restrictions';
      console.log(`${status} ${arc.arc_key.padEnd(35)} | ${arc.name}`);
      console.log(`   ${suitablePersonas}`);
    });
    console.log(`\nTotal: ${arcs.length} arcs (${arcs.filter(a => a.is_active).length} active)`);

    // 3. Get all topics
    console.log('\n' + '='.repeat(80));
    console.log('\n📚 TRAINING TOPICS:\n');
    const { data: topics, error: topicError } = await supabase
      .from('training_topics')
      .select('topic_key, name, category, is_active, suitable_emotional_arcs')
      .order('name')
      .limit(20);

    if (topicError) {
      console.error('❌ Error fetching topics:', topicError.message);
      return;
    }

    topics.forEach(t => {
      const status = t.is_active ? '🟢' : '⚫';
      const suitableArcs = t.suitable_emotional_arcs ? `Suitable arcs: ${t.suitable_emotional_arcs.slice(0, 2).join(', ')}${t.suitable_emotional_arcs.length > 2 ? '...' : ''}` : 'No arc restrictions';
      console.log(`${status} ${t.topic_key.padEnd(40)} | ${t.name}`);
      console.log(`   Category: ${t.category} | ${suitableArcs}`);
    });
    console.log(`\nShowing first 20 of ${topics.length} topics`);

    // 4. Get all templates
    console.log('\n' + '='.repeat(80));
    console.log('\n📝 TEMPLATES:\n');
    const { data: templates, error: templateError } = await supabase
      .from('prompt_templates')
      .select('template_name, emotional_arc_type, tier, is_active, suitable_personas, suitable_topics')
      .order('emotional_arc_type');

    if (templateError) {
      console.error('❌ Error fetching templates:', templateError.message);
      return;
    }

    const templatesByArc = {};
    templates.forEach(t => {
      if (!templatesByArc[t.emotional_arc_type]) {
        templatesByArc[t.emotional_arc_type] = [];
      }
      templatesByArc[t.emotional_arc_type].push(t);
    });

    Object.keys(templatesByArc).sort().forEach(arcType => {
      const arcTemplates = templatesByArc[arcType];
      const activeCount = arcTemplates.filter(t => t.is_active).length;
      console.log(`\n${arcType}:`);
      arcTemplates.forEach(t => {
        const status = t.is_active ? '✅' : '❌';
        console.log(`  ${status} ${t.tier.padEnd(10)} | ${t.template_name}`);
        if (t.suitable_personas && t.suitable_personas.length > 0) {
          console.log(`     Personas: ${t.suitable_personas.join(', ')}`);
        }
        if (t.suitable_topics && t.suitable_topics.length > 0) {
          console.log(`     Topics: ${t.suitable_topics.slice(0, 3).join(', ')}${t.suitable_topics.length > 3 ? '...' : ''}`);
        }
      });
      console.log(`  Total: ${arcTemplates.length} templates (${activeCount} active)`);
    });

    // 5. Analyze valid combinations
    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 VALID COMBINATIONS ANALYSIS:\n');

    const activePersonas = personas.filter(p => p.is_active);
    const activeArcs = arcs.filter(a => a.is_active);
    const activeTopics = topics.filter(t => t.is_active);
    const activeTemplates = templates.filter(t => t.is_active);

    console.log(`Active Items:`);
    console.log(`  - ${activePersonas.length} personas`);
    console.log(`  - ${activeArcs.length} emotional arcs`);
    console.log(`  - ${activeTopics.length} training topics`);
    console.log(`  - ${activeTemplates.length} templates\n`);

    // Check which arcs have templates
    const arcsWithTemplates = activeArcs.filter(arc => {
      return activeTemplates.some(t => t.emotional_arc_type === arc.arc_key);
    });

    const arcsWithoutTemplates = activeArcs.filter(arc => {
      return !activeTemplates.some(t => t.emotional_arc_type === arc.arc_key);
    });

    console.log(`Arcs WITH templates (can generate):`);
    arcsWithTemplates.forEach(arc => {
      const templateCount = activeTemplates.filter(t => t.emotional_arc_type === arc.arc_key).length;
      console.log(`  ✅ ${arc.name} (${arc.arc_key}) - ${templateCount} template(s)`);
    });

    if (arcsWithoutTemplates.length > 0) {
      console.log(`\n⚠️  Arcs WITHOUT templates (will fail):`);
      arcsWithoutTemplates.forEach(arc => {
        console.log(`  ❌ ${arc.name} (${arc.arc_key})`);
      });
    }

    // 6. Generate sample valid combinations
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ SAMPLE VALID COMBINATIONS:\n');

    let exampleCount = 0;
    for (const arc of arcsWithTemplates.slice(0, 3)) {
      const arcTemplates = activeTemplates.filter(t => t.emotional_arc_type === arc.arc_key);
      const template = arcTemplates[0];

      // Find suitable personas
      let suitablePersonas = activePersonas;
      if (template.suitable_personas && template.suitable_personas.length > 0) {
        suitablePersonas = activePersonas.filter(p => template.suitable_personas.includes(p.persona_key));
      }

      // Find suitable topics
      let suitableTopics = activeTopics;
      if (template.suitable_topics && template.suitable_topics.length > 0) {
        suitableTopics = activeTopics.filter(t => template.suitable_topics.includes(t.topic_key));
      }

      if (suitablePersonas.length > 0 && suitableTopics.length > 0) {
        console.log(`Example ${++exampleCount}:`);
        console.log(`  Arc: ${arc.name}`);
        console.log(`  Persona: ${suitablePersonas[0].name}`);
        console.log(`  Topic: ${suitableTopics[0].name}`);
        console.log(``);
      }
    }

    // 7. Write comprehensive report
    console.log('='.repeat(80));
    console.log('\n💾 Writing comprehensive report...\n');

    const report = generateReport({
      personas: activePersonas,
      arcs: activeArcs,
      topics: activeTopics,
      templates: activeTemplates,
      arcsWithTemplates,
      arcsWithoutTemplates,
      templatesByArc
    });

    const reportPath = path.resolve(__dirname, '../pmc/product/_mapping/unique/cat-to-conv-P01/06-cat-to-conv-fixing-bugs_v3.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`✅ Report written to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

function generateReport(data) {
  const { personas, arcs, topics, templates, arcsWithTemplates, arcsWithoutTemplates, templatesByArc } = data;

  return `# Conversation Generation Debugging Guide
**Date:** ${new Date().toISOString().split('T')[0]}
**Status:** Diagnostic Complete

---

## Overview

This document provides a comprehensive guide to successfully generating conversations in the Bright Run LoRA Training Data Platform.

## Current System State

### Active Components

- **Personas:** ${personas.length} active
- **Emotional Arcs:** ${arcs.length} active (${arcsWithTemplates.length} with templates)
- **Training Topics:** ${topics.length} active
- **Templates:** ${templates.length} active

---

## ✅ Emotional Arcs That WORK (Have Templates)

${arcsWithTemplates.map(arc => {
  const arcTemplates = templates.filter(t => t.emotional_arc_type === arc.arc_key);
  return `### ${arc.name} (\`${arc.arc_key}\`)
**Status:** ✅ Ready to use
**Templates:** ${arcTemplates.length}
${arcTemplates.map(t => `- ${t.tier}: ${t.template_name}${t.is_active ? '' : ' (INACTIVE)'}`).join('\n')}
`;
}).join('\n')}

---

## ❌ Emotional Arcs That FAIL (No Templates)

${arcsWithoutTemplates.length > 0 ? arcsWithoutTemplates.map(arc => `### ${arc.name} (\`${arc.arc_key}\`)
**Status:** ❌ Will fail - no templates exist
**Action:** Disable this arc or create a template for it
`).join('\n') : 'None - all active arcs have templates'}

---

## 📋 Available Personas

${personas.slice(0, 10).map((p, i) => `${i + 1}. **${p.name}** (\`${p.persona_key}\`)
   - Archetype: ${p.archetype}`).join('\n')}

${personas.length > 10 ? `\n...and ${personas.length - 10} more personas\n` : ''}

---

## 📚 Available Training Topics (Sample)

${topics.slice(0, 15).map((t, i) => `${i + 1}. **${t.name}** (\`${t.topic_key}\`)
   - Category: ${t.category}
   ${t.suitable_emotional_arcs ? `- Suitable arcs: ${t.suitable_emotional_arcs.join(', ')}` : ''}`).join('\n')}

${topics.length > 15 ? `\n...and ${topics.length - 15} more topics\n` : ''}

---

## ✅ VALID COMBINATIONS (Guaranteed to Work)

These combinations are guaranteed to have templates and should generate successfully:

${generateValidCombinations(personas, arcsWithTemplates, topics, templates).slice(0, 10).map((combo, i) => `### Combination ${i + 1}
- **Persona:** ${combo.persona.name}
- **Emotional Arc:** ${combo.arc.name}
- **Topic:** ${combo.topic.name}
- **Template:** ${combo.template.tier} (${combo.template.template_name})
`).join('\n')}

---

## 🐛 Known Issues

### Issue 1: Select.Item Empty Value Error

**Error Message:**
\`\`\`
A <Select.Item /> must have a value prop that is not an empty string.
\`\`\`

**Cause:** One of the dropdowns has an empty string value in a Select.Item component.

**Location:** Likely in \`src/app/(dashboard)/conversations/generate/page.tsx\` or similar component.

**Fix:** Ensure all Select.Item components have non-empty value props.

### Issue 2: "No Templates Found" Warning

**Error Message:**
\`\`\`
No Templates found for this combination. Try adjusting your selections
\`\`\`

**Cause:** The selected emotional arc does not have a matching template in the database.

**Current Affected Arcs:**
${arcsWithoutTemplates.map(arc => `- ${arc.name} (\`${arc.arc_key}\`)`).join('\n') || 'None'}

**Fix:** Only use arcs listed in the "WORK" section above.

### Issue 3: Template Lookup Failing

**Error Message:**
\`\`\`
No templates found for arc: shame_to_acceptance, tier: template
\`\`\`

**Cause:** Template lookup is using \`shame_to_acceptance\` but the database might have it stored differently, or the template is inactive.

**Current Status:**
${templatesByArc['shame_to_acceptance'] ? `
- Template exists: ${templatesByArc['shame_to_acceptance'][0].template_name}
- Is active: ${templatesByArc['shame_to_acceptance'][0].is_active ? 'YES' : 'NO ⚠️'}
- Tier: ${templatesByArc['shame_to_acceptance'][0].tier}
` : '- ❌ No template found for shame_to_acceptance'}

---

## 🔧 Troubleshooting Steps

### Step 1: Verify Database State

Run this query in Supabase SQL Editor:

\`\`\`sql
-- Check templates
SELECT emotional_arc_type, template_name, tier, is_active
FROM prompt_templates
WHERE is_active = true
ORDER BY emotional_arc_type;

-- Check arcs
SELECT arc_key, name, is_active
FROM emotional_arcs
WHERE is_active = true
ORDER BY name;
\`\`\`

### Step 2: Test API Endpoints

Test the template selection API:

\`\`\`bash
curl -X POST https://train-data-three.vercel.app/api/templates/select \\
  -H "Content-Type: application/json" \\
  -d '{
    "emotional_arc_key": "confusion_to_clarity",
    "tier": "template"
  }'
\`\`\`

### Step 3: Check Component Values

Inspect the select dropdowns in the UI to ensure:
1. All options have valid, non-empty value props
2. Selected values match database keys exactly
3. No placeholder values are being submitted

---

## 🎯 How to Successfully Generate a Conversation

### Quick Success Path

1. **Go to:** https://train-data-three.vercel.app/conversations/generate

2. **Select from these WORKING arcs:**
${arcsWithTemplates.map(arc => `   - ${arc.name}`).join('\n')}

3. **Select any active persona** (${personas.length} available)

4. **Select any active topic** (${topics.length} available)

5. **Click "Generate Conversation"**

### Expected Result

- System finds matching template
- Calls Claude API with template + parameters
- Generates conversation JSON
- Uploads to Supabase Storage
- Saves metadata to database
- Redirects to conversation detail page

### If It Fails

Check Vercel logs for specific error:
- "No templates found" = Arc doesn't have template (see list above)
- "Empty string value" = UI component issue (needs code fix)
- "Rate limit" = Claude API limit hit (wait or increase limit)
- "Invalid parameters" = Missing persona/arc/topic data

---

## 📊 Database Statistics

\`\`\`
Total Personas:        ${personas.length}
Total Arcs:            ${arcs.length}
  - With Templates:    ${arcsWithTemplates.length}
  - Without Templates: ${arcsWithoutTemplates.length}
Total Topics:          ${topics.length}
Total Templates:       ${templates.length}

Possible Combinations: ${personas.length} × ${arcsWithTemplates.length} × ${topics.length} = ${personas.length * arcsWithTemplates.length * topics.length}
\`\`\`

---

## 🚀 Next Steps

1. **Fix UI Issue:** Check Select components for empty value props
2. **Fix Template Lookup:** Verify template lookup logic matches database keys
3. **Test Valid Combinations:** Use combinations from "VALID COMBINATIONS" section above
4. **Monitor Logs:** Check Vercel logs for specific errors during generation

---

*Generated: ${new Date().toISOString()}*
`;
}

function generateValidCombinations(personas, arcs, topics, templates) {
  const combinations = [];

  for (const arc of arcs) {
    const arcTemplates = templates.filter(t => t.emotional_arc_type === arc.arc_key && t.is_active);
    if (arcTemplates.length === 0) continue;

    const template = arcTemplates[0];

    // Find suitable personas
    let suitablePersonas = personas;
    if (template.suitable_personas && template.suitable_personas.length > 0) {
      suitablePersonas = personas.filter(p => template.suitable_personas.includes(p.persona_key));
    }

    // Find suitable topics
    let suitableTopics = topics;
    if (template.suitable_topics && template.suitable_topics.length > 0) {
      suitableTopics = topics.filter(t => template.suitable_topics.includes(t.topic_key));
    }

    // Generate combinations
    for (let i = 0; i < Math.min(2, suitablePersonas.length); i++) {
      for (let j = 0; j < Math.min(2, suitableTopics.length); j++) {
        combinations.push({
          persona: suitablePersonas[i],
          arc: arc,
          topic: suitableTopics[j],
          template: template
        });
      }
    }
  }

  return combinations;
}

diagnose();
