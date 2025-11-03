const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const tables = [
  'conversations',
  'conversation_turns',
  'chunks',
  'scenarios',
  'templates',
  'edge_cases',
  'documents',
  'categories',
  'tags',
  'workflow_sessions',
  'document_categories',
  'document_tags',
  'custom_tags',
  'tag_dimensions'
];

async function getTableSchema(tableName) {
  try {
    // Use RPC to execute SQL query for table schema
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      return { table: tableName, exists: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { table: tableName, exists: false, error: 'Table not found' };
    }

    return { table: tableName, exists: true, columns: data };
  } catch (err) {
    return { table: tableName, exists: false, error: err.message };
  }
}

async function getIndexes(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = '${tableName}'
        ORDER BY indexname;
      `
    });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function getConstraints(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          conname,
          contype,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = '${tableName}'::regclass
        ORDER BY contype, conname;
      `
    });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('🔍 Getting complete database schema from Supabase...\n');

  const results = [];

  for (const table of tables) {
    console.log(`Checking ${table}...`);

    const schema = await getTableSchema(table);

    if (schema.exists) {
      const indexes = await getIndexes(table);
      const constraints = await getConstraints(table);

      results.push({
        ...schema,
        indexes,
        constraints
      });

      console.log(`  ✅ ${schema.columns.length} columns, ${indexes.length} indexes, ${constraints.length} constraints`);
    } else {
      results.push(schema);
      console.log(`  ❌ ${schema.error}`);
    }
  }

  // Write results to file
  const fs = require('fs');
  const outputPath = 'database-schema-complete.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Complete schema saved to ${outputPath}`);

  // Print summary
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);

  console.log(`\n📊 Summary:`);
  console.log(`   • Existing tables: ${existing.length}`);
  console.log(`   • Missing tables: ${missing.length}`);

  if (existing.length > 0) {
    console.log(`\n✅ Existing tables:`);
    existing.forEach(t => {
      console.log(`   - ${t.table} (${t.columns.length} columns)`);
    });
  }

  if (missing.length > 0) {
    console.log(`\n❌ Missing tables:`);
    missing.forEach(t => {
      console.log(`   - ${t.table}`);
    });
  }
}

main().catch(console.error);
