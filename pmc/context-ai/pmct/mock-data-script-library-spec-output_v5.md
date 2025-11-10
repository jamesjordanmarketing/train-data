# Supabase Agent Ops Library  Enhanced Product Specification v5
## Agent-Optimized System for Robust Data Operations

> **Purpose:** A production-grade, agent-first TypeScript/JavaScript library for Supabase CRUD operations with comprehensive error handling, special character safety, and intelligent failure reporting. Designed for Claude Code, Cursor AI agents, and human developers.

**Library Location:** `C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops\`

---

## Executive Summary

This library solves the **critical blocking issue** encountered in E02: **SQL syntax errors caused by apostrophes and special characters in JSONB fields**. It provides a bulletproof, agent-callable API that handles data character interruptions automatically, with zero manual escaping required from agents.

### Key Improvements Over Input Spec

1. **Explicit Apostrophe Handling**: Dedicated section with code examples and failure recovery patterns
2. **Agent-First API Design**: Simple function calls with intelligent defaults and prescriptive guidance
3. **Enhanced Error Routing**: Error codes map directly to remediation steps with PostgreSQL code mappings
4. **TypeScript-First**: Fully typed API with JSDoc for Cursor/Claude Code IntelliSense
5. **Windows Path Support**: Full support for Windows-style paths (backslashes)
6. **Incremental Adoption**: Works alongside existing scripts, no migration required
7. **Comprehensive Test Fixtures**: Battle-tested against real-world E02 data failures
8. **Agent Guardrails**: No-dead-end design with preflight checks and deterministic outcomes
9. **Service Role Enforcement**: Ensures proper permissions and bypasses RLS by default

---

## 1. Core Architecture

### 1.1 Module Structure

```
supa-agent-ops/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                     # Main exports
│   ├── core/
│   │   ├── client.ts                # Supabase + pg clients bootstrap
│   │   ├── types.ts                 # Core types and interfaces
│   │   ├── config.ts                # Env/config management
│   ├── operations/
│   │   ├── import.ts                # Import operations (primary agent tool)
│   │   ├── export.ts                # Export operations
│   │   ├── upsert.ts                # Upsert operations
│   │   ├── delete.ts                # Delete operations
│   ├── validation/
│   │   ├── schema.ts                # Schema validation (zod/jsonschema)
│   │   ├── sanitize.ts              # Character sanitization
│   │   ├── normalize.ts             # Data normalization
│   ├── rpc/
│   │   ├── templates.sql            # SQL RPC definitions (optional v2)
│   │   ├── caller.ts                # RPC invocation (optional v2)
│   │   ├── generator.ts             # RPC SQL generator (optional v2)
│   ├── errors/
│   │   ├── codes.ts                 # Error code definitions
│   │   ├── handlers.ts              # Error recovery strategies
│   │   ├── reports.ts               # Report generators and schema
│   ├── utils/
│   │   ├── paths.ts                 # Cross-platform path handling
│   │   ├── logger.ts                # Structured logging
│   │   ├── batch.ts                 # Batching utilities
│   ├── preflight/
│   │   ├── checks.ts                # Agent preflight checks (env, table, schema)
│   │   ├── decision-tree.ts         # Prescriptive agent next-actions
│   ├── fixtures/
│   │   ├── apostrophes.test.json    # don't, can't, it's
│   │   ├── quotes.test.json         # "quoted", 'single'
│   │   ├── multiline.test.json      # \n\r\t
│   │   ├── emoji.test.json          # emojis/UTF-8
│   │   ├── e02-problem.test.json    # real failing records
├── dist/                            # Compiled output
├── reports/                         # Generated reports
```

### 1.2 Installation & Setup

```bash
# From train-data/supa-agent-ops
npm install
npm run build
npm test

# Link for local development
npm link

# Use in scripts
cd ../src/scripts
npm link supa-agent-ops
```

---

## 2. Configuration

### 2.1 Required Environment Variables

- **`SUPABASE_URL`**: Supabase project URL
- **`SUPABASE_SERVICE_ROLE_KEY`**: Service role API key (required for server-side imports and bypassing RLS)
- **Optional for pg fallback:**
  - `DATABASE_URL`: PostgreSQL connection string for direct `pg` client (SSL enabled if required)

**Important Notes:**
- Operations assume server context with Service Role access. If using user keys, RLS policies must permit the import. The library enforces service role by default and warns otherwise.
- Windows paths are fully supported; internal path handling uses Node's `path.win32`.

### 2.2 Configuration Loader

The library reads environment variables and validates presence with the following defaults:

- **Transport**: `supabase` (default) | `pg` (fallback when configured) | `auto` (prefers supabase)
- **Character validation and sanitization**: enabled by default
- **Batch size**: 200 (tunable)
- **Concurrency**: 2 (tunable)
- **Retry policy**: exponential backoff (base 300ms), max attempts 2

On missing critical config, preflight fails with actionable next steps (never silent failure).

### 2.3 Configuration Defaults

```typescript
export interface LibraryConfig {
  transport: 'supabase' | 'pg' | 'auto';
  batchSize: number;
  concurrency: number;
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
  validation: CharacterValidationConfig;
  outputDir: string;
}

