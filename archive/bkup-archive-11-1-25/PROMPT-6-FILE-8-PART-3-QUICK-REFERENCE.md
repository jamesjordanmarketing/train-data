# AI Configuration Settings UI - Quick Reference Guide

## Quick Access

**Location**: User Menu → AI Configuration  
**Component**: `train-wireframe/src/components/views/AIConfigView.tsx`  
**Route**: `currentView = 'ai-config'`

## Component Overview

```typescript
import { AIConfigView } from './components/views/AIConfigView';

// Usage in App.tsx
case 'ai-config':
  return <AIConfigView />;
```

## Configuration Structure

```typescript
interface AIConfiguration {
  model: {
    model: string;           // Claude model name
    temperature: number;     // 0.0-1.0
    maxTokens: number;       // 1-4096
    topP: number;            // 0.0-1.0
    streaming: boolean;      // Enable streaming
  };
  rateLimiting: {
    requestsPerMinute: number;    // 1-1000
    concurrentRequests: number;   // 1-20
    burstAllowance: number;       // 0-100
  };
  retryStrategy: {
    maxRetries: number;           // 0-10
    backoffType: BackoffStrategy; // 'exponential' | 'linear' | 'fixed'
    baseDelay: number;            // milliseconds
    maxDelay: number;             // milliseconds
  };
  costBudget: {
    dailyBudget: number;          // USD
    weeklyBudget: number;         // USD
    monthlyBudget: number;        // USD
    alertThresholds: number[];    // [0.5, 0.75, 0.9]
  };
  apiKeys: {
    primaryKey: string;
    secondaryKey?: string;
    keyVersion: number;
    rotationSchedule?: 'manual' | 'monthly' | 'quarterly';
  };
  timeouts: {
    generationTimeout: number;    // milliseconds
    connectionTimeout: number;    // milliseconds
    totalRequestTimeout: number;  // milliseconds
  };
}
```

## Tab Quick Reference

### Tab 1: Model Configuration
**Purpose**: Configure Claude model and generation parameters

**Key Controls**:
```typescript
// Model Selection
<Select value={model} onValueChange={updateModel}>
  {AVAILABLE_MODELS.map(model => ...)}
</Select>

// Temperature (0-1)
<Slider min={0} max={1} step={0.05} value={temperature} />

// Max Tokens (1-4096)
<Input type="number" min={1} max={4096} value={maxTokens} />

// Top P (0-1)
<Slider min={0} max={1} step={0.05} value={topP} />

// Streaming Toggle
<Switch checked={streaming} onCheckedChange={updateStreaming} />
```

**Cost Estimation**:
```typescript
const estimatedCost = 
  (modelCapabilities.costPer1kInputTokens * 2) + 
  (modelCapabilities.costPer1kOutputTokens * (maxTokens / 1000));
```

### Tab 2: Rate Limiting & Retry
**Purpose**: Control API request rates and retry behavior

**Rate Limiting**:
```typescript
// Requests per minute (1-1000)
<Input type="number" min={1} max={1000} value={requestsPerMinute} />

// Concurrent requests (1-20)
<Input type="number" min={1} max={20} value={concurrentRequests} />

// Burst allowance (0-100)
<Input type="number" min={0} max={100} value={burstAllowance} />
```

**Retry Strategy**:
```typescript
// Max retries (0-10)
<Input type="number" min={0} max={10} value={maxRetries} />

// Backoff type
<Select value={backoffType}>
  <SelectItem value="exponential">Exponential</SelectItem>
  <SelectItem value="linear">Linear</SelectItem>
  <SelectItem value="fixed">Fixed</SelectItem>
</Select>

// Base delay (100-60000ms)
<Input type="number" min={100} max={60000} step={100} value={baseDelay} />

// Max delay (1000-300000ms)
<Input type="number" min={1000} max={300000} step={1000} value={maxDelay} />
```

