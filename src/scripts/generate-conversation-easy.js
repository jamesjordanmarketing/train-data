#!/usr/bin/env node

/**
 * Easy Conversation Generator
 *
 * Usage: node src/scripts/generate-conversation-easy.js
 *
 * This script will:
 * 1. List available templates
 * 2. Let you choose one
 * 3. Ask for parameters (persona, emotion, topic)
 * 4. Generate the conversation
 * 5. Show you the result
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;
  const [key, ...valueParts] = trimmedLine.split('=');
  const value = valueParts.join('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listTemplates() {
  console.log('\n📋 Fetching available templates...\n');

  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, template_name, tier, description')
    .eq('is_active', true)
    .order('template_name');

  if (error) {
    console.error('❌ Error fetching templates:', error.message);
    return [];
  }

  if (!templates || templates.length === 0) {
    console.log('⚠️  No templates found in database.');
    return [];
  }

  console.log('Available Templates:');
  console.log('='.repeat(80));
  templates.forEach((t, i) => {
    console.log(`${i + 1}. ${t.template_name}`);
    console.log(`   ID: ${t.id}`);
    console.log(`   Tier: ${t.tier}`);
    if (t.description) {
      console.log(`   Description: ${t.description}`);
    }
    console.log('');
  });
  console.log('='.repeat(80));

  return templates;
}

async function generateConversation(request) {
  console.log('\n🚀 Generating conversation...\n');
  console.log('Parameters:');
  console.log('  Template:', request.templateId);
  console.log('  Persona:', request.parameters.persona);
  console.log('  Emotion:', request.parameters.emotion);
  console.log('  Topic:', request.parameters.topic);
  console.log('  Temperature:', request.temperature);
  console.log('\nThis will take 15-60 seconds...\n');

  const API_URL = 'https://train-data-three.vercel.app/api/conversations/generate';
  const url = new URL(API_URL);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(request))
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          reject(new Error('Failed to parse response: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(request));
    req.end();
  });
}

async function main() {
  console.log('═'.repeat(80));
  console.log('  Easy Conversation Generator');
  console.log('═'.repeat(80));

  // Step 1: List templates
  const templates = await listTemplates();

  if (templates.length === 0) {
    console.log('\n❌ Cannot proceed without templates.');
    rl.close();
    return;
  }

  // Step 2: Choose template
  const templateChoice = await question('\nEnter template number (or "q" to quit): ');

  if (templateChoice.toLowerCase() === 'q') {
    console.log('\nExiting...\n');
    rl.close();
    return;
  }

  const templateIndex = parseInt(templateChoice) - 1;

  if (isNaN(templateIndex) || templateIndex < 0 || templateIndex >= templates.length) {
    console.log('\n❌ Invalid template number.');
    rl.close();
    return;
  }

  const selectedTemplate = templates[templateIndex];
  console.log(`\n✅ Selected: ${selectedTemplate.template_name}\n`);

  // Step 3: Get parameters
  console.log('Enter conversation parameters:\n');

  const persona = await question('Persona (e.g., "Sales Manager"): ');
  if (!persona.trim()) {
    console.log('\n❌ Persona is required.');
    rl.close();
    return;
  }

  const emotion = await question('Emotion (e.g., "Frustrated"): ');
  if (!emotion.trim()) {
    console.log('\n❌ Emotion is required.');
    rl.close();
    return;
  }

  const topic = await question('Topic (e.g., "Contract Renewal"): ');
  if (!topic.trim()) {
    console.log('\n❌ Topic is required.');
    rl.close();
    return;
  }

  const temperatureInput = await question('Temperature (0-1, press Enter for 0.7): ');
  const temperature = temperatureInput.trim() ? parseFloat(temperatureInput) : 0.7;

  if (isNaN(temperature) || temperature < 0 || temperature > 1) {
    console.log('\n❌ Temperature must be between 0 and 1.');
    rl.close();
    return;
  }

  // Step 4: Generate
  const request = {
    templateId: selectedTemplate.id,
    parameters: {
      persona: persona.trim(),
      emotion: emotion.trim(),
      topic: topic.trim()
    },
    tier: selectedTemplate.tier,
    temperature: temperature,
    maxTokens: 2000
  };

  try {
    const result = await generateConversation(request);

    if (result.status === 201 && result.data.success) {
      console.log('═'.repeat(80));
      console.log('  ✅ SUCCESS!');
      console.log('═'.repeat(80));
      console.log('\nConversation Details:');
      console.log('  ID:', result.data.conversation.id);
      console.log('  Title:', result.data.conversation.title);
      console.log('  Turns:', result.data.conversation.totalTurns);
      console.log('  Tokens:', result.data.conversation.totalTokens);
      console.log('  Quality Score:', result.data.conversation.qualityScore + '/10');
      console.log('  Status:', result.data.conversation.status);
      console.log('  Cost: $' + result.data.cost.toFixed(4));
      console.log('\n📊 View in dashboard:');
      console.log('  https://train-data-three.vercel.app/conversations');
      console.log('\n💡 Tip: Sort by "Updated" to see your new conversation at the top!\n');
      console.log('═'.repeat(80));
    } else {
      console.log('\n❌ Generation failed:');
      console.log('  Status:', result.status);
      console.log('  Error:', result.data.error || 'Unknown error');
      if (result.data.details) {
        console.log('  Details:', result.data.details);
      }
    }
  } catch (error) {
    console.log('\n❌ Error during generation:', error.message);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  rl.close();
  process.exit(1);
});
