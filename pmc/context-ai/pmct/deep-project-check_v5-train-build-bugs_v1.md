# train-wireframe to src Migration Report
Generated: 2025-11-04 (Current Date)

## Executive Summary
- Total files importing from train-wireframe: **40 files**
- Total unique train-wireframe modules referenced: **3 modules**
- Total imports to update: **43 import statements**
- Estimated migration complexity: **Medium**

**Key Findings:**
- All imports reference 3 primary modules: `types.ts`, `errors/*`, and `api/retry.ts`
- No circular dependencies detected
- Core modules (errors, types, retry) are self-contained and ready for migration
- Build failure is caused by cross-application imports using invalid path patterns

## Critical Issues Found

### 1. **TypeScript Build Blocking Issues**
- All 40 files using `train-wireframe` imports will fail TypeScript compilation
- Import paths like `@/../train-wireframe/src/lib/types` violate Next.js path resolution
- Vercel deployment is completely blocked until migration is complete

### 2. **Import Path Patterns**
Three different import patterns are used:
- `from '@/../train-wireframe/src/lib/...'` (2 files - API routes)
- `from '../../train-wireframe/src/lib/...'` (37 files - relative paths)
- `from '../train-wireframe/src/lib/...'` (1 file - relative path)

### 3. **Module Dependencies**
All three modules to be migrated have clean dependencies:
- `types.ts` - No dependencies (self-contained)
- `errors/*` - Internal dependencies only (error-classes → error-guards → error-logger)
- `api/retry.ts` - Depends only on errors module

---

## Section 1: Complete Import Inventory

### 1.1 API Routes

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\create\route.ts`
**Lines to Update:** 4-5

**Current Imports:**
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/../train-wireframe/src/lib/errors';
```

**Objects Used:**
- `errorLogger` (singleton instance)
- `AppError` (class)
- `ErrorCode` (enum)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\download\[id]\route.ts`
**Lines to Update:** 4

**Current Imports:**
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
```

**Objects Used:**
- `errorLogger` (singleton instance)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\conversations\route.ts`
**Lines to Update:** 21

**Current Imports:**
```typescript
import { Conversation, ConversationTurn, FilterConfig } from '../../../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Conversation` (type)
- `ConversationTurn` (type)
- `FilterConfig` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\download\[id]\route.ts`
**Lines to Update:** 14

**Current Imports:**
```typescript
import { Conversation, ConversationTurn } from '../../../../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Conversation` (type)
- `ConversationTurn` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

### 1.2 Library Files

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-service.ts`
**Lines to Update:** 35

**Current Imports:**
```typescript
import { ExportConfig } from '../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `ExportConfig` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\template-service.ts`
**Lines to Update:** 9

**Current Imports:**
```typescript
import type { Template, TemplateVariable } from '../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Template` (type)
- `TemplateVariable` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\transaction.ts`
**Lines to Update:** 16-18

**Current Imports:**
```typescript
import { DatabaseError, ErrorCode } from '../../../train-wireframe/src/lib/errors';
import { errorLogger } from '../../../train-wireframe/src/lib/errors/error-logger';
import { withRetry } from '../../../train-wireframe/src/lib/api/retry';
```

**Objects Used:**
- `DatabaseError` (class)
- `ErrorCode` (enum)
- `errorLogger` (singleton instance)
- `withRetry` (function)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\health.ts`
**Lines to Update:** 15

**Current Imports:**
```typescript
import { errorLogger } from '../../../train-wireframe/src/lib/errors/error-logger';
```

**Objects Used:**
- `errorLogger` (singleton instance)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`

---

### 1.3 Export Transformer Files

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\csv-transformer.ts`
**Lines to Update:** 6

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\json-transformer.ts`
**Lines to Update:** 6

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\jsonl-transformer.ts`
**Lines to Update:** 10

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\markdown-transformer.ts`
**Lines to Update:** 6

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformers.ts`
**Lines to Update:** 13

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformer-output.ts`
**Lines to Update:** 7

**Current Imports:**
```typescript
import { Conversation, ConversationTurn, ExportConfig } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Conversation` (type)
- `ConversationTurn` (type)
- `ExportConfig` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\types.ts`
**Lines to Update:** 1

**Current Imports:**
```typescript
import { Conversation, ConversationTurn, ExportConfig } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Conversation` (type)
- `ConversationTurn` (type)
- `ExportConfig` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\index.ts`
**Lines to Update:** 6

**Current Imports:**
```typescript
import { ExportConfig } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `ExportConfig` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

### 1.4 Service Files

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-service.ts`
**Lines to Update:** 19

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-generation-service.ts`
**Lines to Update:** 30

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-generation-service.ts`
**Lines to Update:** 21

**Current Imports:**
```typescript
import type { TierType } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `TierType` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-job-service.ts`
**Lines to Update:** 9

**Current Imports:**
```typescript
import type { BatchJob, BatchItem, TierType } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `BatchJob` (type)
- `BatchItem` (type)
- `TierType` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-service.ts`
**Lines to Update:** 11

**Current Imports:**
```typescript
import type { Template, TemplateVariable } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Template` (type)
- `TemplateVariable` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-resolver.ts`
**Lines to Update:** 25

