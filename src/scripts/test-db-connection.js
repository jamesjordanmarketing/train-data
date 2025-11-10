/**
 * Database Connection Diagnostic Tool
 *
 * Tests multiple connection string configurations to identify
 * the working PostgreSQL connection method.
 *
 * Usage: node test-db-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

async function testConnection(connectionString, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${description}`);
  console.log(`${'='.repeat(60)}`);

  // Mask password in output
  const maskedString = connectionString.replace(/:[^:@]+@/, ':***@');
  console.log(`Connection string: ${maskedString}`);

  const client = new Client({ connectionString });

  try {
    console.log('⏳ Attempting to connect...');
    const startTime = Date.now();

    await client.connect();

    const duration = Date.now() - startTime;
    console.log(`✅ Connected successfully! (${duration}ms)`);

    // Test a simple query
    const result = await client.query('SELECT current_database(), current_user, version();');
    console.log('\n📊 Connection Details:');
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  User: ${result.rows[0].current_user}`);
    console.log(`  PostgreSQL: ${result.rows[0].version.split(',')[0]}`);

    // Test table access
    const tableTest = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`  Public tables: ${tableTest.rows[0].count}`);

    await client.end();

    console.log('\n✅ ALL TESTS PASSED');
    return { success: true, error: null, duration };

  } catch (error) {
    console.log(`❌ Connection failed!`);
    console.log(`\n🔍 Error Details:`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Code: ${error.code || 'N/A'}`);

    // Provide diagnostic hints
    console.log(`\n💡 Diagnostic Hints:`);

    if (error.code === 'ENOTFOUND') {
      console.log('  → DNS resolution failed');
      console.log('  → Check if hostname is correct');
      console.log('  → Verify internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('  → Connection refused by server');
      console.log('  → Check if port is correct (5432 vs 6543)');
      console.log('  → Verify firewall settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('  → Connection timed out');
      console.log('  → Check network/firewall');
      console.log('  → Try different network (VPN on/off)');
    } else if (error.message.includes('password')) {
      console.log('  → Authentication failed');
      console.log('  → Verify username and password');
      console.log('  → Check for special characters needing encoding');
    } else if (error.message.includes('Tenant or user not found')) {
      console.log('  → Supabase pooler authentication issue');
      console.log('  → Try direct connection (port 5432) instead');
      console.log('  → Verify username format (postgres vs postgres.projectref)');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('  → SSL/TLS configuration issue');
      console.log('  → Try adding: ?sslmode=require');
      console.log('  → Or: ssl: { rejectUnauthorized: false }');
    } else {
      console.log('  → Unknown error type');
      console.log('  → Check full error message above');
    }

    return { success: false, error: error.message, code: error.code };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DATABASE CONNECTION DIAGNOSTIC TOOL');
  console.log('='.repeat(60));
  console.log('\nThis tool tests multiple connection configurations');
  console.log('to identify the working PostgreSQL connection method.\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.error('\nPlease add DATABASE_URL to:');
    console.error('  C:\\Users\\james\\Master\\BrightHub\\BRun\\train-data\\.env.local');
    process.exit(1);
  }

  // Parse current DATABASE_URL
  console.log('📋 Current DATABASE_URL Configuration:');
  try {
    const url = new URL(databaseUrl.replace('postgresql://', 'http://'));
    console.log(`  Username: ${url.username}`);
    console.log(`  Password: ${'*'.repeat(url.password.length)} (${url.password.length} chars)`);
    console.log(`  Hostname: ${url.hostname}`);
    console.log(`  Port: ${url.port || '5432 (default)'}`);
    console.log(`  Database: ${url.pathname.substring(1)}`);
    console.log(`  Parameters: ${url.search || 'none'}`);
  } catch (err) {
    console.log(`  ⚠️  Could not parse URL: ${err.message}`);
  }

  const results = [];

  // Test 1: Current DATABASE_URL as-is
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 1: Current DATABASE_URL (as configured)');
  console.log('═'.repeat(60));
  results.push({
    test: 'Current DATABASE_URL',
    result: await testConnection(databaseUrl, 'Current DATABASE_URL')
  });

  // Test 2: With SSL mode required
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: Current DATABASE_URL + SSL Required');
  console.log('═'.repeat(60));
  const urlWithSsl = databaseUrl.includes('?')
    ? `${databaseUrl}&sslmode=require`
    : `${databaseUrl}?sslmode=require`;
  results.push({
    test: 'With SSL Required',
    result: await testConnection(urlWithSsl, 'With SSL Mode Required')
  });

  // Test 3: Direct connection (port 5432) if currently using pooler
  if (databaseUrl.includes('pooler') || databaseUrl.includes('6543')) {
    console.log('\n' + '═'.repeat(60));
    console.log('TEST 3: Direct Connection (Port 5432)');
    console.log('═'.repeat(60));

    let directUrl = databaseUrl
      .replace('.pooler.supabase.com', '.supabase.co')
      .replace(':6543', ':5432');

    // Fix username for direct connection (remove .projectref)
    if (directUrl.includes('postgres.')) {
      directUrl = directUrl.replace(/postgres\.[^:]+/, 'postgres');
    }

    results.push({
      test: 'Direct Connection',
      result: await testConnection(directUrl, 'Direct Connection (Port 5432)')
    });

    // Test 4: Direct with SSL
    console.log('\n' + '═'.repeat(60));
    console.log('TEST 4: Direct Connection + SSL Required');
    console.log('═'.repeat(60));
    const directWithSsl = directUrl.includes('?')
      ? `${directUrl}&sslmode=require`
      : `${directUrl}?sslmode=require`;
    results.push({
      test: 'Direct with SSL',
      result: await testConnection(directWithSsl, 'Direct Connection with SSL')
    });
  }

  // Test 5: Try with disable SSL (for testing only)
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 5: With SSL Disabled (testing only)');
  console.log('═'.repeat(60));
  const urlNoSsl = databaseUrl.includes('?')
    ? `${databaseUrl}&sslmode=disable`
    : `${databaseUrl}?sslmode=disable`;
  results.push({
    test: 'SSL Disabled',
    result: await testConnection(urlNoSsl, 'With SSL Disabled')
  });

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(60));

  const successfulTests = results.filter(r => r.result.success);
  const failedTests = results.filter(r => !r.result.success);

  console.log(`\nTotal tests: ${results.length}`);
  console.log(`✅ Successful: ${successfulTests.length}`);
  console.log(`❌ Failed: ${failedTests.length}\n`);

  if (successfulTests.length > 0) {
    console.log('✅ WORKING CONFIGURATIONS:');
    successfulTests.forEach(test => {
      console.log(`  ✓ ${test.test} (${test.result.duration}ms)`);
    });

    console.log('\n🎯 RECOMMENDATION:');
    console.log(`  Use configuration: ${successfulTests[0].test}`);
    console.log(`  Update .env.local with the working connection string`);

  } else {
    console.log('❌ NO WORKING CONFIGURATIONS FOUND');
    console.log('\n🔍 All connection attempts failed. Possible issues:');
    console.log('  1. Incorrect password or username');
    console.log('  2. Firewall blocking PostgreSQL ports');
    console.log('  3. Database not accessible from this network');
    console.log('  4. Supabase project configuration restricts connections');

    console.log('\n📝 Next Steps:');
    console.log('  1. Verify DATABASE_URL from Supabase Dashboard');
    console.log('  2. Check Supabase → Settings → Database → Connection String');
    console.log('  3. Copy exact connection string (URI format)');
    console.log('  4. Try from different network if possible');
    console.log('  5. Contact Supabase support if issue persists');
  }

  if (failedTests.length > 0) {
    console.log('\n❌ FAILED CONFIGURATIONS:');
    failedTests.forEach(test => {
      console.log(`  ✗ ${test.test}`);
      console.log(`    Error: ${test.result.error}`);
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('Document results in:');
  console.log('  pmc/context-ai/pmct/mock-data-execution-prompt-connection-issues_v1.md');
  console.log('═'.repeat(60) + '\n');

  // Exit code based on results
  process.exit(successfulTests.length > 0 ? 0 : 1);
}

// Run
main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