export const DEFAULT_LIBRARY_CONFIG: LibraryConfig = {
  transport: 'supabase',
  batchSize: 200,
  concurrency: 2,
  retry: {
    maxAttempts: 2,
    backoffMs: 300
  },
  validation: {
    allowApostrophes: true,
    allowQuotes: true,
    allowBackslashes: true,
    allowNewlines: true,
    allowTabs: true,
    allowEmoji: true,
    allowControlChars: false,
    normalizeUnicode: 'NFC',
    stripInvalidUtf8: true,
    maxFieldLength: 1_000_000
  },
  outputDir: './reports'
};
```

---

## 3. Critical Feature: Apostrophe & Special Character Handling

### 3.1 The Problem (E02 Case Study)

**Failed SQL from E02:**
```sql
INSERT INTO conversations (parameters) VALUES (
  '{"strategy_rationale":"most people don't understand it"}'::jsonb
);
-- ERROR: syntax error at or near "t"
```

**Root Cause:** Apostrophe in "don't" breaks SQL string literal when embedded in JSONB cast.

### 3.2 The Solution (Three-Layer Safety)

#### Layer 1: Never Construct SQL Strings Manually

```typescript
// ❌ WRONG - Manual SQL construction (what E02 did)
const sql = `INSERT INTO conversations (parameters) VALUES ('${JSON.stringify(params)}'::jsonb)`;

// ✅ CORRECT - Use Supabase client (parameterized)
const { data, error } = await supabase
  .from('conversations')
  .insert({
    parameters: params  // Supabase handles serialization safely
  });
```

#### Layer 2: Use Prepared Statements for Raw SQL

```typescript
// If raw SQL is required (e.g., via pg client)
import { Client } from 'pg';

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

// ✅ CORRECT - Parameterized query
const query = {
  text: 'INSERT INTO conversations (parameters) VALUES ($1)',
  values: [params]  // pg driver escapes automatically
};

const result = await client.query(query);
```

#### Layer 3: Dollar-Quoting for SQL Editor/Scripts

```typescript
/**
 * Generates dollar-quoted SQL for manual execution in SQL Editor
 * Use ONLY when agent needs to generate SQL file for human review
 */
export function generateDollarQuotedInsert(
  table: string,
  record: Record<string, any>
): string {
  const columns = Object.keys(record);
  const values = columns.map(col => {
    const value = record[col];

    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'object') {
      // JSONB: use dollar-quoting to avoid escaping issues
      return `$$${JSON.stringify(value)}$$::jsonb`;
    }

    if (typeof value === 'string') {
      // Text: use dollar-quoting
      return `$$${value}$$`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      // Array: use dollar-quoting for each element
      const elements = value.map(v => `$$${String(v)}$$`);
      return `ARRAY[${elements.join(', ')}]`;
    }

    return 'NULL';
  });

  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

// Example usage:
const record = {
  id: 'uuid-here',
  persona: "Marcus - The Overwhelmed Avoider",
  parameters: {
    strategy_rationale: "most people don't understand it",
    quote: 'He said "hello" to me'
  }
};

const sql = generateDollarQuotedInsert('conversations', record);
console.log(sql);
/* Output:
INSERT INTO conversations (id, persona, parameters) VALUES (
  $$uuid-here$$,
  $$Marcus - The Overwhelmed Avoider$$,
  $${"strategy_rationale":"most people don't understand it","quote":"He said \"hello\" to me"}$$::jsonb
);
*/
```

### 3.3 Character Handling Matrix (Enhanced)

| Character | Example | Layer 1 (Client) | Layer 2 (Prepared) | Layer 3 (Dollar) | E02 Issue |
|-----------|---------|------------------|-------------------|------------------|-----------|
| Apostrophe | `don't` | ✅ Auto-handled | ✅ Auto-escaped | ✅ Preserved | ❌ Broke SQL |
| Double quote | `"hello"` | ✅ Auto-handled | ✅ Auto-escaped | ✅ Preserved | ⚠️ Risk |
| Backslash | `c:\path` | ✅ Auto-handled | ✅ Auto-escaped | ✅ Preserved | ⚠️ Risk |
| Newline | `line1\nline2` | ✅ Auto-handled | ✅ Auto-escaped | ✅ Preserved | ⚠️ Risk |
| Emoji | `😊` | ✅ UTF-8 safe | ✅ UTF-8 safe | ✅ UTF-8 safe | ✅ Works |
| Tab | `col1\tcol2` | ✅ Auto-handled | ✅ Auto-escaped | ✅ Preserved | ✅ Works |
| Control char | `\u0000` | ⚠️ May reject | ⚠️ May reject | ⚠️ May reject | ❌ Invalid |

### 3.4 Validation Rules

```typescript
export interface CharacterValidationConfig {
  allowApostrophes: boolean;        // Default: true
  allowQuotes: boolean;             // Default: true
  allowBackslashes: boolean;        // Default: true
  allowNewlines: boolean;           // Default: true
  allowTabs: boolean;               // Default: true
  allowEmoji: boolean;              // Default: true
  allowControlChars: boolean;       // Default: false (except \t\n\r)
  normalizeUnicode: 'NFC' | 'NFKC' | 'none';  // Default: 'NFC'
  stripInvalidUtf8: boolean;        // Default: true
  maxFieldLength: number;           // Default: 1_000_000 (1MB)
}

export function validateAndSanitize(
  value: string,
  config: CharacterValidationConfig = DEFAULT_CONFIG
): { valid: boolean; sanitized: string; warnings: string[] } {
  const warnings: string[] = [];
  let sanitized = value;

  // Unicode normalization
  if (config.normalizeUnicode !== 'none') {
    sanitized = sanitized.normalize(config.normalizeUnicode);
  }

  // Strip invalid UTF-8
  if (config.stripInvalidUtf8) {
    sanitized = sanitized.replace(/\uFFFD/g, '');
    if (sanitized !== value) {
      warnings.push('Removed invalid UTF-8 characters');
    }
  }

  // Control character handling
  if (!config.allowControlChars) {
    const controlChars = /[\u0000-\u001F]/g;
    const allowedControls = /[\t\n\r]/g;
    sanitized = sanitized.replace(controlChars, (match) => {
      if (allowedControls.test(match)) return match;
      warnings.push(`Removed control character: ${match.charCodeAt(0).toString(16)}`);
      return '';
    });
  }

  // Length check
  if (sanitized.length > config.maxFieldLength) {
    warnings.push(`Truncated field from ${sanitized.length} to ${config.maxFieldLength} chars`);
    sanitized = sanitized.substring(0, config.maxFieldLength);
  }

  return {
    valid: warnings.length === 0,
    sanitized,
    warnings
  };
}
```