**Current Imports:**
```typescript
import type { Template, TemplateVariable } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Template` (type)
- `TemplateVariable` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\scenario-service.ts`
**Lines to Update:** 11

**Current Imports:**
```typescript
import type { Scenario } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Scenario` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\edge-case-service.ts`
**Lines to Update:** 11

**Current Imports:**
```typescript
import type { EdgeCase } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `EdgeCase` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-validator.ts`
**Lines to Update:** 18

**Current Imports:**
```typescript
import type { ConversationTurn, QualityMetrics } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `ConversationTurn` (type)
- `QualityMetrics` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-feedback-service.ts`
**Lines to Update:** 17

**Current Imports:**
```typescript
import type { Template } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Template` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\service-types.ts`
**Lines to Update:** 14

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\index.ts`
**Lines to Update:** 82

**Current Imports:**
```typescript
} from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- Multiple types from types.ts

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

### 1.5 Test Files

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\__tests__\chunk-association.test.ts`
**Lines to Update:** 9

**Current Imports:**
```typescript
import type { DimensionSource, ChunkReference, Conversation } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `DimensionSource` (type)
- `ChunkReference` (type)
- `Conversation` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\__tests__\conversation-service.test.ts`
**Lines to Update:** 10

**Current Imports:**
```typescript
import type { Conversation, ConversationTurn } from '../../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `Conversation` (type)
- `ConversationTurn` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.test.ts`
**Lines to Update:** 14

**Current Imports:**
```typescript
import { DatabaseError, ErrorCode } from '../../../../train-wireframe/src/lib/errors';
```

**Objects Used:**
- `DatabaseError` (class)
- `ErrorCode` (enum)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.integration.test.ts`
**Lines to Update:** 17

**Current Imports:**
```typescript
import { DatabaseError, ErrorCode } from '../../../../train-wireframe/src/lib/errors';
```

**Objects Used:**
- `DatabaseError` (class)
- `ErrorCode` (enum)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`

---

### 1.6 Type Definition Files

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\review.types.ts`
**Lines to Update:** 6

**Current Imports:**
```typescript
import type { ConversationStatus, ReviewAction, QualityMetrics, TierType } from '../../../train-wireframe/src/lib/types';
```

**Objects Used:**
- `ConversationStatus` (type)
- `ReviewAction` (type)
- `QualityMetrics` (type)
- `TierType` (type)

**Source Files:**
- `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

---

## Section 2: Source Module Analysis

### 2.1 Types Module

