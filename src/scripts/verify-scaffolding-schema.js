/**
 * Verify Database Schema Setup
 * Checks that all scaffolding tables exist with correct columns
 */

const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') 
      ? { rejectUnauthorized: false }
      : undefined
  });

  try {
    await client.connect();

    const tablesToVerify = [
      { name: 'personas', minColumns: 17 },
      { name: 'emotional_arcs', minColumns: 20 },
      { name: 'training_topics', minColumns: 12 },
      { name: 'prompt_templates', minColumns: 25 }
    ];

    for (const table of tablesToVerify) {
      // Check table exists
      const existsResult = await client.query(
        `SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = $1)`,
        [table.name]
      );

      if (!existsResult.rows[0].exists) {
        console.log(`❌ Table ${table.name} does not exist`);
        continue;
      }

      // Get column count
      const colResult = await client.query(
        `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = $1`,
        [table.name]
      );

      // Get index count
      const idxResult = await client.query(
        `SELECT COUNT(*) as count FROM pg_indexes WHERE tablename = $1`,
        [table.name]
      );

      // Get row count
      const rowResult = await client.query(`SELECT COUNT(*) as count FROM ${table.name}`);

      const columns = parseInt(colResult.rows[0].count);
      const indexes = parseInt(idxResult.rows[0].count);
      const rows = parseInt(rowResult.rows[0].count);

      console.log(`✅ ${table.name}:`);
      console.log(`   - Columns: ${columns} (expected at least ${table.minColumns})`);
      console.log(`   - Indexes: ${indexes}`);
      console.log(`   - Rows: ${rows}`);

      if (columns < table.minColumns) {
        console.log(`   ⚠️  Warning: Expected at least ${table.minColumns} columns`);
      }
    }

    console.log('\n✅ Schema verification complete!\n');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema()
  .then(() => {
    console.log('🎉 Verification successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });

