# AI Configuration System

## Overview

The AI Configuration Foundation provides fine-grained control over Claude API parameters, rate limiting, retry strategies, cost management, and model selection at user and organization levels.

## Features

- **Hierarchical Configuration**: User DB → Organization DB → Environment Variables → Defaults
- **Complete AI Control**: Temperature, max tokens, top-p, streaming, model selection
- **Rate Limiting**: Requests per minute, concurrent requests, burst allowance
- **Retry Strategies**: Exponential, linear, or fixed backoff with configurable delays
- **Cost Management**: Daily/weekly/monthly budgets with alert thresholds
- **API Key Management**: Primary/secondary keys with rotation support
- **Timeout Configuration**: Generation, connection, and total request timeouts
- **Caching**: 5-minute TTL for configuration cache
- **Audit Trail**: Automatic logging of all configuration changes

## Architecture

### Type Definitions (`src/lib/types/ai-config.ts`)

```typescript
export interface AIConfiguration {
  model: ModelConfiguration;
  rateLimiting: RateLimitConfiguration;
  retryStrategy: RetryStrategyConfiguration;
  costBudget: CostBudgetConfiguration;
  apiKeys: APIKeyConfiguration;
  timeouts: TimeoutConfiguration;
  capabilities?: ModelCapabilities;
}
```

### Service Layer (`src/lib/services/ai-config-service.ts`)

Singleton service providing:
- `getEffectiveConfiguration(userId)`: Get configuration with fallback chain
- `updateConfiguration(userId, configName, updates)`: Update user configuration
- `deleteConfiguration(userId, configName)`: Delete configuration
- `getUserConfigurations(userId)`: Get all user configurations
- `toggleConfiguration(configId, isActive)`: Enable/disable configuration
- `rotateAPIKey(userId, newKey)`: Rotate API keys

### API Routes

#### GET `/api/ai-configuration`
Get effective configuration and user configurations.

**Response:**
```json
{
  "effective": {
    "model": {
      "model": "claude-sonnet-4-5-20250929",
      "temperature": 0.7,
      "maxTokens": 4096,
      "topP": 0.9,
      "streaming": false
    },
    "rateLimiting": { ... },
    "retryStrategy": { ... },
    "costBudget": { ... },
    "apiKeys": { ... },
    "timeouts": { ... }
  },
  "userConfigurations": [ ... ]
}
```

#### PATCH `/api/ai-configuration`
Update user configuration.

**Request:**
```json
{
  "configName": "default",
  "updates": {
    "model": {
      "temperature": 0.9
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

#### DELETE `/api/ai-configuration`
Delete user configuration (revert to defaults).

**Request:**
```json
{
  "configName": "default"
}
```

#### POST `/api/ai-configuration/rotate-key`
Rotate API key.

**Request:**
```json
{
  "newPrimaryKey": "sk-ant-..."
}
```

## Usage Examples

### Get Configuration in API Route

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { aiConfigService } from '@/lib/services/ai-config-service';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get effective configuration for user
  const config = await aiConfigService.getEffectiveConfiguration(user.id);
  
  // Use configuration for AI generation
  const response = await anthropic.messages.create({
    model: config.model.model,
    temperature: config.model.temperature,
    max_tokens: config.model.maxTokens,
    // ... other parameters
  });
}
```

### Get Configuration with Legacy Function

```typescript
import { getAIConfigForUser } from '@/lib/ai-config';

// With user ID
const config = await getAIConfigForUser(userId);

// Without user ID (uses environment/defaults)
const config = await getAIConfigForUser();
```

### Update Configuration

```typescript
import { aiConfigService } from '@/lib/services/ai-config-service';

const result = await aiConfigService.updateConfiguration(
  userId,
  'default',
  {
    model: {
      temperature: 0.9,
      maxTokens: 2048
    },
    costBudget: {
      dailyBudget: 50.0,
      weeklyBudget: 300.0,
      monthlyBudget: 1000.0,
      alertThresholds: [0.5, 0.75, 0.9]
    }
  }
);

if (!result.success) {
  console.error('Validation errors:', result.errors);
}
```

### Calculate Cost