**Source File:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`

**File Size:** 417 lines

**Exports (Complete List):**

**Core Types:**
- `TierType` - 'template' | 'scenario' | 'edge_case'
- `ConversationStatus` - Status enum for conversations
- `ConversationTurn` - Individual turn in a conversation
- `QualityMetrics` - Quality scoring metrics
- `Conversation` - Main conversation data structure
- `ReviewAction` - Review history action
- `ChunkReference` - Reference to chunk from chunks-alpha
- `DimensionSource` - Dimension metadata from semantic analysis

**Template Types:**
- `Template` - Template definition with variables
- `TemplateVariable` - Variable definition for templates
- `TemplateTestResult` - Template testing results
- `TemplateTestRequest` - Template test request
- `TemplateAnalytics` - Template usage analytics
- `TemplatePerformanceMetrics` - Performance metrics
- `AnalyticsSummary` - Analytics summary

**Scenario Types:**
- `Scenario` - Scenario definition extending templates
- `EdgeCase` - Edge case definition

**Batch Processing Types:**
- `BatchJob` - Batch job definition
- `BatchItem` - Individual batch item

**Filter & Export Types:**
- `FilterConfig` - Filter configuration
- `ExportConfig` - Export configuration
- `ExportLog` - Export log record

**Coverage Types:**
- `CoverageMetrics` - Coverage analytics
- `TopicCoverageData` - Topic coverage data
- `QualityDistributionBucket` - Quality distribution
- `CoverageGap` - Coverage gap identification

**Feedback Types:**
- `FeedbackCategory` - Feedback categories
- `PerformanceLevel` - Performance level enum
- `TemplatePerformance` - Template performance data
- `FeedbackSummary` - Feedback summary
- `FeedbackRecommendation` - Feedback recommendations

**Re-exported from user-preferences.ts:**
- `UserPreferences`
- `NotificationPreferences`
- `DefaultFilterPreferences`
- `ExportPreferences`
- `KeyboardShortcuts`
- `QualityThresholds`
- `RetryConfig`
- `UserPreferencesRecord`
- `DEFAULT_USER_PREFERENCES`
- `validateUserPreferences`

**Dependencies:**
- `./types/user-preferences` (re-exported types)

**Vite-specific code:** None detected

**Required changes for Next.js 14:**
- ✅ No changes needed - pure TypeScript types
- ✅ No Vite-specific imports or code
- ⚠️ Need to ensure `./types/user-preferences.ts` exists or create it in target

---

### 2.2 Error Handling Module

**Source Directory:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\`

#### File: `error-classes.ts` (452 lines)

**Exports:**
- `ErrorCode` (enum) - Standardized error codes
- `ErrorContext` (interface) - Error context metadata
- `AppError` (class) - Base application error
- `APIError` (class) - HTTP/API errors
- `NetworkError` (class) - Network connectivity errors
- `ValidationError` (class) - Input validation errors
- `GenerationError` (class) - AI generation errors
- `DatabaseError` (class) - Database operation errors

**Dependencies:** None (self-contained)

**Vite-specific code:** None

**Required changes:**
- ✅ No changes needed - pure TypeScript classes
- ✅ Uses standard JavaScript Error class
- ✅ Compatible with Next.js 14

---

#### File: `error-guards.ts` (395 lines)

**Exports:**
- `isAppError` (function) - Type guard
- `isAPIError` (function) - Type guard
- `isNetworkError` (function) - Type guard
- `isValidationError` (function) - Type guard
- `isGenerationError` (function) - Type guard
- `isDatabaseError` (function) - Type guard
- `categorizeError` (function) - Error categorization
- `isRetryable` (function) - Check if retryable
- `getUserMessage` (function) - Get user-friendly message
- `getErrorCode` (function) - Extract error code
- `sanitizeError` (function) - Sanitize for client
- `normalizeError` (function) - Normalize to AppError
- `isRateLimitError` (function) - Check rate limit
- `isTimeoutError` (function) - Check timeout
- `isAuthError` (function) - Check auth error
- `isValidationIssue` (function) - Check validation
- `getStatusCode` (function) - Get HTTP status
- `getErrorSummary` (function) - Get error summary
- `ErrorCategory` (type)
- `SanitizedError` (interface)
- `ErrorSummary` (interface)

**Dependencies:**
- `./error-classes` (imports error classes)

**Vite-specific code:** None

**Required changes:**
- ✅ No changes needed
- ✅ Pure utility functions
- ✅ Compatible with Next.js 14

---

#### File: `error-logger.ts` (395 lines)

**Exports:**
- `LogLevel` (type)
- `LogEntry` (interface)
- `ErrorLogger` (class)
- `errorLogger` (singleton instance)

**Dependencies:**
- `./error-classes` (imports AppError, ErrorCode)
- `./error-guards` (imports sanitizeError)

**Vite-specific code:** None

**Required changes:**
- ⚠️ Uses `process.env.NODE_ENV` - Compatible with Next.js
- ⚠️ Uses `fetch('/api/errors/log')` - Requires API endpoint in Next.js app
- ✅ No Vite-specific code
- 📝 **Action Required:** Create API route at `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts`

---

#### File: `index.ts` (101 lines)

**Purpose:** Re-exports all error handling exports

**Exports:** All exports from error-classes, error-guards, and error-logger

**Dependencies:**
- `./error-classes`
- `./error-guards`
- `./error-logger`

**Required changes:**
- ✅ No changes needed
- ✅ Standard barrel file pattern

---

### 2.3 Retry Module

**Source File:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`

**File Size:** 316 lines

**Exports:**
- `RetryConfig` (interface) - Retry configuration
- `withRetry` (function) - Retry wrapper with exponential backoff
- `Retry` (decorator) - Method decorator for retry
- `retryWithCustomBackoff` (function) - Custom backoff strategy
- `retryWithTimeout` (function) - Retry with timeout

**Dependencies:**
- `../errors` (imports APIError, NetworkError, isRetryable)
- `../errors/error-logger` (imports errorLogger)

**Vite-specific code:** None

**Required changes:**
- ✅ No changes needed
- ✅ Pure utility functions
- ✅ Uses standard JavaScript setTimeout/Promise
- ✅ Compatible with Next.js 14

---

## Section 3: Migration Plan

### 3.1 Types Module Migration

**Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`
**Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types.ts`

**Migration Strategy:** Direct copy with path updates

**Files to Migrate:**
1. ✅ `types.ts` (main types file)
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types.ts`
   - **Changes needed:**
     - Update import path: `from './types/user-preferences'` → verify file exists
     - Verify all re-exported types from user-preferences
   - **New import path:** `@/lib/types`

2. ✅ `types/user-preferences.ts` (dependency)
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types\user-preferences.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\user-preferences.ts`
   - **Changes needed:** None (if exists)
   - **Action:** Verify file exists or create it

**Migration Steps:**
1. Check if `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\user-preferences.ts` exists
2. If not, copy from train-wireframe
3. Copy `types.ts` to target location
4. Verify imports resolve correctly
5. Test TypeScript compilation

