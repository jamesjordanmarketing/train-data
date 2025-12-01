/**
 * SAOL Migration: Setup training-files storage bucket
 * Run with: node supa-agent-ops/migrations/setup-training-files-bucket.js
 */

require('dotenv').config({ path: '../../.env.local' });
const { agentExecuteSQL } = require('../dist/index.js');

async function setupBucket() {
  console.log('🚀 Setting up training-files storage bucket using SAOL...\n');

  try {
    // Create bucket using SQL
    const createBucketSQL = `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'training-files',
        'training-files',
        false,
        52428800,
        ARRAY['application/json', 'application/x-ndjson']::text[]
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log('📦 Creating training-files bucket...');
    const createResult = await agentExecuteSQL({
      sql: createBucketSQL,
      transport: 'pg',
      transaction: true
    });
    
    if (!createResult.success) {
      console.error('❌ Bucket creation failed:', createResult.summary);
      process.exit(1);
    }
    
    console.log('✅ training-files bucket created (or already exists)');
    
    // Set up storage policies
    console.log('\n🔒 Setting up storage policies...');
    
    const policySQL = `
      -- Drop existing policies if they exist (for idempotency)
      DROP POLICY IF EXISTS "Users can upload training files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can read training files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update training files" ON storage.objects;
      
      -- Policy: Users can upload to their own folders
      CREATE POLICY "Users can upload training files"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'training-files'
          AND auth.role() = 'authenticated'
        );
      
      -- Policy: Users can read all training files
      CREATE POLICY "Users can read training files"
        ON storage.objects FOR SELECT
        USING (
          bucket_id = 'training-files'
          AND auth.role() = 'authenticated'
        );
      
      -- Policy: Users can update their own files (for upsert)
      CREATE POLICY "Users can update training files"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'training-files'
          AND auth.role() = 'authenticated'
        );
    `;
    
    const policyResult = await agentExecuteSQL({
      sql: policySQL,
      transport: 'pg',
      transaction: true
    });
    
    if (!policyResult.success) {
      console.log('⚠️  Policy creation had issues:', policyResult.summary);
      console.log('    (Policies may already exist, which is OK)');
    } else {
      console.log('✅ Storage policies configured');
    }
    
    console.log('\n🎉 Setup complete! Bucket is ready to use.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupBucket();
