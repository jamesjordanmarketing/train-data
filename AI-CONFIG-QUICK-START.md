# AI Configuration System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Apply Database Migration (2 minutes)

1. Open Supabase SQL Editor
2. Copy and paste contents of `src/lib/services/ai-config-migration.sql`
3. Click "Run"
4. Verify success message appears

**Verification**:
```sql
-- Check tables exist
SELECT COUNT(*) FROM ai_configurations;
SELECT COUNT(*) FROM ai_configuration_audit;

-- Test function
SELECT get_effective_ai_config(auth.uid());
```

### Step 2: Test API Endpoints (3 minutes)

#### Test 1: Get Configuration
```bash
# Using your authenticated session
curl http://localhost:3000/api/ai-configuration \
  -H "Cookie: your-auth-cookie"

# Expected: 200 OK with effective config
```

#### Test 2: Update Configuration
```bash
curl -X PATCH http://localhost:3000/api/ai-configuration \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "configName": "default",
    "updates": {
      "model": {
        "temperature": 0.9
      }
    }
  }'

# Expected: { "success": true }
```

#### Test 3: Verify Update
```bash
curl http://localhost:3000/api/ai-configuration \
  -H "Cookie: your-auth-cookie"

# Expected: temperature should now be 0.9
```

#### Test 4: Test Validation
```bash
curl -X PATCH http://localhost:3000/api/ai-configuration \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "configName": "default",
    "updates": {
      "model": {
        "temperature": 1.5
      }
    }
  }'

# Expected: 400 Bad Request with validation error
```

---

## 💡 Common Usage Patterns

### Pattern 1: Get User Config in API Route

```typescript
import { aiConfigService } from '@/lib/services/ai-config-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get config with fallback chain
  const config = await aiConfigService.getEffectiveConfiguration(user.id);
  
  // Use config
  const response = await anthropic.messages.create({
    model: config.model.model,
    temperature: config.model.temperature,
    max_tokens: config.model.maxTokens,
  });
}
```

### Pattern 2: Update User Temperature

```typescript
import { aiConfigService } from '@/lib/services/ai-config-service';

const result = await aiConfigService.updateConfiguration(
  userId,
  'default',
  {
    model: {
      temperature: 0.9
    }
  }
);

if (result.success) {
  console.log('Configuration updated');
} else {
  console.error('Errors:', result.errors);
}
```

### Pattern 3: Calculate Generation Cost

```typescript
import { calculateCost } from '@/lib/types/ai-config';

const inputTokens = 1000;
const outputTokens = 500;
const model = 'claude-sonnet-4-5-20250929';

const cost = calculateCost(inputTokens, outputTokens, model);
console.log(`Estimated cost: $${cost.toFixed(4)}`);
// Output: Estimated cost: $0.0105
```

### Pattern 4: Legacy Integration

```typescript
// Old way (still works)
import { AI_CONFIG } from '@/lib/ai-config';
const apiKey = AI_CONFIG.apiKey;

// New way (with user context)
import { getAIConfigForUser } from '@/lib/ai-config';
const config = await getAIConfigForUser(userId);
const apiKey = config.apiKeys.primaryKey;
```

---

## 🎯 Testing Scenarios

### Scenario 1: User Override
1. Set user temperature to 0.8
2. Generate conversation
3. Verify Claude API called with temperature 0.8
4. Check audit log for configuration change

### Scenario 2: Fallback Chain
1. No user configuration exists
2. Generate conversation
3. Verify uses environment variable or default (0.7)

### Scenario 3: Configuration Deletion
1. Create user configuration with temperature 0.9
2. Delete user configuration
3. Generate conversation
4. Verify reverts to default temperature

### Scenario 4: Validation
1. Try to set temperature to 1.5 (invalid)
2. Verify receives 400 error
3. Verify error message: "Temperature must be between 0 and 1"

### Scenario 5: Cost Budget
1. Set daily budget to $10.00
2. Set alert thresholds at [0.5, 0.75, 0.9]
3. Track spending against budget
4. Verify alerts trigger at correct thresholds

---

