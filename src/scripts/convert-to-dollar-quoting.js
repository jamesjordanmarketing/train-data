const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'generated-sql/insert-conversations-fixed.sql');
const outputFile = path.join(__dirname, 'generated-sql/insert-conversations-dollar-quoted.sql');

console.log('Converting JSONB to dollar quoting...\n');

let sql = fs.readFileSync(inputFile, 'utf8');

// Pattern: '...'::jsonb where ... is JSON content
// We need to handle nested quotes properly

let result = '';
let i = 0;
let converted = 0;

while (i < sql.length) {
  // Look for pattern '...'::jsonb
  const remainingSql = sql.substring(i);
  const jsonbMatch = remainingSql.match(/^'(\{[^}]*\})'::jsonb|^'\[(\{[^\]]*\})\]'::jsonb/);

  if (jsonbMatch) {
    // Found a simple JSONB - but this regex won't handle nested braces
    // Let's use a different approach
  }

  // Simpler approach: find '::jsonb and work backwards
  const jsonbIndex = sql.indexOf('::jsonb', i);
  if (jsonbIndex === -1) {
    // No more ::jsonb, add rest of SQL
    result += sql.substring(i);
    break;
  }

  // Find the matching opening quote
  let quotePos = jsonbIndex - 1;
  while (quotePos > i && sql[quotePos] !== "'") {
    quotePos--;
  }

  if (sql[quotePos] !== "'") {
    // Couldn't find opening quote, just copy and continue
    result += sql.substring(i, jsonbIndex + 7);
    i = jsonbIndex + 7;
    continue;
  }

  // Now find the start quote (there should be another ' before the content)
  let startQuote = quotePos - 1;
  while (startQuote > i && sql[startQuote] === ' ') {
    startQuote--;
  }

  // Actually, the simpler way: the quote at quotePos is the CLOSING quote
  // We need to find the OPENING quote by counting backwards
  let openQuote = quotePos;
  let depth = 1;
  openQuote--;

  while (openQuote > i && depth > 0) {
    if (sql[openQuote] === "'" && sql[openQuote - 1] !== "\\") {
      depth--;
    }
    if (depth > 0) openQuote--;
  }

  // Add everything before the opening quote
  result += sql.substring(i, openQuote);

  // Extract the JSON content (between quotes)
  const jsonContent = sql.substring(openQuote + 1, quotePos);

  // Use dollar quoting
  result += `$$${jsonContent}$$::jsonb`;
  converted++;

  i = jsonbIndex + 7; // Skip past ::jsonb
}

fs.writeFileSync(outputFile, result);

console.log(`✅ Converted ${converted} JSONB fields to dollar quoting`);
console.log(`✅ Written to: insert-conversations-dollar-quoted.sql\n`);