---

## 4. Agent-First API Design

### 4.1 Primary Tool: `agentImportTool`

**Contract:**
```typescript
export interface AgentImportParams {
  source: string | Record<string, any>[]; // NDJSON/JSON file path or array of records
  table: string;                          // Target table
  mode?: 'insert' | 'upsert';             // Default: 'insert'
  onConflict?: string | string[];         // Default: auto-detect or 'id'
  outputDir?: string;                     // Default: './reports'
  batchSize?: number;                     // Default: 200
  concurrency?: number;                   // Default: 2
  dryRun?: boolean;                       // Default: false
  retry?: { maxAttempts?: number; backoffMs?: number }; // Default: {2, 300}
  validateCharacters?: boolean;           // Default: true
  sanitize?: boolean;                     // Default: true
  normalization?: 'NFC' | 'NFKC' | 'none';// Default: 'NFC'
  schema?: unknown;                       // Optional zod/jsonschema for records
  transport?: 'supabase' | 'pg' | 'auto'; // Default: 'supabase'
}

export interface AgentImportResult {
  success: boolean;
  summary: string;
  totals: { 
    total: number; 
    success: number; 
    failed: number; 
    skipped: number; 
    durationMs: number 
  };
  reportPaths: { 
    summary: string; 
    errors?: string; 
    success?: string 
  };
  nextActions: Array<{ 
    action: string; 
    description: string; 
    example?: string; 
    priority: 'HIGH'|'MEDIUM'|'LOW' 
  }>;
}

/**
 * Import records into a Supabase table - Agent-optimized function
 *
 * This is the PRIMARY function AI agents should use for data imports.
 * All complexity is handled internally with sensible defaults.
 *
 * @param params - Import parameters
 * @returns Promise with success status, summary, and report paths
 *
 * @example Basic import from NDJSON file
 * const result = await agentImportTool({
 *   source: 'C:\\data\\conversations.ndjson',
 *   table: 'conversations'
 * });
 * console.log(result.summary);
 *
 * @example Import with upsert mode
 * const result = await agentImportTool({
 *   source: records,  // Can pass array directly
 *   table: 'conversations',
 *   mode: 'upsert',
 *   onConflict: 'id'
 * });
 */
export async function agentImportTool(params: AgentImportParams): Promise<AgentImportResult>;
```

**Behavior:**
- Accepts NDJSON/JSON file (auto-detected) or array input. NDJSON reads are streaming; JSON arrays buffered.
- `mode: 'upsert'` uses `onConflict`; if omitted, attempts to auto-detect primary key via pg introspection (if `DATABASE_URL` available). Otherwise defaults to `'id'` and surfaces a HIGH-priority next action if mismatch is detected at runtime.
- Sanitization and normalization apply before sending to DB.
- Batching and concurrency defaults tuned to avoid rate limits; configurable.
- Dry-run validates, normalizes, and generates reports without writing to DB.
- **Transport:**
  - `supabase`: uses Supabase client with Service Role key.
  - `pg`: uses prepared statements against `DATABASE_URL`.
  - `auto`: prefers `supabase`; falls back to `pg` if Supabase env missing.
- Returns prescriptive `nextActions` even when `success=true` if any warnings detected, ensuring agents always have follow-up guidance.

### 4.2 Helper: `analyzeImportErrors`

```typescript
/**
 * Analyzes import errors and provides recovery steps
 * 
 * @param result - The result from agentImportTool
 * @returns Recovery steps with priorities and examples
 */
export async function analyzeImportErrors(result: AgentImportResult): Promise<{
  recoverySteps: Array<{ 
    priority: 'HIGH'|'MEDIUM'|'LOW'; 
    errorCode: string; 
    affectedCount: number; 
    action: string; 
    description: string; 
    example?: string; 
    automatable: boolean 
  }>;
}>;
```

- Consumes error report and maps to remediation steps (e.g., enable upsert, import dependencies first, enable sanitization).
- Always provides at least one actionable step; agents never see a dead end.

### 4.3 Preflight: `agentPreflight`

```typescript
/**
 * Validates environment and configuration before import
 * 
 * This function checks:
 * - Environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * - Service role presence and validity
 * - Table existence
 * - Upsert readiness (primary key detection for onConflict)
 * 
 * @param params - Preflight parameters
 * @returns Validation result with issues and recommendations
 * 
 * @example
 * const preflight = await agentPreflight({ 
 *   table: 'conversations', 
 *   mode: 'upsert' 
 * });
 * if (!preflight.ok) {
 *   console.log('Issues found:', preflight.issues);
 *   console.log('Recommendations:', preflight.recommendations);
 * }
 */
export async function agentPreflight(params: { 
  table: string; 
  mode?: 'insert'|'upsert'; 
  onConflict?: string|string[] 
}): Promise<{
  ok: boolean;
  issues: string[];
  recommendations: Array<{ 
    description: string; 
    example?: string; 
    priority: 'HIGH'|'MEDIUM'|'LOW' 
  }>;
}>;
```

- Validates env vars, service role presence, table existence, and upsert readiness.
- If any check fails, returns targeted recommendations and examples, guiding agents to correct configuration before attempting imports.
- Runs automatically on first `agentImportTool` call if not explicitly invoked.

