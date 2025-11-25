#!/usr/bin/env node

/**
 * Reduce Active Training Topics from 65 to 20
 * 
 * Maintains balanced category representation by selecting topics
 * proportionally from each category. Deactivated topics are preserved
 * (is_active = false) for potential future use.
 * 
 * Usage: node src/scripts/reduce-topics-to-20.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually (same pattern as other scripts)
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

// Target number of topics per category (total = 20)
const TOPICS_PER_CATEGORY = {
  career: 2,
  cash_flow: 2,
  debt: 2,
  education: 2,
  estate: 1,
  family: 2,
  insurance: 2,
  investment: 2,
  organization: 1,
  relationships: 1,
  retirement: 2,
  tax: 1
};

// Fisher-Yates shuffle for random selection
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function main() {
  console.log('🎯 Reducing Training Topics from 65 to 20\n');
  console.log('='.repeat(50));

  // Query all active topics
  console.log('\n🔍 Fetching all active topics...');
  const { data: allTopics, error: fetchError } = await client
    .from('training_topics')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (fetchError) {
    console.error('❌ Failed to fetch topics:', fetchError.message);
    process.exit(1);
  }

  console.log(`✅ Found ${allTopics.length} active topics`);

  // Group by category
  const byCategory = {};
  for (const topic of allTopics) {
    if (!byCategory[topic.category]) {
      byCategory[topic.category] = [];
    }
    byCategory[topic.category].push(topic);
  }

  console.log('\n📊 Current Distribution:');
  Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, topics]) => {
      const target = TOPICS_PER_CATEGORY[category] || 0;
      console.log(`   ${category}: ${topics.length} → ${target}`);
    });

  // Select topics per category
  const selectedTopics = [];
  const deactivatedTopics = [];

  console.log('\n🎲 Selecting topics...');
  
  for (const [category, targetCount] of Object.entries(TOPICS_PER_CATEGORY)) {
    const categoryTopics = byCategory[category] || [];
    
    if (categoryTopics.length === 0) {
      console.log(`   ⚠️  ${category}: No topics available (target: ${targetCount})`);
      continue;
    }

    // Shuffle and select
    const shuffled = shuffleArray(categoryTopics);
    const selected = shuffled.slice(0, targetCount);
    const notSelected = shuffled.slice(targetCount);

    selectedTopics.push(...selected);
    deactivatedTopics.push(...notSelected);

    console.log(`   📁 ${category}: Selected ${selected.length}/${categoryTopics.length}`);
    selected.forEach(t => console.log(`      ✓ ${t.name}`));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📋 Selection Summary:`);
  console.log(`   - Topics to KEEP active: ${selectedTopics.length}`);
  console.log(`   - Topics to DEACTIVATE: ${deactivatedTopics.length}`);
  console.log('='.repeat(50));

  // Deactivate topics in batch
  console.log('\n⏳ Deactivating topics...');
  
  const deactivateIds = deactivatedTopics.map(t => t.id);
  
  const { error: deactivateError } = await client
    .from('training_topics')
    .update({ is_active: false })
    .in('id', deactivateIds);

  if (deactivateError) {
    console.error('❌ Error deactivating topics:', deactivateError.message);
    process.exit(1);
  }

  console.log(`✅ Deactivated ${deactivatedTopics.length} topics`);

  // Save selected topics to JSON
  const outputPath = path.join(__dirname, 'selected-topics-20.json');
  const outputData = selectedTopics.map(t => ({
    id: t.id,
    topic_key: t.topic_key,
    name: t.name,
    category: t.category,
    description: t.description,
    complexity_level: t.complexity_level
  }));

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n📄 Saved selected topics to: ${outputPath}`);

  // Final verification
  console.log('\n' + '='.repeat(50));
  console.log('📊 Final Verification');
  console.log('='.repeat(50));

  const { data: verifyTopics, error: verifyError } = await client
    .from('training_topics')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (verifyError) {
    console.error('❌ Error verifying topics:', verifyError.message);
    process.exit(1);
  }

  console.log(`\n✅ Active Topics: ${verifyTopics.length}`);

  // Group by category for display
  const finalByCategory = {};
  for (const topic of verifyTopics) {
    if (!finalByCategory[topic.category]) {
      finalByCategory[topic.category] = [];
    }
    finalByCategory[topic.category].push(topic);
  }

  console.log('\n📋 Final Distribution by Category:');
  Object.entries(finalByCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, topics]) => {
      console.log(`\n   ${category.toUpperCase()} (${topics.length}):`);
      topics.forEach(t => console.log(`      - ${t.name}`));
    });

  // Verify deactivated count
  const { count: deactivatedCount, error: countError } = await client
    .from('training_topics')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);

  if (!countError) {
    console.log(`\n📦 Deactivated Topics (preserved): ${deactivatedCount}`);
  }

  console.log('\n✅ Topic reduction complete!');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
