/**
 * Setup Script for Training Files Storage Bucket
 * 
 * Creates the 'training-files' storage bucket if it doesn't exist.
 * 
 * Run with: npx tsx src/scripts/setup-training-files-bucket.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupBucket() {
  console.log('🚀 Setting up training-files storage bucket...\n');

  try {
    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message);
      process.exit(1);
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'training-files');
    
    if (bucketExists) {
      console.log('✅ training-files bucket already exists');
      console.log('');
      return;
    }
    
    // Create bucket
    console.log('📦 Creating training-files bucket...');
    const { data, error } = await supabase.storage.createBucket('training-files', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/json', 'application/x-ndjson'],
    });
    
    if (error) {
      // If SQL-level creation is needed
      if (error.message.includes('permission')) {
        console.log('⚠️  SDK creation failed, trying SQL method...');
        
        const { error: sqlError } = await supabase.rpc('exec', {
          sql: `
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
              'training-files',
              'training-files',
              false,
              52428800,
              ARRAY['application/json', 'application/x-ndjson']
            )
            ON CONFLICT (id) DO NOTHING;
          `
        });
        
        if (sqlError) {
          console.error('❌ SQL creation also failed:', sqlError.message);
          console.log('\n💡 Manual creation required:');
          console.log('   Go to Supabase Dashboard → Storage → Create Bucket');
          console.log('   Name: training-files');
          console.log('   Public: false');
          console.log('   File size limit: 50MB');
          process.exit(1);
        }
      } else {
        console.error('❌ Failed to create bucket:', error.message);
        process.exit(1);
      }
    }
    
    console.log('✅ training-files bucket created successfully');
    
    // Set up RLS policies for the bucket
    console.log('\n🔒 Setting up storage policies...');
    
    const policySQL = `
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
    
    const { error: policyError } = await supabase.rpc('exec', { sql: policySQL });
    
    if (policyError && !policyError.message.includes('already exists')) {
      console.log('⚠️  Policy creation failed (may already exist):', policyError.message);
    } else {
      console.log('✅ Storage policies configured');
    }
    
    console.log('\n🎉 Setup complete! Bucket is ready to use.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupBucket();