### 4.4 Usage Examples for Agents

**Example 1: Import from file with preflight**
```typescript
// Always run preflight first
const preflight = await agentPreflight({ 
  table: 'conversations', 
  mode: 'upsert' 
});

if (!preflight.ok) {
  console.log('Configuration issues detected:');
  preflight.recommendations.forEach(rec => {
    console.log(`  [${rec.priority}] ${rec.description}`);
    if (rec.example) console.log(`    ${rec.example}`);
  });
  return;
}

// Proceed with import
const result = await agentImportTool({
  source: 'C:\\Users\\james\\data\\conversations.ndjson',
  table: 'conversations',
  mode: 'upsert',
  onConflict: 'id'
});

console.log(result.summary);
// Output:
// Import completed for table: conversations
// Total: 35 | Success: 35 | Failed: 0 | Skipped: 0
// Duration: 2.45s
```

**Example 2: Import from array**
```typescript
const conversations = [
  { id: '1', persona: "Marcus - The Overwhelmed Avoider", parameters: { note: "don't panic" } },
  { id: '2', persona: "Sarah - Detail Seeker", parameters: { emoji: "😊😍" } }
];

const result = await agentImportTool({
  source: conversations,
  table: 'conversations',
  mode: 'upsert'
});

if (!result.success) {
  console.log(`Error report: ${result.reportPaths.errors}`);
}
```

**Example 3: Handle errors with recovery**
```typescript
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
});

if (!result.success) {
  // Analyze errors for recovery steps
  const analysis = await analyzeImportErrors(result);

  console.log('Recovery steps:');
  analysis.recoverySteps.forEach(step => {
    console.log(`  [${step.priority}] ${step.description}`);
    console.log(`    ${step.example}`);
  });
}

// Check nextActions even on success
if (result.nextActions.length > 0) {
  console.log('Recommended follow-up actions:');
  result.nextActions.forEach(action => {
    console.log(`  [${action.priority}] ${action.description}`);
  });
}
```

**Example 4: Dry-run validation**
```typescript
// Test import without writing to database
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  dryRun: true
});

console.log(`Validation complete: ${result.totals.total} records validated`);
if (result.success) {
  console.log('All records valid, ready for actual import');
} else {
  console.log(`Found ${result.totals.failed} issues, check: ${result.reportPaths.errors}`);
}
```

---

## 5. Error Handling & Intelligent Routing

### 5.1 Error Code Taxonomy

All errors are categorized with:
- **Error Code**: Machine-readable identifier
- **Message**: Human-readable description
- **Remediation**: Specific steps to fix the issue
- **Automatable**: Whether fix can be automated

**Error Categories:**
1. **ERR_VALIDATION_***: Data validation failures
2. **ERR_CHAR_***: Character/encoding issues (THE E02 PROBLEM)
3. **ERR_DB_***: Database constraint violations
4. **ERR_CAST_***: Type casting failures
5. **ERR_AUTH_***: Authentication/permission issues
6. **ERR_FATAL**: Unrecoverable errors

### 5.2 Error Code Mapping (with PostgreSQL Codes)

The library maps database errors to standardized error codes with remediation steps. When using the `pg` transport, PostgreSQL error codes are captured directly. With Supabase client, error codes are extracted when available, otherwise pattern-matched from error messages.

**Common Mappings:**

| Error Code | PG Code | Pattern | Description | Remediation |
|-----------|---------|---------|-------------|-------------|
| `ERR_DB_UNIQUE_VIOLATION` | `23505` | `duplicate key value violates unique constraint` | Duplicate key violation | Retry with `mode: 'upsert'` |
| `ERR_DB_FK_VIOLATION` | `23503` | `violates foreign key constraint` | Foreign key constraint violation | Import parent tables first |
| `ERR_DB_NOT_NULL_VIOLATION` | `23502` | `null value in column` | NOT NULL constraint violation | Ensure required fields are populated |
| `ERR_DB_CHECK_VIOLATION` | `23514` | `violates check constraint` | CHECK constraint violation | Validate data against constraint rules |
| `ERR_CAST_INVALID_INPUT` | `22P02` | `invalid input syntax` | Type casting failure | Check data types match schema |
| `ERR_CHAR_INVALID_UTF8` | - | `invalid byte sequence for encoding "UTF8"` | Invalid UTF-8 sequences | Enable `sanitize: true` |
| `ERR_AUTH_RLS_DENIED` | - | `row level security` | RLS policy denied access | Use Service Role key or adjust RLS policies |

**Implementation:**
```typescript
export interface ErrorMapping {
  code: string;
  pgCode?: string;
  patterns: string[];
  category: 'VALIDATION' | 'CHAR' | 'DB' | 'CAST' | 'AUTH' | 'FATAL';
  description: string;
  remediation: string;
  example?: string;
  automatable: boolean;
}

export const ERROR_MAPPINGS: ErrorMapping[] = [
  {
    code: 'ERR_DB_UNIQUE_VIOLATION',
    pgCode: '23505',
    patterns: ['duplicate key value violates unique constraint'],
    category: 'DB',
    description: 'Duplicate key violates unique constraint',
    remediation: "Re-run import with mode: 'upsert' and proper onConflict setting",
    example: "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
    automatable: true
  },
  {
    code: 'ERR_DB_FK_VIOLATION',
    pgCode: '23503',
    patterns: ['violates foreign key constraint'],
    category: 'DB',
    description: 'Foreign key constraint violation',
    remediation: 'Import parent tables before child tables (e.g., templates before conversations)',
    example: "// Import templates first\nawait agentImportTool({ table: 'templates', ... });\n// Then conversations\nawait agentImportTool({ table: 'conversations', ... });",
    automatable: false
  },
  // ... additional mappings
];

/**
 * Maps database error to standardized error code
 */
export function mapDatabaseError(error: any): {
  code: string;
  description: string;
  remediation: string;
  example?: string;
  automatable: boolean;
} {
  // Prefer PG code when available
  if (error.code) {
    const mapping = ERROR_MAPPINGS.find(m => m.pgCode === error.code);
    if (mapping) return mapping;
  }

  // Fallback to pattern matching
  const message = error.message || String(error);
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.patterns.some(pattern => message.includes(pattern))) {
      return mapping;
    }
  }

  // Unknown error
  return {
    code: 'ERR_FATAL',
    description: 'Unknown error',
    remediation: 'Review error details and consult documentation',
    automatable: false
  };
}
```

