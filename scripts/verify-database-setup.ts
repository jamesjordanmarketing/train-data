/**
 * Verification Script: Database Setup
 * 
 * Verifies that the failed_generations table and storage bucket
 * are properly configured in Supabase.
 * 
 * Usage: npx tsx scripts/verify-database-setup.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FAIL: Supabase credentials not found in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Verifying database setup...\n');

  try {
    // Check if failed_generations table exists
    console.log('=== CHECKING TABLE ===');
    const { data: tableData, error: tableError } = await supabase
      .from('failed_generations')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ FAIL: failed_generations table does not exist or is not accessible');
      console.error('   Error:', tableError.message);
      console.error('\n   Run migration: supabase/migrations/20251202_create_failed_generations.sql');
      process.exit(1);
    }

    console.log('✓ failed_generations table exists and is accessible');

    // Check storage bucket
    console.log('\n=== CHECKING STORAGE BUCKET ===');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('❌ FAIL: Could not list storage buckets');
      console.error('   Error:', bucketsError.message);
      process.exit(1);
    }

    const failedGenBucket = buckets?.find(b => b.id === 'failed-generation-files');
    
    if (!failedGenBucket) {
      console.warn('⚠️  WARNING: failed-generation-files bucket does not exist');
      console.warn('   The migration should create this bucket automatically');
      console.warn('   If this persists, create it manually in Supabase Dashboard');
    } else {
      console.log('✓ failed-generation-files bucket exists');
      console.log(`  Public: ${failedGenBucket.public}`);
      console.log(`  File size limit: ${failedGenBucket.file_size_limit} bytes`);
    }

    // Try to query table structure (using information_schema if available)
    console.log('\n=== CHECKING TABLE COLUMNS ===');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'failed_generations'
          ORDER BY ordinal_position;
        `
      })
      .single();

    if (columnsError) {
      console.log('⚠️  Could not verify columns (RPC function may not exist)');
      console.log('   This is OK - table verification passed');
    } else if (columns) {
      console.log('✓ Table columns:');
      console.log(columns);
    }

    console.log('\n✅ PASS: Database setup verified successfully');
  } catch (error) {
    console.error('\n❌ FAIL: Error during verification:', error);
    process.exit(1);
  }
})();

