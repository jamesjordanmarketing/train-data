const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

async function insertConversations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('═══════════════════════════════════════════════════');
  console.log('  Inserting Conversations (35 records)');
  console.log('═══════════════════════════════════════════════════\n');

  const sql = fs.readFileSync(
    path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql'),
    'utf8'
  );

  const fileSize = (fs.statSync(path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql')).size / 1024).toFixed(2);
  console.log(`File size: ${fileSize} KB`);
  console.log(`Expected records: 35\n`);

  try {
    console.log('⏳ Executing SQL...');
    const startTime = Date.now();

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ SUCCESS!`);
    console.log(`   Duration: ${duration}s\n`);

    // Verify
    const verify = await client.query('SELECT COUNT(*) as count FROM conversations');
    console.log(`✅ Verification:`);
    console.log(`   Total conversations in database: ${verify.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.log(`\n❌ FAILED!`);
    console.log(`   Error: ${error.message}`);
    if (error.position) {
      const pos = parseInt(error.position);
      const context = sql.substring(Math.max(0, pos - 200), pos + 200);
      console.log(`\n   Error context:`);
      console.log(`   ...${context}...`);
    }
    throw error;
  } finally {
    await client.end();
  }
}

insertConversations().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  process.exit(1);
});