**Backoff Calculation**:
```typescript
const calculateBackoffDelays = (): number[] => {
  const delays: number[] = [];
  for (let i = 0; i < maxRetries; i++) {
    let delay: number;
    switch (backoffType) {
      case 'exponential':
        delay = Math.min(baseDelay * Math.pow(2, i), maxDelay);
        break;
      case 'linear':
        delay = Math.min(baseDelay * (i + 1), maxDelay);
        break;
      case 'fixed':
        delay = baseDelay;
        break;
    }
    delays.push(delay);
  }
  return delays;
};
```

### Tab 3: Cost Management
**Purpose**: Set spending limits and budget alerts

**Budget Controls**:
```typescript
// Daily budget
<Input type="number" min={0} step={0.01} value={dailyBudget} />

// Weekly budget
<Input type="number" min={0} step={0.01} value={weeklyBudget} />

// Monthly budget
<Input type="number" min={0} step={0.01} value={monthlyBudget} />

// Alert thresholds (0-1)
{alertThresholds.map((threshold, index) => (
  <Slider 
    min={0} 
    max={1} 
    step={0.05} 
    value={[threshold]}
    onValueChange={([value]) => updateThreshold(index, value)}
  />
))}
```

**Validation**:
- `monthlyBudget >= weeklyBudget >= dailyBudget`
- All budgets >= 0
- Alert thresholds between 0-1

### Tab 4: API Keys
**Purpose**: Manage Claude API keys and rotation

**Key Controls**:
```typescript
// Primary key (masked)
<Input 
  type={showPrimaryKey ? 'text' : 'password'} 
  value={primaryKey}
  placeholder="sk-ant-..."
/>

// Secondary key (optional, masked)
<Input 
  type={showSecondaryKey ? 'text' : 'password'} 
  value={secondaryKey}
  placeholder="sk-ant-..."
/>

// Key version (read-only)
<Input type="number" value={keyVersion} disabled />

// Rotation schedule
<Select value={rotationSchedule}>
  <SelectItem value="manual">Manual</SelectItem>
  <SelectItem value="monthly">Monthly</SelectItem>
  <SelectItem value="quarterly">Quarterly</SelectItem>
</Select>
```

**Security Notes**:
- Keys are encrypted at rest
- Display uses password masking
- Show/hide toggles for editing
- No console logging

### Tab 5: Timeouts
**Purpose**: Configure timeout values for API operations

**Timeout Controls**:
```typescript
// Generation timeout (1s-10min)
<Input 
  type="number" 
  min={1000} 
  max={600000} 
  step={1000} 
  value={generationTimeout} 
/>

// Connection timeout (1s-60s)
<Input 
  type="number" 
  min={1000} 
  max={60000} 
  step={1000} 
  value={connectionTimeout} 
/>

// Total request timeout (1s-15min)
<Input 
  type="number" 
  min={1000} 
  max={900000} 
  step={1000} 
  value={totalRequestTimeout} 
/>
```

**Timeout Types**:
- **Connection**: Time to establish initial connection
- **Generation**: Time for Claude to generate response
- **Total**: Maximum time for complete request (includes retries)

## State Management

### Component State:
```typescript
const [effectiveConfig, setEffectiveConfig] = useState<AIConfiguration | null>(null);
const [configDraft, setConfigDraft] = useState<Partial<AIConfiguration>>({});
const [isLoading, setIsLoading] = useState(true);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [validationErrors, setValidationErrors] = useState<string[]>([]);
const [showHistory, setShowHistory] = useState(false);
const [changeHistory, setChangeHistory] = useState<ChangeHistoryEntry[]>([]);
```

### Update Pattern:
```typescript
const updateDraft = (updates: Partial<AIConfiguration>) => {
  setConfigDraft(prev => {
    const newDraft = { ...prev };
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof AIConfiguration;
      if (updates[typedKey] && typeof updates[typedKey] === 'object') {
        newDraft[typedKey] = {
          ...(prev[typedKey] as any || {}),
          ...(updates[typedKey] as any)
        } as any;
      } else {
        newDraft[typedKey] = updates[typedKey] as any;
      }
    });
    return newDraft;
  });
};
```

