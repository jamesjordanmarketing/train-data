# Database Connection Issues - Troubleshooting & Resolution

**Document Version**: 1.0
**Created**: 2025-11-09
**Status**: ACTIVE TROUBLESHOOTING

---

## Problem Statement

We have two connection-related issues that must be resolved to enable direct database manipulation from scripts:

### Issue 1: Direct PostgreSQL Connection Failed
- **Error**: `Tenant or user not found`
- **Context**: When attempting to connect via `pg` library with DATABASE_URL
- **Impact**: Cannot execute SQL files directly via `execute-sql-direct.js`

### Issue 2: DATABASE_URL Configuration Verification
- **Current Value**: `postgresql://postgres.hqhtbxlgzysfbekexwku:18eH2SXRL71ZOGMB@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
- **Issue**: Connection string format or credentials may be incorrect
- **Impact**: Cannot introspect database schema or execute raw SQL

---

## Current Environment Status

### ✅ Working
- **Supabase Client**: Full read/write/edit access via service role key
- **Tables**: Both `templates` and `conversations` accessible via Supabase client
- **Authentication**: Service role key is valid and functional

### ❌ Not Working
- **Direct PostgreSQL**: Cannot connect via `pg` library
- **Pooler Connection**: Port 6543 connection fails with "Tenant or user not found"
- **Schema Introspection**: Cannot query `information_schema` directly

---

## Root Cause Analysis

### Potential Causes

1. **Connection String Format Issues**
   - Pooler vs Direct connection string differences
   - Missing SSL/TLS parameters
   - Incorrect port (6543 vs 5432)

2. **Authentication Issues**
   - Password may need URL encoding
   - Special characters in password not escaped
   - Service role key vs database password confusion

3. **Supabase Configuration**
   - Connection pooling mode (transaction vs session)
   - IPv4 vs IPv6 restrictions
   - Database access restrictions

4. **Network/SSL Issues**
   - SSL mode not specified
   - Certificate validation requirements
   - Regional connection restrictions

---

## Diagnostic Steps

### Step 1: Verify Current DATABASE_URL Format

**Current**:
```
postgresql://postgres.hqhtbxlgzysfbekexwku:18eH2SXRL71ZOGMB@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Analysis**:
- Username: `postgres.hqhtbxlgzysfbekexwku` (pooler format)
- Password: `18eH2SXRL71ZOGMB`
- Host: `aws-0-us-west-1.pooler.supabase.com`
- Port: `6543` (pooler port)
- Database: `postgres`

**Action Required**:
1. Verify this exact connection string from Supabase Dashboard
2. Check if password contains special characters that need escaping