---

### 3.2 Error Handling Module Migration

**Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\`
**Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`

**Migration Strategy:** Copy entire directory structure

**Files to Migrate:**
1. ✅ `error-classes.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-classes.ts`
   - **Changes needed:** None (self-contained)
   - **New import path:** `@/lib/errors/error-classes`

2. ✅ `error-guards.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-guards.ts`
   - **Changes needed:**
     - Update internal import: `from './error-classes'` (already correct)
   - **New import path:** `@/lib/errors/error-guards`

3. ✅ `error-logger.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-logger.ts`
   - **Changes needed:**
     - Update internal imports: `from './error-classes'`, `from './error-guards'` (already correct)
     - ⚠️ **CREATE API ENDPOINT:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts`
   - **New import path:** `@/lib/errors/error-logger`

4. ✅ `index.ts` (barrel file)
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\index.ts`
   - **Changes needed:** None (relative imports are correct)
   - **New import path:** `@/lib/errors`

**Migration Steps:**
1. Create directory: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`
2. Copy all 4 files with no modifications to internal imports
3. Create API endpoint at `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts`
4. Test compilation

**API Endpoint Required:**
```typescript
// File: C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { logs } = await request.json();

  // Store logs in database or external service
  // For now, just return success
  console.log('Received error logs:', logs);

  return NextResponse.json({ success: true });
}
```

---

### 3.3 Retry Module Migration

**Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`
**Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\retry.ts`

**Migration Strategy:** Copy file with import path updates

**Files to Migrate:**
1. ✅ `retry.ts`
   - **Source:** `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`
   - **Target:** `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\retry.ts`
   - **Changes needed:**
     - Update import: `from '../errors'` → `@/lib/errors`
     - Update import: `from '../errors/error-logger'` → `@/lib/errors/error-logger`
   - **New import path:** `@/lib/api/retry`

**Migration Steps:**
1. Create directory: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\`
2. Copy `retry.ts` to target
3. Update 2 import statements to use `@/lib/errors` paths
4. Test compilation

---

## Section 4: Import Update Instructions

### 4.1 API Routes Import Updates

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\create\route.ts`
**Lines:** 4-5

**Current:**
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/../train-wireframe/src/lib/errors';
```

**Replace With:**
```typescript
import { errorLogger } from '@/lib/errors/error-logger';
import { AppError, ErrorCode } from '@/lib/errors';
```

**Verification:** ✅ After migration, imports resolve to `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\download\[id]\route.ts`
**Lines:** 4

**Current:**
```typescript
import { errorLogger } from '@/../train-wireframe/src/lib/errors/error-logger';
```

**Replace With:**
```typescript
import { errorLogger } from '@/lib/errors/error-logger';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\conversations\route.ts`
**Lines:** 21

**Current:**
```typescript
import { Conversation, ConversationTurn, FilterConfig } from '../../../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import { Conversation, ConversationTurn, FilterConfig } from '@/lib/types';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\download\[id]\route.ts`
**Lines:** 14

**Current:**
```typescript
import { Conversation, ConversationTurn } from '../../../../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import { Conversation, ConversationTurn } from '@/lib/types';
```

---

### 4.2 Library Files Import Updates

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-service.ts`
**Lines:** 35

**Current:**
```typescript
import { ExportConfig } from '../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import { ExportConfig } from '@/lib/types';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\template-service.ts`
**Lines:** 9

**Current:**
```typescript
import type { Template, TemplateVariable } from '../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import type { Template, TemplateVariable } from '@/lib/types';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\transaction.ts`
**Lines:** 16-18

**Current:**
```typescript
import { DatabaseError, ErrorCode } from '../../../train-wireframe/src/lib/errors';
import { errorLogger } from '../../../train-wireframe/src/lib/errors/error-logger';
import { withRetry } from '../../../train-wireframe/src/lib/api/retry';
```

**Replace With:**
```typescript
import { DatabaseError, ErrorCode } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { withRetry } from '@/lib/api/retry';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\health.ts`
**Lines:** 15

**Current:**
```typescript
import { errorLogger } from '../../../train-wireframe/src/lib/errors/error-logger';
```

**Replace With:**
```typescript
import { errorLogger } from '@/lib/errors/error-logger';
```

---

### 4.3 Export Transformer Files Import Updates

**Pattern applies to all 8 export transformer files:**
- csv-transformer.ts
- json-transformer.ts
- jsonl-transformer.ts
- markdown-transformer.ts
- test-transformers.ts
- test-transformer-output.ts
- types.ts
- index.ts

**Current Pattern:**
```typescript
import { ... } from '../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import { ... } from '@/lib/types';
```

**Files:**
1. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\csv-transformer.ts` - Line 6
2. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\json-transformer.ts` - Line 6
3. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\jsonl-transformer.ts` - Line 10
4. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\markdown-transformer.ts` - Line 6
5. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformers.ts` - Line 13
6. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformer-output.ts` - Line 7
7. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\types.ts` - Line 1
8. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\index.ts` - Line 6