### Display Config (Computed):
```typescript
const displayConfig: AIConfiguration = {
  model: { ...effectiveConfig.model, ...(configDraft.model || {}) },
  rateLimiting: { ...effectiveConfig.rateLimiting, ...(configDraft.rateLimiting || {}) },
  retryStrategy: { ...effectiveConfig.retryStrategy, ...(configDraft.retryStrategy || {}) },
  costBudget: { ...effectiveConfig.costBudget, ...(configDraft.costBudget || {}) },
  apiKeys: { ...effectiveConfig.apiKeys, ...(configDraft.apiKeys || {}) },
  timeouts: { ...effectiveConfig.timeouts, ...(configDraft.timeouts || {}) }
};
```

## API Integration

### Load Configuration:
```typescript
const loadConfiguration = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('/api/ai-configuration');
    if (!response.ok) throw new Error('Failed to fetch configuration');
    const data = await response.json();
    setEffectiveConfig(data.effective || data);
    setIsLoading(false);
  } catch (error) {
    console.error('Failed to load AI configuration:', error);
    setIsLoading(false);
  }
};
```

### Save Configuration:
```typescript
const handleSave = async () => {
  // Validate
  const errors = validateAIConfiguration(configDraft);
  if (errors.length > 0) {
    setValidationErrors(errors);
    return;
  }
  
  setSaveStatus('saving');
  setValidationErrors([]);
  
  try {
    const response = await fetch('/api/ai-configuration', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configName: 'default',
        updates: configDraft
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save configuration');
    }
    
    setSaveStatus('saved');
    setConfigDraft({});
    await loadConfiguration();
    
    setTimeout(() => setSaveStatus('idle'), 2000);
  } catch (error) {
    console.error('Error saving configuration:', error);
    setSaveStatus('error');
    setTimeout(() => setSaveStatus('idle'), 3000);
  }
};
```

### Load Change History:
```typescript
const loadChangeHistory = async () => {
  try {
    setIsLoadingHistory(true);
    const response = await fetch('/api/config/change-history?entity_type=ai_configuration&limit=20');
    if (!response.ok) throw new Error('Failed to fetch change history');
    const data = await response.json();
    setChangeHistory(data.changes || []);
    setIsLoadingHistory(false);
  } catch (error) {
    console.error('Failed to load change history:', error);
    setIsLoadingHistory(false);
  }
};
```

## Validation

### Client-Side Validation:
```typescript
import { validateAIConfiguration } from '../../lib/types/ai-config';

const errors = validateAIConfiguration(configDraft);
// Returns string[] of validation errors
```

### Validation Rules Quick Reference:
| Field | Rule | Error Message |
|-------|------|---------------|
| temperature | 0-1 | "Temperature must be between 0 and 1" |
| maxTokens | 1-4096 | "Max tokens must be between 1 and 4096" |
| topP | 0-1 | "Top P must be between 0 and 1" |
| requestsPerMinute | ≥ 1 | "Requests per minute must be at least 1" |
| concurrentRequests | ≥ 1 | "Concurrent requests must be at least 1" |
| burstAllowance | ≥ 0 | "Burst allowance must be non-negative" |
| maxRetries | 0-10 | "Max retries must be between 0 and 10" |
| baseDelay | ≥ 0 | "Base delay must be non-negative" |
| maxDelay | ≥ baseDelay | "Max delay must be >= base delay" |
| dailyBudget | ≥ 0 | "Daily budget must be non-negative" |
| weeklyBudget | ≥ dailyBudget | "Weekly budget must be >= daily budget" |
| monthlyBudget | ≥ weeklyBudget | "Monthly budget must be >= weekly budget" |
| alertThresholds | 0-1 each | "Alert thresholds must be between 0 and 1" |
| all timeouts | ≥ 0 | "Timeout must be non-negative" |

## UI Components Used

