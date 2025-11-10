const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

async function testInsert() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Testing templates insert...\n');

  const sql = fs.readFileSync(
    path.join(__dirname, 'generated-sql/insert-templates-schema-corrected.sql'),
    'utf8'
  );

  try {
    await client.query('BEGIN');
    const result = await client.query(sql);
    await client.query('COMMIT');

    console.log('✅ INSERT SUCCESSFUL');
    console.log(`   Rows inserted: ${result.rowCount}`);

    // Verify
    const verify = await client.query('SELECT COUNT(*) as count FROM templates');
    console.log(`   Total templates: ${verify.rows[0].count}\n`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.log('❌ INSERT FAILED');
    console.log(`   Error: ${error.message}\n`);
    if (error.position) {
      const pos = parseInt(error.position);
      const context = sql.substring(Math.max(0, pos - 100), pos + 100);
      console.log('   Context:', context);
    }
  } finally {
    await client.end();
  }
}

testInsert().catch(console.error);
