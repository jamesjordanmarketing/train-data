const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const result = await client.query(`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'conversations'
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);

  console.log('Conversations Table Schema:');
  console.log('===========================\n');
  result.rows.forEach(row => {
    const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    console.log(`${row.column_name.padEnd(30)} ${row.data_type.padEnd(25)} (${row.udt_name}) ${nullable}`);
  });
  console.log(`\nTotal columns: ${result.rows.length}`);

  await client.end();
}

checkSchema().catch(console.error);