### Shadcn/UI Components:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
```

### Icons:
```typescript
import { 
  Settings, Cpu, Timer, DollarSign, Key, Clock,
  Save, RotateCcw, History, CheckCircle2, Loader2,
  XCircle, AlertCircle, Info, TrendingUp, Eye, EyeOff,
  RefreshCw, Activity
} from 'lucide-react';
```

## Common Patterns

### Update Single Field:
```typescript
updateDraft({ 
  model: { 
    ...displayConfig.model, 
    temperature: 0.8 
  } 
});
```

### Update Multiple Fields:
```typescript
updateDraft({ 
  rateLimiting: { 
    ...displayConfig.rateLimiting, 
    requestsPerMinute: 100,
    concurrentRequests: 5
  } 
});
```

### Reset All Changes:
```typescript
const handleReset = () => {
  if (confirm('Discard all unsaved changes?')) {
    setConfigDraft({});
    setValidationErrors([]);
  }
};
```

### Check for Changes:
```typescript
const hasChanges = Object.keys(configDraft).length > 0;
```

## Navigation Integration

### Add to Store:
```typescript
// src/stores/useAppStore.ts
currentView: 'dashboard' | 'templates' | 'scenarios' | 'edge_cases' | 
             'review' | 'feedback' | 'settings' | 'ai-config';
```

### Add to Router:
```typescript
// src/App.tsx
case 'ai-config':
  return <AIConfigView />;
```

### Add Menu Item:
```typescript
// src/components/layout/Header.tsx
<DropdownMenuItem onClick={() => setCurrentView('ai-config')}>
  <Cpu className="h-4 w-4 mr-2" />
  AI Configuration
</DropdownMenuItem>
```

## Debugging

### Enable Console Logging:
```typescript
// Add to component
useEffect(() => {
  console.log('Effective Config:', effectiveConfig);
  console.log('Config Draft:', configDraft);
  console.log('Display Config:', displayConfig);
}, [effectiveConfig, configDraft, displayConfig]);
```

### Check API Calls:
```typescript
// In browser DevTools Network tab:
- GET /api/ai-configuration (initial load)
- PATCH /api/ai-configuration (save)
- GET /api/config/change-history (history)
```

### Validation Debugging:
```typescript
const errors = validateAIConfiguration(configDraft);
console.log('Validation Errors:', errors);
```

## Performance Tips

1. **Lazy Load History**: History only loads when modal opened
2. **Draft Pattern**: No API calls during editing
3. **Debounce Sliders**: Consider debouncing slider updates if needed
4. **Memoize Calculations**: Use useMemo for expensive calculations
5. **Optimize Re-renders**: Use React.memo for child components

## Best Practices

### Do:
✅ Validate before saving  
✅ Show clear error messages  
✅ Provide contextual help text  
✅ Use appropriate input types  
✅ Handle loading/error states  
✅ Clear drafts after successful save  

### Don't:
❌ Save without validation  
❌ Allow invalid values in inputs  
❌ Hide validation errors  
❌ Make unnecessary API calls  
❌ Skip error handling  
❌ Forget to reload after save  

## Troubleshooting

### Configuration Not Loading:
1. Check API endpoint is accessible
2. Verify authentication token
3. Check console for errors
4. Verify backend service is running

### Save Failing:
1. Check validation errors
2. Verify API endpoint
3. Check request payload format
4. Review backend logs

### History Not Displaying:
1. Verify change history API endpoint
2. Check query parameters
3. Ensure history table exists
4. Check user permissions

### Preview Not Updating:
1. Verify displayConfig calculation
2. Check state updates
3. Ensure no stale closures
4. Check React DevTools

## Quick Commands

### Run Development Server:
```bash
cd train-wireframe
npm run dev
```

### Run Tests:
```bash
npm test AIConfigView
```

### Check Types:
```bash
npx tsc --noEmit
```

### Lint:
```bash
npm run lint
```

## Resources

- **Component**: `train-wireframe/src/components/views/AIConfigView.tsx`
- **Types**: `src/lib/types/ai-config.ts`
- **Service**: `src/lib/services/ai-config-service.ts`
- **API Routes**: `src/app/api/ai-configuration/route.ts`
- **Documentation**: `PROMPT-6-FILE-8-PART-3-IMPLEMENTATION-SUMMARY.md`

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

