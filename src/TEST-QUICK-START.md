# Test Suite Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd src
npm install
```

### 2. Run All Tests

```bash
npm test
```

Expected output:
```
PASS  lib/services/__tests__/conversation-service.test.ts
  ✓ should create conversation with turns (124ms)
  ✓ should rollback on failure (89ms)
  ...

PASS  app/api/conversations/__tests__/generate.integration.test.ts
  ✓ should generate conversation (2341ms)
  ...

Test Suites: 5 passed, 5 total
Tests:       70 passed, 70 total
Time:        18.342s
```

### 3. Check Coverage

```bash
npm run test:coverage
```

Expected output:
```
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   82.5  |   78.3   |   85.1  |   82.1  |
 services/                      |   87.2  |   82.5   |   90.3  |   86.8  |
  conversation-service.ts       |   92.1  |   88.2   |   95.4  |   91.7  |
  batch-generation-service.ts   |   85.3  |   79.8   |   87.2  |   84.9  |
  ...
```

### 4. Run E2E Tests

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║        End-to-End Tests - Interactive LoRA Platform       ║
╚════════════════════════════════════════════════════════════╝

🧪 Testing: Single Generation Workflow
✅ Step 1: Create a template
✅ Step 2: Generate single conversation
✅ Step 3: Fetch generated conversation
✅ Step 4: Update conversation status
✅ Step 5: Export conversation

✅ All E2E tests completed!
```

### 5. Run Performance Tests

```bash
# With server running from step 4
npm run test:performance
```

Expected output:
```
⏱️  Benchmarking: Single Conversation Generation
   Avg Duration: 8547.23ms
   P95 Duration: 9234.12ms
   ✅ PASS (threshold: 10000ms)

⏱️  Benchmarking: Get All Conversations (100 items)
   Avg Duration: 347.89ms
   ✅ PASS (threshold: 500ms)

✅ Performance tests completed!
```

---

## 📝 Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run E2E workflows |
| `npm run test:performance` | Run performance benchmarks |

---

## 🐛 Troubleshooting

### Issue: Tests timeout

**Solution:**
```bash
# Increase timeout in jest.config.js
testTimeout: 30000  // 30 seconds
```

### Issue: E2E tests fail with "Server not reachable"

**Solution:**
```bash
# Make sure server is running
npm run dev

# Check BASE_URL
export BASE_URL=http://localhost:3000
npm run test:e2e
```

### Issue: Coverage not generating

**Solution:**
```bash
# Clear cache and regenerate
rm -rf coverage/
npm run test:coverage
```

---

## 📊 Understanding Test Results

### Unit Test Output
```
✓ should create conversation with turns (124ms)
  ✓ Test passed
  124ms = execution time
```

### Coverage Output
```
| % Stmts | % Branch | % Funcs | % Lines |
|---------|----------|---------|---------|
|   87.2  |   82.5   |   90.3  |   86.8  |

Stmts   = Statement coverage
Branch  = Branch coverage (if/else)
Funcs   = Function coverage
Lines   = Line coverage
```

### Performance Output
```
Avg Duration: 347.89ms    ← Average execution time
Min Duration: 298.45ms    ← Fastest execution
Max Duration: 412.87ms    ← Slowest execution
P95 Duration: 395.12ms    ← 95th percentile
Avg Memory: 12.45 MB      ← Memory usage
✅ PASS (threshold: 500ms) ← Pass/Fail status
```

---

## 🎯 Quick Validation

Run this to validate everything works:

```bash
# Full validation (takes ~2 minutes)
npm install && \
npm test && \
npm run test:coverage && \
echo "✅ All tests passed!"
```

For E2E and performance tests:

```bash
# In terminal 1
npm run dev

# In terminal 2
npm run test:e2e && npm run test:performance
```

---

## 📚 Next Steps

1. Read full documentation: `TESTING.md`
2. Review deliverables: `PROMPT-7-TEST-SUITE-DELIVERABLES.md`
3. Explore test files in `__tests__/` directories
4. Run tests before commits
5. Maintain 80%+ coverage

---

**Need Help?** See `TESTING.md` for detailed documentation.

**All Tests Passing?** You're ready to deploy! 🚀