### 5.3 Example Error Report

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totalErrors": 22,
  "errorBreakdown": [
    {
      "code": "ERR_DB_UNIQUE_VIOLATION",
      "pgCode": "23505",
      "count": 15,
      "percentage": 68.2,
      "description": "Duplicate key violates unique constraint"
    },
    {
      "code": "ERR_CHAR_INVALID_UTF8",
      "count": 5,
      "percentage": 22.7,
      "description": "String contains invalid UTF-8 sequences"
    },
    {
      "code": "ERR_DB_FK_VIOLATION",
      "pgCode": "23503",
      "count": 2,
      "percentage": 9.1,
      "description": "Foreign key constraint violation"
    }
  ],
  "recoverySteps": [
    {
      "priority": "HIGH",
      "errorCode": "ERR_DB_UNIQUE_VIOLATION",
      "affectedCount": 15,
      "action": "RETRY_WITH_UPSERT",
      "description": "Re-run import with mode: 'upsert' and onConflict set to primary key column",
      "example": "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
      "automatable": true
    },
    {
      "priority": "HIGH",
      "errorCode": "ERR_DB_FK_VIOLATION",
      "affectedCount": 2,
      "action": "IMPORT_DEPENDENCIES_FIRST",
      "description": "Import parent tables before child tables (e.g., templates before conversations)",
      "example": "// Step 1: Import templates\nawait agentImportTool({ table: 'templates', ... });\n// Step 2: Import conversations\nawait agentImportTool({ table: 'conversations', ... });",
      "automatable": false
    },
    {
      "priority": "MEDIUM",
      "errorCode": "ERR_CHAR_INVALID_UTF8",
      "affectedCount": 5,
      "action": "ENABLE_SANITIZATION",
      "description": "Enable automatic character sanitization",
      "example": "await agentImportTool({ ...params, validateCharacters: true, sanitize: true });",
      "automatable": true
    }
  ]
}
```

---

## 6. Reporting

### 6.1 File Naming

Reports are generated with consistent naming patterns:
- `reports/import-{table}-{runId}.summary.json`
- `reports/import-{table}-{runId}.errors.json`
- `reports/import-{table}-{runId}.success.json`

**`runId` format:** UTC `YYYYMMDDThhmmssZ` (e.g., `20251109T143022Z`)

### 6.2 Summary Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totals": { 
    "total": 35, 
    "success": 35, 
    "failed": 0, 
    "skipped": 0, 
    "durationMs": 2450 
  },
  "warnings": ["Removed invalid UTF-8 characters"],
  "config": {
    "mode": "upsert",
    "onConflict": "id",
    "batchSize": 200,
    "concurrency": 2,
    "sanitize": true,
    "normalization": "NFC",
    "transport": "supabase"
  },
  "nextActions": [
    { 
      "priority": "LOW", 
      "action": "REVIEW_WARNINGS", 
      "description": "Check sanitization impact", 
      "example": "Open summary report and inspect 'warnings'" 
    }
  ]
}
```

