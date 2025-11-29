/**
 * Download JSON Files from Supabase Storage
 * 
 * This script downloads the raw and enriched JSON files from Supabase storage
 * to examine their actual structure.
 */

require('../load-env.js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function downloadFiles() {
  console.log('='.repeat(80));
  console.log('DOWNLOADING JSON FILES FROM SUPABASE STORAGE');
  console.log('='.repeat(80));
  console.log('');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'pmc', '_archive', 'investigation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download the most recent conversation's raw JSON
  console.log('STEP 1: DOWNLOADING RECENT RAW JSON');
  console.log('-'.repeat(80));
  
  // Use the file path from previous investigation
  const rawPath = '00000000-0000-0000-0000-000000000000/c8cf8756-4bb5-43eb-93e4-2ad00764126a/conversation.json';
  
  console.log(`\nDownloading: ${rawPath}`);
  
  try {
    const { data, error } = await supabase.storage
      .from('conversation-files')
      .download(rawPath);
    
    if (error) {
      console.error('❌ Error downloading raw file:', error.message);
    } else if (data) {
      const content = await data.text();
      const outputPath = path.join(outputDir, 'recent-raw.json');
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`✓ Downloaded to: ${outputPath}`);
      console.log(`   Size: ${content.length} bytes`);
      
      // Parse and analyze
      try {
        const json = JSON.parse(content);
        console.log('\n📋 Raw JSON Analysis:');
        console.log(`   Has conversation_metadata: ${!!json.conversation_metadata}`);
        console.log(`   Has input_parameters: ${!!json.input_parameters}`);
        console.log(`   Number of turns: ${json.turns ? json.turns.length : 0}`);
        
        if (json.input_parameters) {
          console.log('\n✓ input_parameters found:');
          console.log(JSON.stringify(json.input_parameters, null, 2));
        } else {
          console.log('\n❌ NO input_parameters in raw JSON');
        }
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Try to find and download the CSV test files
  console.log('\n\nSTEP 2: CHECKING TEST CSV FILES');
  console.log('-'.repeat(80));
  
  const testRawPath = path.join(process.cwd(), 'pmc', '_archive', 'batch-json-raw-test_v1.csv');
  const testEnrichedPath = path.join(process.cwd(), 'pmc', '_archive', 'batch-json-enriched-test_v1.csv');
  
  console.log('\n📋 Test files location:');
  console.log(`   Raw: ${testRawPath}`);
  console.log(`   Exists: ${fs.existsSync(testRawPath)}`);
  console.log(`   Enriched: ${testEnrichedPath}`);
  console.log(`   Exists: ${fs.existsSync(testEnrichedPath)}`);
  
  if (fs.existsSync(testRawPath)) {
    const rawContent = fs.readFileSync(testRawPath, 'utf8');
    const rawJson = JSON.parse(rawContent);
    
    console.log('\n📋 Test Raw JSON:');
    console.log(`   client_persona: ${rawJson.conversation_metadata?.client_persona || 'N/A'}`);
    console.log(`   Has input_parameters: ${!!rawJson.input_parameters}`);
  }
  
  if (fs.existsSync(testEnrichedPath)) {
    const enrichedContent = fs.readFileSync(testEnrichedPath, 'utf8');
    const enrichedJson = JSON.parse(enrichedContent);
    
    console.log('\n📋 Test Enriched JSON:');
    console.log(`   Has input_parameters: ${!!enrichedJson.input_parameters}`);
    
    if (enrichedJson.training_pairs && enrichedJson.training_pairs.length > 0) {
      const metadata = enrichedJson.training_pairs[0].conversation_metadata;
      console.log(`   First pair has persona_archetype: ${!!metadata.persona_archetype}`);
      console.log(`   First pair has emotional_arc: ${!!metadata.emotional_arc}`);
      console.log(`   First pair has training_topic: ${!!metadata.training_topic}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('DOWNLOAD COMPLETE');
  console.log('='.repeat(80));
}

downloadFiles()
  .then(() => {
    console.log('\n✅ Download completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Download failed:', error);
    process.exit(1);
  });

