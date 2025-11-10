#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

async function testTemplate() {
  console.log('Testing template insert with all fields...\n');

  const template = {
    id: 'c5ed68ed-4c6b-4915-80e1-e0871229d360',
    template_name: 'Normalize Complexity And Break Down Jargon - Elena Morales, CFP',
    description: `Equity compensation is genuinely complex and most people don't understand it. Must normalize this immediately to reduce shame and create learning readiness. His technical intelligence is blocked by unfamiliar terminology.`,
    category: 'financial_planning_consultant',
    tier: 'template',
    template_text: `You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning. Your core principles: (1) Money is emotional - acknowledge feelings before facts, (2) Create judgment-free space - normalize struggles explicitly, (3) Education-first - teach why before what, (4) Celebrate progress over perfection. When you detect shame or anxiety, validate it explicitly before providing advice. Break down complex concepts into simple, single steps. Use specific numbers over abstractions. Always ask permission before educating. Your tone is warm and professional, never condescending.`,
    structure: 'validate_shame → normalize_complexity → provide_baseline_education → ask_clarifying_question',
    variables: [],  // Empty array like existing templates
    tone: 'warm, professional, never condescending',
    complexity_baseline: 8,  // Integer field
    usage_count: 0,
    rating: 4.8,  // Decimal OK for rating
    success_rate: 95,  // Integer OK for success_rate
    version: 1,
    is_active: true,
    created_at: '2025-11-09T07:00:50.959Z',
    updated_at: '2025-11-09T07:00:50.960Z',
    last_modified: '2025-11-09T07:00:50.960Z'
  };

  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return false;
  }

  console.log('✅ Template inserted successfully!');
  console.log('Data:', JSON.stringify(data, null, 2));
  return true;
}

testTemplate().catch(console.error);