### 6.3 Errors Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totalErrors": 22,
  "errorBreakdown": [
    { 
      "code": "ERR_DB_UNIQUE_VIOLATION",
      "pgCode": "23505",
      "count": 15, 
      "percentage": 68.2, 
      "description": "Duplicate key violates unique constraint" 
    },
    { 
      "code": "ERR_CHAR_INVALID_UTF8", 
      "count": 5, 
      "percentage": 22.7, 
      "description": "Invalid UTF-8 sequences" 
    },
    { 
      "code": "ERR_DB_FK_VIOLATION",
      "pgCode": "23503",
      "count": 2, 
      "percentage": 9.1, 
      "description": "Foreign key constraint violation" 
    }
  ],
  "failedRecords": [
    {
      "record": { "id": "123", "..." },
      "error": {
        "code": "ERR_DB_UNIQUE_VIOLATION",
        "pgCode": "23505",
        "message": "duplicate key value violates unique constraint \"conversations_pkey\"",
        "detail": "Key (id)=(123) already exists."
      }
    }
  ],
  "recoverySteps": [
    {
      "priority": "HIGH",
      "errorCode": "ERR_DB_UNIQUE_VIOLATION",
      "affectedCount": 15,
      "action": "RETRY_WITH_UPSERT",
      "description": "Re-run import with mode 'upsert' and proper onConflict",
      "example": "await agentImportTool({ ...params, mode: 'upsert', onConflict: 'id' });",
      "automatable": true
    }
  ]
}
```

### 6.4 Success Report Schema

```json
{
  "runId": "20251109T143022Z",
  "table": "conversations",
  "totalSuccess": 35,
  "records": [
    { "id": "1" },
    { "id": "2" }
  ]
}
```

**Note:** For large imports, `records` array may be truncated in the report. Full success logs can be optionally enabled.

---

## 7. Agent Guardrails and No-Dead-End Design

### 7.1 Core Design Principles

The library is designed with strict guardrails to prevent agents from encountering dead-ends or making unsafe operations:

**1. Safe-by-Default:**
- No string concatenation pathways exposed to agents
- Parameterized operations only; raw SQL generation is review-only
- All user input is sanitized and validated before processing

**2. Preflight Required:**
- `agentPreflight` runs automatically on first call
- If failed, returns `ok=false` with explicit recommendations and examples
- Prevents wasted API calls and provides clear corrective actions

**3. Deterministic Outcomes:**
- Every call returns `nextActions` with at least one actionable step
- Even on success, if warnings exist, guidance is provided
- No vague error messages; all errors map to specific remediation steps

**4. Option Validation and Correction:**
- If `mode='upsert'` and `onConflict` missing, library attempts auto-detection
- If unable to auto-detect, sets `'id'` and returns HIGH-priority corrective action
- Unknown options or invalid values result in `ERR_VALIDATION_*` with suggested corrected call

**5. Dry-Run Capability:**
- Agents can run `dryRun: true` to get full reports and `nextActions` before writing
- Validates all data, generates reports, but skips database writes
- Allows agents to verify operations before committing

**6. Self-Healing Retries:**
- Transient errors retried with exponential backoff automatically
- Persistent failures surfaced with remediation steps
- Retry configuration tunable per operation

**7. Error Specificity:**
- Errors are categorized and routed to handlers that produce prescriptive steps
- Agents never receive vague failures like "database error"
- Each error includes example code for remediation

**8. Windows Path Normalization:**
- All file paths normalized automatically
- NDJSON reader handles CRLF safely
- No path-related errors for Windows users

### 7.2 Preflight Checks Implementation

```typescript
export interface PreflightCheck {
  name: string;
  description: string;
  check: () => Promise<boolean>;
  recommendation?: {
    description: string;
    example?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export const PREFLIGHT_CHECKS: PreflightCheck[] = [
  {
    name: 'ENV_SUPABASE_URL',
    description: 'Check SUPABASE_URL environment variable',
    check: async () => !!process.env.SUPABASE_URL,
    recommendation: {
      description: 'Set SUPABASE_URL environment variable',
      example: 'export SUPABASE_URL=https://your-project.supabase.co',
      priority: 'HIGH'
    }
  },
  {
    name: 'ENV_SERVICE_ROLE_KEY',
    description: 'Check SUPABASE_SERVICE_ROLE_KEY environment variable',
    check: async () => !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    recommendation: {
      description: 'Set SUPABASE_SERVICE_ROLE_KEY environment variable',
      example: 'export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
      priority: 'HIGH'
    }
  },
  {
    name: 'TABLE_EXISTS',
    description: 'Verify target table exists in database',
    check: async (table: string) => {
      // Implementation checks table existence via pg catalog or Supabase API
      return true;
    },
    recommendation: {
      description: 'Create the target table or verify the table name is correct',
      example: 'CREATE TABLE conversations (...);',
      priority: 'HIGH'
    }
  },
  {
    name: 'UPSERT_READINESS',
    description: 'Check if onConflict column exists and is unique',
    check: async (table: string, onConflict: string) => {
      // Implementation validates onConflict column via pg catalog
      return true;
    },
    recommendation: {
      description: 'Ensure onConflict column has a unique constraint',
      example: 'ALTER TABLE conversations ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);',
      priority: 'HIGH'
    }
  }
];
```

### 7.3 Automatic Recovery Examples

**Example 1: Auto-detect and correct onConflict**
```typescript
// Agent calls without onConflict
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations',
  mode: 'upsert'
  // Missing onConflict!
});

// Library auto-detects primary key 'id' and proceeds
// Returns nextAction if auto-detection was used:
result.nextActions[0] = {
  priority: 'MEDIUM',
  action: 'VERIFY_ONCONFLICT',
  description: 'Auto-detected onConflict column as "id". Verify this is correct.',
  example: 'await agentImportTool({ ...params, onConflict: "id" });'
};
```

**Example 2: Automatic retry on transient errors**
```typescript
// Network hiccup on first attempt
const result = await agentImportTool({
  source: './data.ndjson',
  table: 'conversations'
  // retry defaults to { maxAttempts: 2, backoffMs: 300 }
});

// Library automatically retries with exponential backoff
// Success message includes retry info:
result.summary = "Import completed for table: conversations (1 retry)";
```

---

## 8. Incremental Adoption & Compatibility

### 8.1 No Breaking Changes Required

The library works **alongside** existing scripts without requiring any changes to current workflows:

```
src/scripts/
   populate-mock-conversations.js   # OLD - Still works
   execute-sql-direct.js            # OLD - Still works
   import-with-agent-ops.js         # NEW - Uses library
   cursor-db-helper.js              # UNCHANGED
```

### 8.2 Migration Steps (Optional)

**Step 1: Install library**
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops
npm install
npm run build
npm link
```

**Step 2: Link in scripts directory**
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts
npm link supa-agent-ops
```

**Step 3: Update E02 script (example)**
```javascript
// File: src/scripts/execute-e02-safe.js
const { agentImportTool } = require('supa-agent-ops');

async function main() {
  // Templates first
  const templatesResult = await agentImportTool({
    source: './generated-sql/insert-templates-data.ndjson',
    table: 'templates',
    mode: 'upsert',
    onConflict: 'id'
  });
  
  if (!templatesResult.success) {
    console.error('Templates import failed:', templatesResult.reportPaths.errors);
    return;
  }

  // Conversations second (apostrophes handled automatically)
  const conversationsResult = await agentImportTool({
    source: './generated-sql/insert-conversations-data.ndjson',
    table: 'conversations',
    mode: 'upsert',
    onConflict: 'id'
  });
  
  if (!conversationsResult.success) {
    console.error('Conversations import failed:', conversationsResult.reportPaths.errors);
    return;
  }

  console.log('✅ E02 import complete!');
}