## 🔍 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Ensure you're sending authentication cookie or token

### Issue: get_effective_ai_config function not found
**Solution**: Run the migration SQL script

### Issue: RLS policy violation
**Solution**: Verify user is authenticated and accessing own configs

### Issue: Configuration not taking effect
**Solution**: Cache TTL is 5 minutes, wait or manually clear cache

### Issue: Type errors in IDE
**Solution**: Restart TypeScript server or run `npm run build`

---

## 📊 Configuration Defaults

```typescript
{
  model: {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    streaming: false
  },
  rateLimiting: {
    requestsPerMinute: 50,
    concurrentRequests: 3,
    burstAllowance: 10
  },
  retryStrategy: {
    maxRetries: 3,
    backoffType: 'exponential',
    baseDelay: 1000,
    maxDelay: 16000
  },
  costBudget: {
    dailyBudget: 100.0,
    weeklyBudget: 500.0,
    monthlyBudget: 2000.0,
    alertThresholds: [0.5, 0.75, 0.9]
  },
  timeouts: {
    generationTimeout: 60000,
    connectionTimeout: 10000,
    totalRequestTimeout: 120000
  }
}
```

---

## 🎨 Example: Frontend Configuration Form

```typescript
// Update user configuration from frontend
async function updateAIConfig(updates: Partial<AIConfiguration>) {
  const response = await fetch('/api/ai-configuration', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      configName: 'default',
      updates
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Configuration updated!');
  } else {
    alert(`Errors: ${result.errors.join(', ')}`);
  }
}

// Usage
updateAIConfig({
  model: {
    temperature: 0.9,
    maxTokens: 2048
  }
});
```

---

## 📈 Monitoring

### Check Configuration Cache
```typescript
// Service layer handles caching automatically
// Cache TTL: 5 minutes
// Cache key format: `user:${userId}`
```

### View Audit Log
```sql
SELECT 
  action,
  old_value->'model'->>'temperature' as old_temp,
  new_value->'model'->>'temperature' as new_temp,
  changed_at
FROM ai_configuration_audit
WHERE changed_by = auth.uid()
ORDER BY changed_at DESC;
```

### Cost Tracking
```sql
-- Track daily spending (requires additional implementation)
SELECT 
  DATE(created_at) as day,
  SUM(input_tokens * 0.003/1000 + output_tokens * 0.015/1000) as cost
FROM generation_logs
WHERE user_id = auth.uid()
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

---

## ✅ Pre-Launch Checklist

- [ ] Database migration applied
- [ ] Tables created (ai_configurations, ai_configuration_audit)
- [ ] RLS policies active
- [ ] Function get_effective_ai_config works
- [ ] API endpoints respond correctly
- [ ] Authentication required for all endpoints
- [ ] Validation prevents invalid values
- [ ] Cache works (5-minute TTL)
- [ ] Audit log captures changes
- [ ] Environment variables loaded
- [ ] Legacy code still works
- [ ] No TypeScript errors
- [ ] No linter errors

---

## 🔗 Quick Links

- **Full Documentation**: `src/lib/services/AI-CONFIG-README.md`
- **Implementation Summary**: `IMPLEMENTATION-SUMMARY-AI-CONFIG.md`
- **Database Migration**: `src/lib/services/ai-config-migration.sql`
- **Type Definitions**: `src/lib/types/ai-config.ts`
- **Service Layer**: `src/lib/services/ai-config-service.ts`
- **API Routes**: `src/app/api/ai-configuration/route.ts`

---

## 🎓 Key Concepts

### Fallback Chain
User DB → Org DB → Environment → Defaults

### Configuration Validation
All updates validated before saving

### Caching Strategy
5-minute TTL reduces database load

### Audit Trail
Every change logged automatically

### Security
RLS ensures users only access own configs

---

## 📞 Need Help?

1. Check error messages in API responses
2. Review database logs for SQL errors
3. Verify authentication is working
4. Ensure migration was applied correctly
5. Check environment variables are set
6. Review type definitions for correct structure
7. Test with simple configuration first

---

**Last Updated**: October 31, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

