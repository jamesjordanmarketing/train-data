const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql');
const outputFile = path.join(__dirname, 'generated-sql/insert-conversations-dollar-quoted.sql');

console.log('Fixing JSONB quoting in conversations SQL...\n');

let sql = fs.readFileSync(inputFile, 'utf8');

// Find all '....'::jsonb patterns and replace with $$....$$::jsonb
// We need to be careful to only match the JSONB casts

const jsonbPattern = /'(\{[^']*\})'::jsonb/g;
const arrayJsonbPattern = /'\[(\{[^\]]*\})\]'::jsonb/g;

let fixCount = 0;

// Replace JSONB objects
sql = sql.replace(jsonbPattern, (match, content) => {
  fixCount++;
  return `$$${content}$$::jsonb`;
});

// Replace JSONB arrays
sql = sql.replace(arrayJsonbPattern, (match, content) => {
  fixCount++;
  return `$$[${content}]$$::jsonb`;
});

console.log(`Fixed ${fixCount} JSONB fields with dollar quoting`);

fs.writeFileSync(outputFile, sql);

console.log(`✅ Fixed SQL written to: insert-conversations-dollar-quoted.sql\n`);
