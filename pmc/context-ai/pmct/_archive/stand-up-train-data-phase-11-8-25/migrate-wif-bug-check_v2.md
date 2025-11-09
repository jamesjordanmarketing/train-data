# Migration WIF Bug Check v2 — Build Error Report

## Build Attempt Summary
- Command: `npm run build` (workspace root script runs `cd src && next build`)
- Next.js: `14.2.33`
- TypeScript: `^5` (from `src/package.json`)
- Zod: `^4.1.12` (from `src/package.json`)
- Result: Build failed during type checking.

## Error Details
- First failure reported by Next type checker:
  - File: `src/app/api/conversations/generate-batch/route.ts`
  - Location: line `21:19`
  - Code: `parameters: z.record(z.any()),`
  - Message: `Type error: Expected 2-3 arguments, but got 1.`
  - Context snippet:
    ```ts
    const BatchGenerateRequestSchema = z.object({
      name: z.string().min(1, 'Batch name is required'),
      tier: z.enum(['template', 'scenario', 'edge_case']).optional(),
      conversationIds: z.array(z.string().uuid()).optional(),
      templateId: z.string().uuid().optional(),
      parameterSets: z.array(z.object({
        templateId: z.string().uuid(),
        parameters: z.record(z.any()), // <-- failing here
        tier: z.enum(['template', 'scenario', 'edge_case']),
      })).optional(),
      sharedParameters: z.record(z.any()).optional(),
      concurrentProcessing: z.number().min(1).max(10).optional().default(3),
      errorHandling: z.enum(['stop', 'continue']).optional().default('continue'),
      userId: z.string().optional(),
      priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
    });
    ```

## Likely Root Cause
- The project uses `zod@^4.1.12`.
- Zod v4 changed several APIs versus v3. Two relevant changes observed:
  - `ZodError` now exposes `issues` (not `errors`) for validation details.
  - `z.record` signature expects explicit key schema in many cases (e.g., `z.record(z.string(), valueSchema)`), and passing a single value schema may be disallowed depending on overloads/types.
- The failing pattern `z.record(z.any())` indicates the code was authored against Zod v3 and requires updates to align with Zod v4.

## Impacted Areas (observed usages)
Multiple occurrences of single-argument `z.record(...)` exist and are likely affected by the Zod v4 signature:

- `src/app/api/conversations/generate-batch/route.ts`
  - `parameters: z.record(z.any())`
  - `sharedParameters: z.record(z.any()).optional()`
- `src/app/api/conversations/generate/route.ts`
  - `parameters: z.record(z.any())`
- `src/app/api/templates/[id]/resolve/route.ts`
  - `parameters: z.record(z.any())`
- `src/app/api/templates/preview/route.ts`
  - `variables: z.record(z.any())`
- `src/lib/types/conversations.ts`
  - `parameters: z.record(z.any()).optional()` (two occurrences at lines ~329, ~353)
- `src/lib/types/templates.ts`
  - `parameterValues: z.record(z.any()).optional()`
- `src/lib/types/generation-logs.ts`
  - `requestPayload: z.record(z.any())`
  - `responsePayload: z.record(z.any()).optional()`
  - `parameters: z.record(z.any()).optional()`

Note: Other files already use the two-argument form (e.g., `z.record(z.string(), z.any())`) and appear compatible with Zod v4.

## Dependencies and Configuration Potentially Involved
- `zod@^4.1.12`: API changes vs v3 affect validation code.
- `next@^14.2.33`: Strict type checking in build will surface Zod type mismatches.
- `typescript@^5`: Newer TypeScript can enforce stricter overload resolution, making incompatible Zod calls fail.
- Environment variables referenced by routes (runtime dependency, not build):
  - `ANTHROPIC_API_KEY` used in `conversations/generate` and `conversations/generate-batch` routes. Missing keys won’t affect type-check but will affect runtime behavior.
- Supabase clients:
  - Server-side client usage (`@/lib/supabase/server`) standardized earlier. These imports are compatible with Next server routes and shouldn’t affect type checking directly.

## Recommendations (no code changes made here)
- Audit and update all `z.record(...)` usages to the Zod v4-compatible signature, e.g.:
  - `z.record(z.string(), z.any())` or `z.record(z.string(), z.unknown())` depending on desired value type.
- Confirm all validation error handling uses `error.issues` instead of `error.errors`.
- Consider pinning Zod v3 if immediate migration is not desired, but be aware this could reintroduce inconsistencies with other code that already assumes v4.
- After updating schemas, re-run `npm run build` to confirm type-check passes.

## Build Output Excerpt
```
./app/api/conversations/generate-batch/route.ts:21:19
Type error: Expected 2-3 arguments, but got 1.

  19 |   parameterSets: z.array(z.object({
  20 |     templateId: z.string().uuid(),
> 21 |     parameters: z.record(z.any()),
     |                   ^
  22 |     tier: z.enum(['template', 'scenario', 'edge_case']),
  23 |   })).optional(),
Next.js build worker exited with code: 1 and signal: null
```

## Status
- Build currently fails due to Zod v4 `z.record` signature mismatch in multiple locations.
- No code changes applied in this write-up per instruction; this document summarizes findings and impacted areas.