main();
```

**Step 4: Convert SQL to NDJSON** (one-time)
```javascript
// File: src/scripts/convert-sql-to-ndjson.js
const fs = require('fs');

// Read generated SQL INSERT statements
const conversationsData = [
  { id: '...', persona: '...', parameters: { ... } },
  // ... extracted from SQL file
];

// Write as NDJSON
fs.writeFileSync(
  './generated-sql/insert-conversations-data.ndjson',
  conversationsData.map(r => JSON.stringify(r)).join('\n')
);

console.log('✅ Converted to NDJSON format');
```

---

## 9. Production Readiness

### 9.1 Test Coverage

```
supa-agent-ops/
   src/
       __tests__/
           apostrophe-safety.test.ts        ✅ Apostrophe handling
           quote-escaping.test.ts           ✅ Quote handling
           multiline-strings.test.ts        ✅ Newline handling
           emoji-support.test.ts            ✅ Emoji/UTF-8
           batch-processing.test.ts         ✅ Batching logic
           error-categorization.test.ts     ✅ Error routing & PG code mapping
           dollar-quoting.test.ts           ✅ SQL generation
           e02-regression.test.ts           ✅ E02 failing data
           preflight-checks.test.ts         ✅ Preflight validation
           auto-recovery.test.ts            ✅ Automatic retries and corrections
```

**Test Requirements:**
- Environment setup: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `DATABASE_URL`
- Database seeding: Provide seed fixtures and minimal schema for `conversations`, `templates`
- CI/CD: Automated testing on PR and commit

**Running Tests:**
```bash
npm test                  # Run all tests
npm test -- --coverage    # Run with coverage report
npm test -- --watch       # Watch mode for development
```

### 9.2 Performance Benchmarks

**Target Metrics:**
- **Throughput**: ≥ 5,000 records/minute (batch size 200, concurrency 2)
- **Memory**: ≤ 500MB for 10,000 records
- **Startup**: ≤ 100ms library load time
- **Batch latency**: ~200ms per batch (network dependent)

**Measurement:**
- Built-in timing in summary report (`durationMs`)
- Memory profiling via Node.js `process.memoryUsage()`
- CI job to assert thresholds for E02 fixtures

**Benchmark Script:**
```bash
npm run benchmark         # Run performance benchmarks
```

### 9.3 Documentation

Complete documentation is provided:
- **README.md**: Quick start and examples
- **API.md**: Full API reference with all functions and types
- **ERROR_CODES.md**: Complete error catalog with remediation steps
- **EXAMPLES.md**: Agent integration patterns and use cases
- **MIGRATION.md**: Upgrade guide from manual SQL approaches
- **PREFLIGHT.md**: Preflight checks and configuration validation
- **GUARDRAILS.md**: Agent safety features and design principles

---

## 10. RPC Scope (Deferred for v2)

For simplicity and reduced surface area, RPC templates and caller are **optional in v2**. The primary recommendation is for agents to use `agentImportTool` which provides all necessary functionality.

**If RPC is included:**
- Provide at least one example SQL function (e.g., `import_records_safe`)
- RPC caller using parameterized inputs only
- Dollar-quoted SQL generation for human review

**Default Recommendation:**
Agents should prefer `agentImportTool` over RPC for:
- Better error handling and reporting
- Automatic batching and retry logic
- Character safety without additional SQL functions
- Direct integration with preflight checks

---

## 11. Agent Decision Tree

Use this decision tree to choose the right approach:

```
📋 Need to import data to Supabase?
│
├─ YES → Is data in JSON/NDJSON format?
│   │
│   ├─ YES → Run preflight check first
│   │   │
│   │   └─ ✅ USE agentImportTool()
│   │       • Automatic apostrophe handling
│   │       • Error reports with recovery steps
│   │       • Batch processing
│   │       • Automatic retries
│   │
│   └─ NO → Convert to NDJSON first
│       │
│       └─ Then use agentImportTool()
│
└─ NO → Need to generate SQL for human review?
    │
    └─ YES → ⚠️ USE generateDollarQuotedInsert()
        • Dollar-quoted SQL (safe for SQL Editor)
        • For review only, not automated execution
```

**Quick Decision Guide:**
1. **Automated imports** → `agentImportTool()` (always)
2. **Human review SQL** → `generateDollarQuotedInsert()` (review only)
3. **Validation before import** → `agentPreflight()` (recommended)
4. **Error analysis** → `analyzeImportErrors()` (after failures)

---

## 12. Summary: Why This Library Solves E02

### The E02 Problem
```sql
-- ❌ FAILED in E02
INSERT INTO conversations (parameters) VALUES (
  '{"text":"don't panic"}'::jsonb
);
-- ERROR: syntax error at or near "t"
```

### The Solution (This Library)
```typescript
// ✅ WORKS with supa-agent-ops
await agentImportTool({
  source: [{ parameters: { text: "don't panic" } }],
  table: 'conversations'
});
// SUCCESS: Supabase client handles escaping automatically
```

### Key Benefits

1. **Zero Manual Escaping**: Agents never write SQL strings
2. **Automatic Safety**: All special characters handled by Supabase client or pg parameterization
3. **Intelligent Errors**: Failed records reported with specific recovery steps and PostgreSQL error codes
4. **Incremental Adoption**: Works alongside existing scripts
5. **Agent-Optimized**: Simple API with comprehensive JSDoc IntelliSense
6. **Production-Ready**: Full test coverage, error handling, and documentation
7. **No Dead Ends**: Preflight checks and prescriptive `nextActions` ensure agents always know what to do next
8. **Self-Healing**: Automatic retries and error recovery where possible
9. **Windows-Friendly**: Full support for Windows paths and CRLF line endings

---

## 13. Quick Reference Card (For Agents)

**Install:**
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops
npm install && npm run build && npm link

cd ../src/scripts
npm link supa-agent-ops
```