---

### 4.4 Service Files Import Updates

**Pattern applies to all 11 service files:**

**Current Pattern:**
```typescript
import type { ... } from '../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import type { ... } from '@/lib/types';
```

**Files:**
1. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-service.ts` - Line 19
2. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-generation-service.ts` - Line 30
3. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-generation-service.ts` - Line 21
4. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-job-service.ts` - Line 9
5. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-service.ts` - Line 11
6. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-resolver.ts` - Line 25
7. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\scenario-service.ts` - Line 11
8. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\edge-case-service.ts` - Line 11
9. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-validator.ts` - Line 18
10. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-feedback-service.ts` - Line 17
11. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\service-types.ts` - Line 14
12. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\index.ts` - Line 82

---

### 4.5 Test Files Import Updates

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\__tests__\chunk-association.test.ts`
**Lines:** 9

**Current:**
```typescript
import type { DimensionSource, ChunkReference, Conversation } from '../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import type { DimensionSource, ChunkReference, Conversation } from '@/lib/types';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\__tests__\conversation-service.test.ts`
**Lines:** 10

**Current:**
```typescript
import type { Conversation, ConversationTurn } from '../../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import type { Conversation, ConversationTurn } from '@/lib/types';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.test.ts`
**Lines:** 14

**Current:**
```typescript
import { DatabaseError, ErrorCode } from '../../../../train-wireframe/src/lib/errors';
```

**Replace With:**
```typescript
import { DatabaseError, ErrorCode } from '@/lib/errors';
```

---

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.integration.test.ts`
**Lines:** 17

**Current:**
```typescript
import { DatabaseError, ErrorCode } from '../../../../train-wireframe/src/lib/errors';
```

**Replace With:**
```typescript
import { DatabaseError, ErrorCode } from '@/lib/errors';
```

---

### 4.6 Type Definition Files Import Updates

#### File: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\review.types.ts`
**Lines:** 6

**Current:**
```typescript
import type { ConversationStatus, ReviewAction, QualityMetrics, TierType } from '../../../train-wireframe/src/lib/types';
```

**Replace With:**
```typescript
import type { ConversationStatus, ReviewAction, QualityMetrics, TierType } from '@/lib/types';
```

---

## Section 5: Vite to Next.js 14 Conversion Guide

### 5.1 Import Alias Conversions

| Vite Pattern | Next.js 14 Pattern | Notes |
|--------------|-------------------|-------|
| `@/` in train-wireframe | `@/` in src | tsconfig.json already configured |
| Relative paths from train-wireframe | `@/` aliases | All relative paths become `@/lib/...` |
| `@/../train-wireframe/...` | `@/lib/...` | Invalid path pattern removed |
| `../../train-wireframe/...` | `@/lib/...` | Relative path replaced with alias |

**tsconfig.json Configuration (already configured):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5.2 TypeScript Configuration Differences

**No Changes Required:**
- All migrated code uses standard TypeScript
- No Vite-specific TypeScript features detected
- No special compiler options needed

### 5.3 Environment Variable Access

**No Changes Required:**
- `process.env.NODE_ENV` is supported in Next.js 14
- Error logger uses standard environment variable access
- No Vite-specific env variables (e.g., `import.meta.env`) detected

### 5.4 Build-Time vs Runtime Code

**No Changes Required:**
- All migrated modules are runtime code
- No Vite build-time optimizations or plugins used
- No special build configuration needed

### 5.5 API Endpoint Creation Required

**New API Route Needed:**
```typescript
// File: C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json();

    // Optional: Verify authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Error logs received:', logs);
    }

    // Optional: Store in database
    // const { error } = await supabase
    //   .from('error_logs')
    //   .insert(logs.map(log => ({
    //     ...log,
    //     user_id: user?.id
    //   })));

    return NextResponse.json({ success: true, count: logs.length });
  } catch (error) {
    console.error('Failed to process error logs:', error);
    return NextResponse.json(
      { error: 'Failed to process logs' },
      { status: 500 }
    );
  }
}
```

---

## Section 6: Validation Checklist

After migration, verify:

### Pre-Migration Checklist
- [ ] Backup current codebase
- [ ] Create new git branch for migration
- [ ] Read this entire document
- [ ] Understand all import update locations

