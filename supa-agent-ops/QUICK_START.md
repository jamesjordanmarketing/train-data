# Quick Start Guide

Get started with the Supabase Agent Ops library in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase project with Service Role key
- Environment variables configured

## Step 1: Setup Environment

Create a `.env` file or export these variables:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Important**: Use the Service Role key (not the anon key) for server-side operations.

## Step 2: Install Library

```bash
# From the library directory
cd supa-agent-ops
npm install
npm run build
npm link

# From your project directory
cd ../your-project
npm link supa-agent-ops
```

## Step 3: Create Your First Import

Create a file `import-data.js`:

```javascript
const { agentImportTool, agentPreflight } = require('supa-agent-ops');

async function main() {
  // Step 1: Check configuration
  const preflight = await agentPreflight({ 
    table: 'conversations' 
  });
  
  if (!preflight.ok) {
    console.log('❌ Configuration issues:');
    preflight.recommendations.forEach(rec => {
      console.log(`  [${rec.priority}] ${rec.description}`);
    });
    return;
  }
  
  // Step 2: Import data
  const records = [
    { 
      id: '1', 
      persona: 'Marcus',
      parameters: { 
        note: "don't worry about apostrophes" 
      }
    },
    { 
      id: '2', 
      persona: 'Sarah',
      parameters: { 
        note: "It's working! 😊" 
      }
    }
  ];
  
  const result = await agentImportTool({
    source: records,
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });
  
  // Step 3: Check results
  console.log(result.summary);
  
  if (!result.success) {
    console.log(`Error report: ${result.reportPaths.errors}`);
  }
}

main().catch(console.error);
```

Run it:

```bash
node import-data.js
```

## Step 4: Import from File

Create `data.ndjson`:

```
{"id":"1","persona":"Marcus","parameters":{"note":"don't worry"}}
{"id":"2","persona":"Sarah","parameters":{"note":"It's fine 😊"}}
{"id":"3","persona":"Alex","parameters":{"note":"Works great!"}}
```

Import it:

```javascript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

console.log(result.summary);
```

## Step 5: Handle Errors

```javascript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  const { analyzeImportErrors } = require('supa-agent-ops');
  const analysis = await analyzeImportErrors(result);
  
  console.log('Recovery steps:');
  analysis.recoverySteps.forEach(step => {
    console.log(`[${step.priority}] ${step.description}`);
    console.log(`Example: ${step.example}`);
  });
}
```

## Common Patterns

### Pattern 1: Safe Import with Retry

```javascript
async function safeImport(file, table) {
  // Try insert first
  let result = await agentImportTool({
    source: file,
    table: table
  });
  
  // If unique violations, retry with upsert
  if (!result.success) {
    const analysis = await analyzeImportErrors(result);
    const hasUniqueViolation = analysis.recoverySteps.some(
      s => s.errorCode === 'ERR_DB_UNIQUE_VIOLATION'
    );
    
    if (hasUniqueViolation) {
      result = await agentImportTool({
        source: file,
        table: table,
        mode: 'upsert',
        onConflict: 'id'
      });
    }
  }
  
  return result;
}
```

### Pattern 2: Dry Run First

```javascript
async function cautious Import(file, table) {
  // Validate first
  const dryRun = await agentImportTool({
    source: file,
    table: table,
    dryRun: true
  });
  
  if (!dryRun.success) {
    console.log('Validation failed');
    return dryRun;
  }
  
  // Then import
  return await agentImportTool({
    source: file,
    table: table
  });
}
```

### Pattern 3: Multiple Tables

```javascript
async function importAll() {
  const tables = [
    { file: './templates.ndjson', table: 'templates' },
    { file: './conversations.ndjson', table: 'conversations' }
  ];
  
  for (const { file, table } of tables) {
    console.log(`Importing ${table}...`);
    
    const result = await agentImportTool({
      source: file,
      table: table,
      mode: 'upsert',
      onConflict: 'id'
    });
    
    if (!result.success) {
      console.log(`❌ ${table} failed`);
      break;
    }
    
    console.log(`✅ ${table}: ${result.totals.success} records`);
  }
}
```

## Troubleshooting

### "Missing required environment variables"

```bash
# Check your environment
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Set them if missing
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-key
```

### "Table does not exist"

Run preflight to check:

```javascript
const preflight = await agentPreflight({ table: 'your_table' });
console.log(preflight.issues);
```

### "RLS policy denied"

Make sure you're using the Service Role key, not the anon key:

```bash
# Service role keys are longer and start with eyJ
echo $SUPABASE_SERVICE_ROLE_KEY
```

### "Duplicate key violation"

Use upsert mode:

```javascript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});
```

## Next Steps

- Read [EXAMPLES.md](./EXAMPLES.md) for more use cases
- Check [ERROR_CODES.md](./ERROR_CODES.md) for error reference
- See [README.md](./README.md) for full documentation

## Getting Help

1. Run preflight checks: `agentPreflight({ table: 'your_table' })`
2. Check error reports in `./reports/` directory
3. Use `analyzeImportErrors(result)` for recovery steps
4. Review [ERROR_CODES.md](./ERROR_CODES.md) for specific errors

## Key Takeaways

✅ Always run preflight checks first  
✅ Use upsert mode for updates  
✅ Check error reports for details  
✅ Follow recovery steps in priority order  
✅ No manual escaping needed - library handles it  
✅ All special characters (apostrophes, quotes, emojis) work automatically  

Happy importing! 🎉

