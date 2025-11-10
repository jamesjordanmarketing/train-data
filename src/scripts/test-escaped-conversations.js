const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

async function testEscaped() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Testing ESCAPED conversations SQL...\n');

  const sql = fs.readFileSync(
    path.join(__dirname, 'generated-sql/insert-conversations-escaped.sql'),
    'utf8'
  );

  console.log(`File size: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log(`Testing ALL 35 INSERTs...\n`);

  try {
    const startTime = Date.now();

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('ROLLBACK'); // Don't commit yet, just test syntax

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ ALL SQL SYNTAX VALID!`);
    console.log(`   Parse time: ${duration}s`);
    console.log(`\n✅ Ready to execute for real\n`);

  } catch (error) {
    console.log(`❌ Syntax error:`);
    console.log(`   ${error.message}\n`);
    if (error.position) {
      const pos = parseInt(error.position);
      const context = sql.substring(Math.max(0, pos - 150), pos + 150);
      console.log(`   Context around error:`);
      console.log(`   ...${context}...`);
    }
  } finally {
    await client.end();
  }
}

testEscaped().catch(console.error);