**Script to Test**:
```javascript
// File: src/scripts/test-db-connection.js
const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

async function testConnection(connectionString, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Connection string: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);

  const client = new Client({ connectionString });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Test a simple query
    const result = await client.query('SELECT current_database(), current_user, version();');
    console.log('\nConnection Details:');
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  User: ${result.rows[0].current_user}`);
    console.log(`  Version: ${result.rows[0].version.split(',')[0]}`);

    await client.end();
    return { success: true, error: null };
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`  Error: ${error.message}`);
    console.log(`  Code: ${error.code}`);
    if (error.code === 'ENOTFOUND') {
      console.log('  → DNS resolution failed - check hostname');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('  → Connection refused - check port and firewall');
    } else if (error.message.includes('password')) {
      console.log('  → Authentication failed - check username/password');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('  → SSL/TLS issue - may need ssl: true or rejectUnauthorized: false');
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 DATABASE CONNECTION DIAGNOSTIC TOOL');
  console.log('=====================================\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  // Test 1: Current DATABASE_URL as-is
  await testConnection(databaseUrl, 'Current DATABASE_URL (Pooler)');

  // Test 2: Try with SSL mode
  const urlWithSsl = databaseUrl.includes('?')
    ? `${databaseUrl}&sslmode=require`
    : `${databaseUrl}?sslmode=require`;
  await testConnection(urlWithSsl, 'With SSL Mode Required');

  // Test 3: Try direct connection (port 5432)
  const directUrl = databaseUrl
    .replace('.pooler.supabase.com:6543', '.supabase.co:5432')
    .replace('postgres.hqhtbxlgzysfbekexwku', 'postgres');
  await testConnection(directUrl, 'Direct Connection (Port 5432)');

  // Test 4: Direct with SSL
  const directWithSsl = directUrl.includes('?')
    ? `${directUrl}&sslmode=require`
    : `${directUrl}?sslmode=require`;
  await testConnection(directWithSsl, 'Direct Connection with SSL');

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Review which connection method succeeded (if any)');
  console.log('2. Update DATABASE_URL in .env.local with working connection string');
  console.log('3. Document the working configuration in this file');
}

main().catch(console.error);
```

---

### Step 2: Obtain Correct Connection String from Supabase

**Instructions**:

1. **Navigate to Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/hqhtbxlgzysfbekexwku/settings/database
   - Go to: Settings → Database

2. **Connection String Section**:
   - Look for "Connection String" or "Connection Info"
   - You should see multiple formats:
     - **URI** (recommended for scripts)
     - **Connection pooling** (may have different format)
     - **Direct connection**

3. **Copy the EXACT connection strings**:
   - Copy **URI** format
   - Copy **Connection pooling** format (if different)
   - Note any differences in:
     - Hostname (pooler vs direct)
     - Port (6543 vs 5432)
     - Username format

4. **Check for SSL/TLS Requirements**:
   - Look for any notes about SSL mode
   - Check if there's a "Connection parameters" section
   - Note any required query parameters

**Record Below**:
```
Connection String - URI Format:
[PASTE EXACT STRING FROM DASHBOARD]

Connection String - Pooler Format (if different):
[PASTE EXACT STRING FROM DASHBOARD]

Connection String - Direct Format (if available):
[PASTE EXACT STRING FROM DASHBOARD]

Required Parameters (if any):
[LIST ANY REQUIRED PARAMETERS LIKE sslmode=require]
```

---

### Step 3: Test Different Connection Configurations

**Script Location**: `src/scripts/test-db-connection.js`

**Execution**:
```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data\src\scripts
node test-db-connection.js
```

**Expected Output**:
- At least ONE of the four test configurations should succeed
- If ALL fail, proceed to Step 4

**Record Results**:
```
Test 1 - Current DATABASE_URL (Pooler): [SUCCESS/FAILED]
Error (if any):

Test 2 - With SSL Mode Required: [SUCCESS/FAILED]
Error (if any):

Test 3 - Direct Connection (Port 5432): [SUCCESS/FAILED]
Error (if any):

Test 4 - Direct Connection with SSL: [SUCCESS/FAILED]
Error (if any):

WORKING CONFIGURATION (if found):
[PASTE EXACT CONNECTION STRING THAT WORKED]
```

---

### Step 4: Password Verification & Special Character Handling

**Issue**: Database password may contain special characters that need URL encoding

**Current Password**: `18eH2SXRL71ZOGMB`

**Special Characters Check**:
- Look for: `@`, `:`, `/`, `?`, `#`, `&`, `=`, `+`, `%`
- These MUST be URL encoded in connection strings

**URL Encoding Reference**:
```
@ → %40
: → %3A
/ → %2F
? → %3F
# → %23
& → %26
= → %3D
+ → %2B
% → %25
```

**Action**:
1. Examine password for special characters
2. If found, create encoded version
3. Test with encoded password

**Encoded Password (if needed)**:
```
[RECORD ENCODED PASSWORD HERE IF APPLICABLE]
```

---

### Step 5: Alternative Connection Methods

If direct `pg` connection continues to fail, try these alternatives:

#### Option A: Supabase Client with Raw SQL

**Test Script**: `src/scripts/test-supabase-raw-sql.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRawSql() {
  console.log('Testing Supabase client raw SQL execution...\n');

  // Test 1: Simple SELECT
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: 'SELECT current_database(), current_user;'
  });

  if (error) {
    console.log('❌ exec_sql RPC not available:', error.message);
    return false;
  }

  console.log('✅ exec_sql RPC is available!');
  console.log('Result:', data);
  return true;
}

testRawSql().catch(console.error);
```

**Result**: [SUCCESS/FAILED]

#### Option B: Create `exec_sql` Function in Supabase

If `exec_sql` doesn't exist, we can create it:

**SQL to Execute in Supabase Dashboard**:
```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
END;
$$;

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

**Status**: [ATTEMPTED/NOT ATTEMPTED/SUCCESS/FAILED]

---

### Step 6: Network & Firewall Check

**Potential Issues**:
- Corporate firewall blocking port 5432 or 6543
- VPN interference
- Regional restrictions

**Tests**:

1. **Test DNS Resolution**:
```bash
ping aws-0-us-west-1.pooler.supabase.com
```
Result: [SUCCESS/FAILED]

2. **Test Port Connectivity**:
```bash
# Windows PowerShell
Test-NetConnection -ComputerName aws-0-us-west-1.pooler.supabase.com -Port 6543
Test-NetConnection -ComputerName db.hqhtbxlgzysfbekexwku.supabase.co -Port 5432
```
Results:
- Port 6543: [OPEN/CLOSED/TIMEOUT]
- Port 5432: [OPEN/CLOSED/TIMEOUT]

3. **Try from Different Network** (if possible):
- Mobile hotspot
- Different WiFi
- VPN on/off

Result: [TESTED/NOT TESTED] - [SUCCESS/FAILED]

---

## Resolution Path

### Path 1: Fix Direct PostgreSQL Connection (PREFERRED)

**Status**: [ ] In Progress / [ ] Complete / [ ] Blocked

**Steps**:
1. [ ] Obtain correct connection string from Supabase dashboard
2. [ ] Test with diagnostic script
3. [ ] Identify working configuration
4. [ ] Update DATABASE_URL in .env.local
5. [ ] Verify with execute-sql-direct.js
6. [ ] Document working configuration

**Working Configuration** (once found):
```
DATABASE_URL=[PASTE WORKING CONNECTION STRING]

Additional parameters required:
[LIST ANY ADDITIONAL PARAMETERS OR SETTINGS]
```

---

### Path 2: Use Supabase RPC with exec_sql (FALLBACK)

**Status**: [ ] In Progress / [ ] Complete / [ ] Blocked

**Steps**:
1. [ ] Test if exec_sql RPC exists
2. [ ] If not, create exec_sql function in Supabase
3. [ ] Modify execute-sql-direct.js to use Supabase client with exec_sql
4. [ ] Test SQL execution
5. [ ] Document configuration

**Implementation Notes**:
[RECORD ANY IMPLEMENTATION DETAILS]

---

### Path 3: Hybrid Approach (IF NEEDED)

Use Supabase client's `.from().insert()` method instead of raw SQL:

**Status**: [ ] In Progress / [ ] Complete / [ ] Blocked

**Advantages**:
- No SQL parsing needed
- Works with existing verified Supabase client
- Automatic RLS bypass with service role

**Disadvantages**:
- Requires parsing SQL files to extract data
- May not support all SQL features
- More complex implementation

---

## Test Results Log

### Test Run 1: 2025-11-09 (Initial - WRONG Configuration)

**Configuration Tested**:
```
postgresql://postgres.hqhtbxlgzysfbekexwku:18eH2SXRL71ZOGMB@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Result**: FAILED

**Error Message**:
```
Tenant or user not found
```

**Notes**:
- Mixed Session Pooler username format with Transaction Pooler port
- Wrong AWS region (aws-0 vs aws-1)
- Incorrect host format

---

### Test Run 2: 2025-11-09 (CORRECTED - Direct Connection)

**Configuration Tested**:
```
postgresql://postgres:18eH2SXRL71ZOGMB@db.hqhtbxlgzysfbekexwku.supabase.co:5432/postgres
```

**Result**: ✅ SUCCESS

**Connection Details**:
- Connection time: 159ms
- Database: postgres
- User: postgres
- PostgreSQL: 17.4 on aarch64-unknown-linux-gnu
- Public tables: 71

**Notes**:
- Direct Connection method (port 5432)
- Standard postgres username (no .projectref suffix)
- Correct hostname format (db.projectref.supabase.co)
- No SSL mode specified (uses default)

---

### Test Run 2: [DATE/TIME]

**Configuration Tested**:
```
[PASTE CONNECTION STRING OR CONFIGURATION]
```

**Result**: [SUCCESS/FAILED]

**Error Message** (if failed):
```
[PASTE EXACT ERROR]
```

**Notes**:
[ANY OBSERVATIONS]

---

### Test Run 3: [DATE/TIME]

**Configuration Tested**:
```
[PASTE CONNECTION STRING OR CONFIGURATION]
```

**Result**: [SUCCESS/FAILED]

**Error Message** (if failed):
```
[PASTE EXACT ERROR]
```

**Notes**:
[ANY OBSERVATIONS]

---

## Final Resolution

### Working Solution

**Status**: [X] RESOLVED / [ ] BLOCKED

**Method Used**: Path 1 - Direct PostgreSQL Connection

**Final Configuration**:
```
DATABASE_URL=postgresql://postgres:18eH2SXRL71ZOGMB@db.hqhtbxlgzysfbekexwku.supabase.co:5432/postgres

Connection Method: Direct Connection (not pooler)
Port: 5432 (standard PostgreSQL)
Username: postgres (standard format)
Hostname: db.hqhtbxlgzysfbekexwku.supabase.co
SSL Mode: Default (no explicit sslmode parameter needed)
```

**Verification Commands**:
```bash
# Test connection (PASSED ✅)
node src/scripts/test-db-connection.js
# Result: Connected in 159ms, 71 public tables accessible

# Test SQL execution (READY ✅)
node src/scripts/execute-sql-direct.js
# Result: Script ready to execute SQL files

# Test Supabase RPC (OPTIONAL)
node src/scripts/test-supabase-raw-sql.js
# Result: exec_sql RPC not available, but direct connection works
```

**Results**:
```
✅ Direct PostgreSQL Connection: WORKING
✅ Connection Time: 159ms
✅ Database Access: Full (71 tables)
✅ PostgreSQL Version: 17.4
✅ User: postgres
✅ Ready for: execute-sql-direct.js, introspection, migrations

⚠️  exec_sql RPC: Not available (but not needed - direct connection works)
✅ Supabase Client: Working (verified earlier)
```

**Root Cause of Original Failure**:
The original DATABASE_URL was malformed:
- Used Session Pooler username format (`postgres.projectref`)
- But Transaction Pooler port (6543)
- And wrong AWS region host (`aws-0` instead of `aws-1`)
- Mixed multiple connection methods incorrectly

**Solution**: Use proper Direct Connection format from Supabase Dashboard

---

## Hard Block Determination

If all resolution paths fail, document here:

### Criteria for Hard Block

- [ ] All connection string variations tested and failed
- [ ] Network/firewall issues confirmed and cannot be resolved
- [ ] Supabase configuration prevents external connections
- [ ] No RPC or alternative method available
- [ ] Supabase dashboard manual execution is only option

### Hard Block Declaration

**Status**: [ ] NO HARD BLOCK / [ ] HARD BLOCK CONFIRMED

**Reason** (if blocked):
[DETAILED EXPLANATION OF WHY CONNECTION CANNOT BE ESTABLISHED]

**Evidence**:
[LIST ALL TESTS PERFORMED AND RESULTS]

**Cease Message**:
```
⛔ HARD BLOCK - DATABASE CONNECTION CANNOT BE ESTABLISHED

Attempted Methods:
1. [LIST METHOD] - [RESULT]
2. [LIST METHOD] - [RESULT]
3. [LIST METHOD] - [RESULT]

Errors Encountered:
[DETAILED ERROR LOG]

Conclusion:
Direct database manipulation from scripts is not possible in this environment.
Manual execution via Supabase dashboard is required.

Per requirements: No manual workarounds will be provided. Task ceased.
```

---

## Next Steps

Once connection is working:

1. [X] Update all scripts to use working configuration - DONE
2. [X] Test database connection - PASSED
3. [ ] Execute Prompt 3: SQL Inserts (templates + conversations)
4. [ ] Execute Prompt 4: Verification & QA Report
5. [ ] Execute Prompt 5: Rollback testing (if needed)
6. [ ] Document successful execution in QA report

---

## Summary for Prompts 3-6 Execution

**✅ ALL PREREQUISITES MET**

**Connection Status**:
- ✅ Direct PostgreSQL: WORKING (159ms response)
- ✅ Supabase Client: WORKING (verified earlier)
- ✅ Read/Write/Edit: VERIFIED (via supabase-access-test_v2.js)
- ✅ Tables: templates (6 rows), conversations (0 rows)
- ✅ Schema: Fully documented and verified

**Ready Scripts**:
- ✅ `execute-sql-direct.js` - Ready to execute SQL files
- ✅ `verify-data-insertion.js` - Ready to verify data
- ✅ `cursor-db-helper.js` - Working for counts and queries

**Database Access Methods Available**:
1. **Direct PostgreSQL** (pg library) - PRIMARY ✅
2. **Supabase Client** (@supabase/supabase-js) - FALLBACK ✅

**Ready to Proceed**: YES - No hard blocks detected

---

**Document Status**: ✅ RESOLVED - Ready for Prompts 3-6
**Last Updated**: 2025-11-09
**Updated By**: Claude Code Agent