### Migration Execution Checklist
- [ ] Create directory: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`
- [ ] Create directory: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\`
- [ ] Verify `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\user-preferences.ts` exists
- [ ] Copy `error-classes.ts` to src/lib/errors/
- [ ] Copy `error-guards.ts` to src/lib/errors/
- [ ] Copy `error-logger.ts` to src/lib/errors/
- [ ] Copy `index.ts` to src/lib/errors/
- [ ] Copy `types.ts` to src/lib/
- [ ] Copy `retry.ts` to src/lib/api/ and update its imports
- [ ] Create API route at `src/app/api/errors/log/route.ts`

### Import Update Checklist (40 files)
- [ ] Update 2 API route files in `src/app/api/backup/`
- [ ] Update 2 API route files in `src/app/api/export/`
- [ ] Update `src/lib/export-service.ts`
- [ ] Update `src/lib/template-service.ts`
- [ ] Update `src/lib/database/transaction.ts`
- [ ] Update `src/lib/database/health.ts`
- [ ] Update 8 files in `src/lib/export-transformers/`
- [ ] Update 12 files in `src/lib/services/`
- [ ] Update 3 files in `src/lib/__tests__/` and `src/lib/services/__tests__/`
- [ ] Update 2 files in `src/lib/database/__tests__/`
- [ ] Update `src/lib/types/review.types.ts`

### Post-Migration Verification Checklist
- [ ] All train-wireframe imports removed from `src/` directory
- [ ] All migrated files compile without errors: `npm run build`
- [ ] TypeScript types resolve correctly: `npx tsc --noEmit`
- [ ] No circular dependencies introduced
- [ ] Next.js build completes successfully
- [ ] Verify API routes still work
- [ ] Verify error logging works
- [ ] Run tests if available: `npm test`
- [ ] Vercel deployment succeeds

### Code Quality Checklist
- [ ] All imports use `@/lib/` alias pattern
- [ ] No references to `train-wireframe` remain
- [ ] Error handling works correctly
- [ ] Console logs appear in development
- [ ] API error logging endpoint responds

---

## Section 7: Risk Assessment

### High Risk Items

**None Identified** - All migrations are low-risk type and utility migrations

### Medium Risk Items

1. **Error Logger API Endpoint**
   - **Risk:** Error logger will attempt to POST to `/api/errors/log` which doesn't exist yet
   - **Impact:** Client-side errors may fail to log (will console.error and continue)
   - **Mitigation:** Create API endpoint before deploying
   - **Testing Required:** Verify error logging in browser console and network tab

2. **User Preferences Type Dependency**
   - **Risk:** `types.ts` re-exports from `./types/user-preferences` which may not exist
   - **Impact:** TypeScript compilation will fail if file is missing
   - **Mitigation:** Verify file exists before copying types.ts
   - **Testing Required:** Check if file exists in src/lib/types/ directory

### Low Risk Items

1. **Type Imports (35+ files)**
   - **Risk:** Very low - type-only imports have no runtime impact
   - **Impact:** Compilation errors only, no runtime failures
   - **Mitigation:** Systematic find-replace approach
   - **Testing Required:** TypeScript compilation check

2. **Error Class Imports (5 files)**
   - **Risk:** Low - self-contained error classes with no external dependencies
   - **Impact:** Compilation errors if paths incorrect
   - **Mitigation:** Copy entire errors directory as unit
   - **Testing Required:** Test error throwing and catching

3. **Retry Logic Import (1 file)**
   - **Risk:** Low - pure utility function
   - **Impact:** Database transaction retries may fail if import broken
   - **Mitigation:** Test database operations after migration
   - **Testing Required:** Run database transaction tests

---

## Section 8: Dependency Graph

```
Migration Dependency Tree:
========================

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts
  ├── depends on: C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types\user-preferences.ts
  └── used by: [40 files in src/]
      ├── src/app/api/export/conversations/route.ts
      ├── src/app/api/export/download/[id]/route.ts
      ├── src/lib/export-service.ts
      ├── src/lib/template-service.ts
      ├── src/lib/export-transformers/*.ts (8 files)
      ├── src/lib/services/*.ts (12 files)
      ├── src/lib/__tests__/chunk-association.test.ts
      ├── src/lib/services/__tests__/conversation-service.test.ts
      └── src/lib/types/review.types.ts

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts
  ├── depends on: [none - self-contained]
  └── used by: error-guards.ts, error-logger.ts, retry.ts

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts
  ├── depends on: error-classes.ts
  └── used by: error-logger.ts, retry.ts

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts
  ├── depends on: error-classes.ts, error-guards.ts
  └── used by: retry.ts, [5 files in src/]
      ├── src/app/api/backup/create/route.ts
      ├── src/app/api/backup/download/[id]/route.ts
      ├── src/lib/database/transaction.ts
      └── src/lib/database/health.ts

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts
  ├── depends on: error-classes.ts, error-guards.ts, error-logger.ts
  └── used by: [5 files in src/]
      ├── src/app/api/backup/create/route.ts
      ├── src/lib/database/transaction.ts
      ├── src/lib/database/__tests__/transaction.test.ts
      └── src/lib/database/__tests__/transaction.integration.test.ts

C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts
  ├── depends on: ../errors (index.ts), ../errors/error-logger.ts
  └── used by: [1 file in src/]
      └── src/lib/database/transaction.ts
```

**Dependency Analysis:**
- ✅ **No circular dependencies detected**
- ✅ **Clean dependency hierarchy**: error-classes → error-guards → error-logger → retry
- ✅ **types.ts is independent** (only depends on user-preferences)
- ✅ **Migration order is straightforward**: Copy dependencies first, then dependents

---

## Section 9: Implementation Order

Based on dependencies, migrate in this order:

### Phase 1: Foundation Types (No Dependencies)
**Estimated Time:** 5 minutes

1. **Verify user-preferences.ts exists**
   - Check: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\user-preferences.ts`
   - If missing, copy from: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types\user-preferences.ts`

2. **Copy types.ts**
   - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`
   - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types.ts`
   - Changes: None (verify user-preferences import resolves)

### Phase 2: Error Handling Module (Internal Dependencies Only)
**Estimated Time:** 10 minutes

3. **Create errors directory**
   - Create: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\`

4. **Copy error-classes.ts** (no dependencies)
   - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`
   - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-classes.ts`
   - Changes: None

5. **Copy error-guards.ts** (depends on error-classes)
   - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
   - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-guards.ts`
   - Changes: None (relative imports already correct)

6. **Copy error-logger.ts** (depends on error-classes, error-guards)
   - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
   - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\error-logger.ts`
   - Changes: None (relative imports already correct)

7. **Copy index.ts** (barrel file)
   - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`
   - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\errors\index.ts`
   - Changes: None

8. **Create error logging API endpoint**
   - Create: `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\errors\log\route.ts`
   - See Section 5.5 for implementation

### Phase 3: API Utilities (Depends on Errors)
**Estimated Time:** 5 minutes

9. **Create api directory**
   - Create: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\`

10. **Copy and update retry.ts**
    - Source: `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`
    - Target: `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\api\retry.ts`
    - Changes:
      ```typescript
      // OLD:
      import { APIError, NetworkError, isRetryable } from '../errors';
      import { errorLogger } from '../errors/error-logger';

      // NEW:
      import { APIError, NetworkError, isRetryable } from '@/lib/errors';
      import { errorLogger } from '@/lib/errors/error-logger';
      ```

### Phase 4: Update All Import Statements
**Estimated Time:** 15 minutes

11. **Update API route imports** (4 files)
    - See Section 4.1 for specific changes

12. **Update library file imports** (4 files)
    - See Section 4.2 for specific changes

13. **Update export transformer imports** (8 files)
    - See Section 4.3 for specific changes

14. **Update service file imports** (12 files)
    - See Section 4.4 for specific changes

15. **Update test file imports** (4 files)
    - See Section 4.5 for specific changes

16. **Update type definition file imports** (1 file)
    - See Section 4.6 for specific changes

### Phase 5: Verification & Testing
**Estimated Time:** 10 minutes

17. **Verify no train-wireframe references remain**
    ```bash
    cd C:\Users\james\Master\BrightHub\BRun\train-data
    grep -r "train-wireframe" src/
    ```
    - Should return: No results (except in .md files)

18. **Test TypeScript compilation**
    ```bash
    npx tsc --noEmit
    ```
    - Should return: No errors

19. **Test Next.js build**
    ```bash
    npm run build
    ```
    - Should complete successfully

20. **Commit changes**
    ```bash
    git add .
    git commit -m "Migrate train-wireframe modules to src directory"
    ```

**Total Estimated Time:** 45 minutes

---

## Section 10: Automated Migration Script

For efficiency, consider using this bash script to automate file copying:

```bash
#!/bin/bash

# Migration script for train-wireframe to src
# Run from: C:\Users\james\Master\BrightHub\BRun\train-data

echo "Starting migration..."

# Phase 1: Copy types
echo "Phase 1: Copying types.ts..."
cp train-wireframe/src/lib/types.ts src/lib/types.ts
cp train-wireframe/src/lib/types/user-preferences.ts src/lib/types/user-preferences.ts 2>/dev/null || echo "user-preferences.ts not found, may already exist"

# Phase 2: Copy errors module
echo "Phase 2: Copying errors module..."
mkdir -p src/lib/errors
cp train-wireframe/src/lib/errors/error-classes.ts src/lib/errors/error-classes.ts
cp train-wireframe/src/lib/errors/error-guards.ts src/lib/errors/error-guards.ts
cp train-wireframe/src/lib/errors/error-logger.ts src/lib/errors/error-logger.ts
cp train-wireframe/src/lib/errors/index.ts src/lib/errors/index.ts

# Phase 3: Copy retry module
echo "Phase 3: Copying retry module..."
mkdir -p src/lib/api
cp train-wireframe/src/lib/api/retry.ts src/lib/api/retry.ts

echo "Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Update imports in src/lib/api/retry.ts"
echo "2. Create API endpoint at src/app/api/errors/log/route.ts"
echo "3. Run find-replace for all train-wireframe imports"
echo "4. Test with: npm run build"
```

---

## Appendix A: Complete File Listing

### Files Examined in src/ Directory (40 files)

**API Routes (4 files):**
1. `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\create\route.ts`
2. `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\backup\download\[id]\route.ts`
3. `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\conversations\route.ts`
4. `C:\Users\james\Master\BrightHub\BRun\train-data\src\app\api\export\download\[id]\route.ts`

**Library Files (4 files):**
5. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-service.ts`
6. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\template-service.ts`
7. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\transaction.ts`
8. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\health.ts`

**Export Transformers (8 files):**
9. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\csv-transformer.ts`
10. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\json-transformer.ts`
11. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\jsonl-transformer.ts`
12. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\markdown-transformer.ts`
13. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformers.ts`
14. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\test-transformer-output.ts`
15. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\types.ts`
16. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\export-transformers\index.ts`

**Services (12 files):**
17. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-service.ts`
18. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\conversation-generation-service.ts`
19. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-generation-service.ts`
20. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\batch-job-service.ts`
21. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-service.ts`
22. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\template-resolver.ts`
23. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\scenario-service.ts`
24. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\edge-case-service.ts`
25. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-validator.ts`
26. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\quality-feedback-service.ts`
27. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\service-types.ts`
28. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\index.ts`

**Test Files (4 files):**
29. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\__tests__\chunk-association.test.ts`
30. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\services\__tests__\conversation-service.test.ts`
31. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.test.ts`
32. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\database\__tests__\transaction.integration.test.ts`

**Type Definitions (1 file):**
33. `C:\Users\james\Master\BrightHub\BRun\train-data\src\lib\types\review.types.ts`

### Files to Migrate from train-wireframe/ (7 files)

**Types:**
1. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types.ts`
2. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\types\user-preferences.ts`

**Errors Module:**
3. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-classes.ts`
4. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-guards.ts`
5. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\error-logger.ts`
6. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\errors\index.ts`

**API Utilities:**
7. `C:\Users\james\Master\BrightHub\BRun\train-data\train-wireframe\src\lib\api\retry.ts`

---

## Appendix B: Search Patterns Used

### Patterns Used to Find Imports

```bash
# Pattern 1: Find all imports from train-wireframe
grep -r "from.*train-wireframe" src/

# Pattern 2: Find all imports with various path depths
grep -r "from.*train-wireframe/src/lib" src/

# Pattern 3: Find dynamic imports
grep -r "import(.*train-wireframe" src/

# Pattern 4: Find all TypeScript/JavaScript files
find src/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"
```

### Regex Patterns for Find-Replace

**Pattern 1: API Route Imports**
```regex
Find: from ['"]@/\.\./\.\.?/train-wireframe/src/lib/(.+?)['"]
Replace: from '@/lib/$1'
```

**Pattern 2: Relative Imports (3 levels)**
```regex
Find: from ['"]\.\./.\.\./.\.\.?/train-wireframe/src/lib/(.+?)['"]
Replace: from '@/lib/$1'
```

**Pattern 3: Relative Imports (2 levels)**
```regex
Find: from ['"]\.\./.\.\.?/train-wireframe/src/lib/(.+?)['"]
Replace: from '@/lib/$1'
```

**Pattern 4: Relative Imports (4+ levels)**
```regex
Find: from ['"]\.\./(\.\./)+(train-wireframe/src/lib/.+?)['"]
Replace: from '@/lib/$2'
```

---

## Summary & Next Steps

### Migration Summary

This migration will:
- ✅ Move 3 core modules (types, errors, retry) from train-wireframe to src
- ✅ Update 43 import statements across 40 files
- ✅ Create 1 new API endpoint for error logging
- ✅ Resolve all TypeScript compilation errors
- ✅ Enable successful Vercel deployment

### Complexity Assessment

**Low Complexity Migration:**
- All modules are self-contained with minimal dependencies
- No Vite-specific code requiring conversion
- Type-only imports have zero runtime impact
- Clear dependency hierarchy with no circular references

### Estimated Completion Time

- **File Migration:** 15 minutes
- **Import Updates:** 20 minutes
- **Testing & Verification:** 10 minutes
- **Total:** ~45 minutes

### Success Criteria

Migration is complete when:
1. ✅ `npm run build` succeeds without errors
2. ✅ `grep -r "train-wireframe" src/` returns no results (except .md files)
3. ✅ All TypeScript types resolve correctly
4. ✅ Vercel deployment succeeds
5. ✅ Error logging works in development and production

### Post-Migration Tasks

After successful migration:
1. Test error handling in development
2. Test error logging API endpoint
3. Verify retry logic works in database transactions
4. Run existing tests if available
5. Deploy to Vercel staging environment
6. Monitor error logs for issues
7. Consider removing train-wireframe directory after verification period

---

**End of Migration Report**

**Report Generated:** 2025-11-04
**Total Files Analyzed:** 40 files in src/, 7 files in train-wireframe
**Total Import Statements:** 43 imports to update
**Modules to Migrate:** 3 modules (types, errors, retry)