```typescript
import { calculateCost } from '@/lib/types/ai-config';

const cost = calculateCost(
  1000, // input tokens
  500,  // output tokens
  'claude-sonnet-4-5-20250929'
);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

## Database Setup

### Migration Required

You need to apply a database migration to create the following:

1. **Table: `ai_configurations`**
   - `id` (uuid, primary key)
   - `user_id` (uuid, nullable, foreign key to auth.users)
   - `organization_id` (uuid, nullable)
   - `config_name` (text)
   - `configuration` (jsonb)
   - `is_active` (boolean)
   - `priority` (integer)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `created_by` (uuid)
   - Constraint: Either `user_id` OR `organization_id` (not both)
   - Unique: (`user_id`, `config_name`)

2. **Table: `ai_configuration_audit`**
   - Tracks all configuration changes
   - `id`, `config_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`

3. **Function: `get_effective_ai_config(p_user_id uuid)`**
   - Implements fallback chain resolution
   - Returns merged configuration from user → org → defaults

4. **Triggers**
   - `audit_ai_config_changes`: Logs changes to audit table

### Example Migration

```sql
-- Create ai_configurations table
CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  config_name TEXT NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  CONSTRAINT user_or_org_only CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  ),
  UNIQUE(user_id, config_name)
);

-- Create audit table
CREATE TABLE IF NOT EXISTS ai_configuration_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES ai_configurations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configuration_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own configs"
  ON ai_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configs"
  ON ai_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs"
  ON ai_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs"
  ON ai_configurations FOR DELETE
  USING (auth.uid() = user_id);
```

## Environment Variables

The system supports the following environment variables for fallback configuration:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (defaults shown)
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
ANTHROPIC_TEMPERATURE=0.7
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_API_BASE_URL=https://api.anthropic.com/v1
```

## Configuration Fallback Chain

1. **User Database Configuration**: User-specific settings from `ai_configurations` table
2. **Organization Database Configuration**: Organization-wide settings
3. **Environment Variables**: From `.env` or deployment environment
4. **Default Configuration**: Hard-coded defaults in `DEFAULT_AI_CONFIGURATION`

## Validation

The system validates all configuration updates:

- Temperature: 0.0 - 1.0
- Max Tokens: 1 - 4096
- Top P: 0.0 - 1.0
- Rate Limiting: Positive integers
- Retry Strategy: Max retries 0-10, positive delays
- Cost Budgets: Non-negative, hierarchical (daily ≤ weekly ≤ monthly)
- Alert Thresholds: 0.0 - 1.0

## Available Models

| Model | Context Window | Output Limit | Input Cost (per 1K) | Output Cost (per 1K) |
|-------|---------------|--------------|---------------------|----------------------|
| claude-sonnet-4-5-20250929 | 200K | 4096 | $0.003 | $0.015 |
| claude-3-5-sonnet-20241022 | 200K | 8192 | $0.003 | $0.015 |
| claude-3-opus-20240229 | 200K | 4096 | $0.015 | $0.075 |
| claude-3-haiku-20240307 | 200K | 4096 | $0.00025 | $0.00125 |

## Testing

### Manual Testing Checklist

1. **Create Configuration**
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
   ```

2. **Get Configuration**
   ```bash
   curl http://localhost:3000/api/ai-configuration \
     -H "Cookie: your-auth-cookie"
   ```

3. **Test Validation**
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
   # Should return 400 with validation error
   ```

4. **Delete Configuration**
   ```bash
   curl -X DELETE http://localhost:3000/api/ai-configuration \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{
       "configName": "default"
     }'
   ```

5. **Rotate API Key**
   ```bash
   curl -X POST http://localhost:3000/api/ai-configuration/rotate-key \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{
       "newPrimaryKey": "sk-ant-new-key"
     }'
   ```

## Integration with Existing Code

The new system is backward compatible with existing code. The legacy `AI_CONFIG` object continues to work, and a new `getAIConfigForUser()` function provides access to the full configuration system:

```typescript
// Legacy (still works)
import { AI_CONFIG } from '@/lib/ai-config';
console.log(AI_CONFIG.apiKey);

// New (with user context)
import { getAIConfigForUser } from '@/lib/ai-config';
const config = await getAIConfigForUser(userId);
console.log(config.apiKeys.primaryKey);
```

## Performance

- **Caching**: 5-minute TTL reduces database queries
- **Database Function**: Efficient fallback resolution in a single query
- **RLS Policies**: Row-level security enforces data isolation
- **JSONB Storage**: Flexible configuration without schema changes

## Security

- **Supabase Vault**: API keys can be encrypted using Supabase Vault
- **RLS Policies**: Users can only access their own configurations
- **Audit Trail**: All changes are logged with user ID and timestamp
- **API Key Rotation**: Supports seamless key rotation with secondary key
- **Environment Fallback**: Ensures generation never fails due to missing config

## Future Enhancements

- Organization-level configurations
- Configuration templates
- Real-time configuration updates via WebSockets
- Advanced cost tracking and alerts
- Model performance analytics
- A/B testing support for different configurations

