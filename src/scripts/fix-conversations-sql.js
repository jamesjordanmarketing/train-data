const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'generated-sql/insert-conversations.sql');
const outputFile = path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql');

console.log('Fixing conversations SQL file...\n');

let sql = fs.readFileSync(inputFile, 'utf8');

const oldTemplateId = 'c5ed68ed-4c6b-4915-80e1-e0871229d360';
const newTemplateId = 'e02a1111-2222-3333-4444-555566667777';
const userUuid = '12345678-1234-1234-1234-123456789012';

// Count occurrences before
const oldTemplateCount = (sql.match(new RegExp(oldTemplateId, 'g')) || []).length;
const userUuidCount = (sql.match(new RegExp(userUuid, 'g')) || []).length;

console.log(`Found ${oldTemplateCount} occurrences of old template ID`);
console.log(`Found ${userUuidCount} occurrences of user UUID`);

// Replace old template ID with new one
sql = sql.replaceAll(oldTemplateId, newTemplateId);

// Replace user UUIDs with NULL
sql = sql.replaceAll(`'${userUuid}'`, 'NULL');

// Write fixed file
fs.writeFileSync(outputFile, sql);

console.log(`\n✅ Fixed SQL written to: insert-conversations-fixed.sql`);
console.log(`   - Replaced ${oldTemplateCount} template ID references`);
console.log(`   - Replaced ${userUuidCount} user UUID references with NULL\n`);
