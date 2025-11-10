const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql');
const outputFile = path.join(__dirname, 'generated-sql/insert-conversations-escaped.sql');

console.log('Escaping apostrophes in JSONB fields...\n');

let sql = fs.readFileSync(inputFile, 'utf8');

// Split by ::jsonb to find all JSONB fields
const parts = sql.split('::jsonb');

console.log(`Found ${parts.length - 1} JSONB fields\n`);

let result = '';
for (let i = 0; i < parts.length - 1; i++) {
  const part = parts[i];

  // Find the last single quote that starts the JSONB string
  const lastQuoteIndex = part.lastIndexOf("'");

  if (lastQuoteIndex === -1) {
    result += part + '::jsonb';
    continue;
  }

  // Split into: before quote, and jsonb content
  const before = part.substring(0, lastQuoteIndex + 1);
  const jsonbContent = part.substring(lastQuoteIndex + 1);

  // Escape apostrophes in JSONB content by doubling them
  // But ONLY the ones that are actually in string values
  // For simplicity, we'll just replace all ' with '' in the JSON content
  // This works because JSON uses double quotes for strings
  const escapedContent = jsonbContent.replace(/'/g, "''");

  result += before + escapedContent + '::jsonb';
}
result += parts[parts.length - 1]; // Add the final part after last ::jsonb

fs.writeFileSync(outputFile, result);

console.log(`✅ Escaped SQL written to: insert-conversations-escaped.sql\n`);
