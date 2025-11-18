/**
 * Run Database Migration
 * Simple script to execute a SQL migration file
 */

import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function runMigration() {
  console.log('Running migration: 20251117_add_raw_response_storage_columns.sql\n');
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.error('   This migration requires service role key for ALTER TABLE operations');
    process.exit(1);
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251117_add_raw_response_storage_columns.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log('Executing migration SQL...\n');
  
  // Execute the SQL
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // If exec_sql RPC doesn't exist, try direct execution
      if (error.message.includes('function public.exec_sql')) {
        console.log('exec_sql function not found, trying direct execution...\n');
        
        // Split SQL into individual statements and execute
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'BEGIN' && s !== 'COMMIT');
        
        for (const statement of statements) {
          console.log(`Executing: ${statement.substring(0, 60)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_string: statement });
          
          if (stmtError) {
            console.error(`❌ Error executing statement via RPC:`, stmtError);
            throw stmtError;
          }
        }
        
        console.log('\n✅ Migration executed successfully!');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration executed successfully!');
      console.log('Result:', data);
    }
    
    // Verify columns exist
    console.log('\nVerifying migration...');
    
    const { data: columns, error: verifyError } = await supabase
      .from('conversations')
      .select('parse_method_used, raw_response_path, parse_attempts')
      .limit(0);
    
    if (verifyError && verifyError.message.includes('parse_method_used')) {
      console.log('⚠️  Columns may not have been added. Manual migration required.');
      console.log('\nPlease run the following SQL in Supabase SQL Editor:');
      console.log('-------------------------------------------');
      console.log(sql);
      console.log('-------------------------------------------');
      process.exit(1);
    } else {
      console.log('✅ Columns verified successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\nPlease run the following SQL manually in Supabase SQL Editor:');
    console.log('-------------------------------------------');
    console.log(sql);
    console.log('-------------------------------------------');
    process.exit(1);
  }
}

runMigration();

