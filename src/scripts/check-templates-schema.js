const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

async function checkSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const result = await client.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'templates'
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `);

  console.log('Templates Table Schema:');
  console.log('======================\n');
  result.rows.forEach(row => {
    console.log(`${row.column_name}: ${row.data_type} (${row.udt_name})`);
  });

  await client.end();
}

checkSchema().catch(console.error);
