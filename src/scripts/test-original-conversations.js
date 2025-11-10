const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

async function testOriginal() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const sql = fs.readFileSync(
    path.join(__dirname, 'generated-sql/insert-conversations.sql'),
    'utf8'
  );

  console.log('Testing ORIGINAL conversations SQL file...\n');

  try {
    // Just test the first INSERT
    const firstInsert = sql.split('INSERT INTO conversations')[1].split(');')[0] + ');';
    const testSql = 'INSERT INTO conversations' + firstInsert;

    console.log(`Testing first INSERT statement (${testSql.length} chars)...\n`);

    await client.query('BEGIN');
    await client.query(testSql);
    await client.query('ROLLBACK'); // Don't actually commit

    console.log('✅ First INSERT syntax is valid');

  } catch (error) {
    console.log('❌ Syntax error in original SQL:');
    console.log(`   ${error.message}\n`);
  } finally {
    await client.end();
  }
}

testOriginal().catch(console.error);