**Import:**
```typescript
const { agentImportTool, agentPreflight, analyzeImportErrors } = require('supa-agent-ops');
```

**Preflight (Recommended):**
```typescript
const preflight = await agentPreflight({ 
  table: 'conversations', 
  mode: 'upsert' 
});

if (!preflight.ok) {
  console.log('Issues:', preflight.issues);
  preflight.recommendations.forEach(rec => {
    console.log(`[${rec.priority}] ${rec.description}`);
  });
  return;
}
```

**Import:**
```typescript
const result = await agentImportTool({
  source: './data.ndjson',  // Or array of objects
  table: 'conversations',
  mode: 'upsert',           // Optional: 'insert' or 'upsert'
  onConflict: 'id'          // Optional: conflict column
});

console.log(result.summary);

// Check for errors
if (!result.success) {
  console.log(`Errors: ${result.reportPaths.errors}`);
  
  const analysis = await analyzeImportErrors(result);
  analysis.recoverySteps.forEach(step => {
    console.log(`[${step.priority}] ${step.description}`);
    if (step.example) console.log(step.example);
  });
}

// Check for warnings/recommendations
if (result.nextActions.length > 0) {
  result.nextActions.forEach(action => {
    console.log(`[${action.priority}] ${action.description}`);
  });
}
```

**That's it!** All apostrophes, quotes, emojis, and special characters are handled automatically. The library guides you through any issues with specific, actionable steps.

---

## 14. Environment Setup Checklist

Before using the library, ensure the following environment variables are set:

**Required:**
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for bypassing RLS)

**Optional:**
- [ ] `DATABASE_URL` - PostgreSQL connection string (for `pg` transport fallback)

**Verification:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

**Windows PowerShell:**
```powershell
# Check environment variables
$env:SUPABASE_URL
$env:SUPABASE_SERVICE_ROLE_KEY
```

---

**Document Version:** 5.0-Merged
**Target Audience:** Claude Code, Cursor AI agents, Human developers
**Status:** READY FOR IMPLEMENTATION
**Library Path:** `C:\Users\james\Master\BrightHub\BRun\train-data\supa-agent-ops\`
**Last Updated:** 2025-11-10

---

## Appendix A: Complete Type Definitions

```typescript
// Core Types
export interface AgentImportParams {
  source: string | Record<string, any>[];
  table: string;
  mode?: 'insert' | 'upsert';
  onConflict?: string | string[];
  outputDir?: string;
  batchSize?: number;
  concurrency?: number;
  dryRun?: boolean;
  retry?: { maxAttempts?: number; backoffMs?: number };
  validateCharacters?: boolean;
  sanitize?: boolean;
  normalization?: 'NFC' | 'NFKC' | 'none';
  schema?: unknown;
  transport?: 'supabase' | 'pg' | 'auto';
}

export interface AgentImportResult {
  success: boolean;
  summary: string;
  totals: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
  reportPaths: {
    summary: string;
    errors?: string;
    success?: string;
  };
  nextActions: Array<{
    action: string;
    description: string;
    example?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

export interface CharacterValidationConfig {
  allowApostrophes: boolean;
  allowQuotes: boolean;
  allowBackslashes: boolean;
  allowNewlines: boolean;
  allowTabs: boolean;
  allowEmoji: boolean;
  allowControlChars: boolean;
  normalizeUnicode: 'NFC' | 'NFKC' | 'none';
  stripInvalidUtf8: boolean;
  maxFieldLength: number;
}

export interface ErrorMapping {
  code: string;
  pgCode?: string;
  patterns: string[];
  category: 'VALIDATION' | 'CHAR' | 'DB' | 'CAST' | 'AUTH' | 'FATAL';
  description: string;
  remediation: string;
  example?: string;
  automatable: boolean;
}

export interface PreflightResult {
  ok: boolean;
  issues: string[];
  recommendations: Array<{
    description: string;
    example?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

export interface RecoveryStep {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  errorCode: string;
  affectedCount: number;
  action: string;
  description: string;
  example?: string;
  automatable: boolean;
}
```

---

## Appendix B: Error Code Reference

| Error Code | Category | Automatable | Description |
|-----------|----------|-------------|-------------|
| `ERR_VALIDATION_SCHEMA` | VALIDATION | No | Record doesn't match schema |
| `ERR_VALIDATION_REQUIRED` | VALIDATION | No | Required field missing |
| `ERR_CHAR_INVALID_UTF8` | CHAR | Yes | Invalid UTF-8 sequences |
| `ERR_CHAR_CONTROL` | CHAR | Yes | Invalid control characters |
| `ERR_DB_UNIQUE_VIOLATION` | DB | Yes | Duplicate key violation |
| `ERR_DB_FK_VIOLATION` | DB | No | Foreign key constraint |
| `ERR_DB_NOT_NULL_VIOLATION` | DB | No | NOT NULL constraint |
| `ERR_DB_CHECK_VIOLATION` | DB | No | CHECK constraint |
| `ERR_CAST_INVALID_INPUT` | CAST | No | Type casting failure |
| `ERR_AUTH_RLS_DENIED` | AUTH | No | RLS policy denied |
| `ERR_FATAL` | FATAL | No | Unrecoverable error |

---

**END OF SPECIFICATION**

