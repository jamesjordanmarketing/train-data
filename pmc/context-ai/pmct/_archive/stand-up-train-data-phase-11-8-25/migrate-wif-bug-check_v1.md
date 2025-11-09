# WIF Migration – Pre‑Existing Build Issues: Fix Specification (v1)

This document consolidates the four pre‑existing issues identified during the WIF migration and provides precise, implementation‑ready specifications to fix them. For each issue, you’ll find symptoms, root cause, impacted files, recommended fix, step‑by‑step implementation, whether UI knowledge is required, and acceptance criteria.

## Summary

- Fixes are backend/service and TypeScript export hygiene; no UI functionality knowledge is required to implement them correctly.
- The work primarily concerns module exports, import paths, and Next.js route handler constraints.

## Issue A — `createClient` missing export from `@/lib/supabase`

**Symptoms**
- Build/runtime errors: “`createClient` is not exported from `@/lib/supabase`”.
- Examples: `src/app/api/export/templates/route.ts`, `src/app/api/import/edge-cases/route.ts`, `src/app/api/export/scenarios/route.ts`, `src/app/api/export/edge-cases/route.ts`, `src/app/api/import/templates/route.ts`, `src/app/api/import/scenarios/route.ts`, `src/lib/services/migration-manager.ts`, `src/lib/services/migration-testing.ts`, `src/scripts/migrate.ts`.

**Root Cause**
- There are multiple Supabase modules:
  - `src/lib/supabase-server.ts` implements server‑side factories: `createServerSupabaseClient()` (sync, service role) and `createServerSupabaseClientWithAuth()` (async, cookie‑aware).
  - `src/lib/supabase/server.ts` re‑exports those and currently aliases `createServerSupabaseClientWithAuth` as `createClient`, which is async and not what API routes expect.
  - `src/lib/supabase.ts` exports a client instance `supabase` only; it does not export a zero‑arg `createClient` function.
- Many API routes import `createClient` from `@/lib/supabase` and call it with zero args, expecting a synchronous, server‑privileged client factory.

**Recommended Fix**
- Provide a zero‑argument, synchronous `createClient()` export from `@/lib/supabase` by re‑exporting `createServerSupabaseClient` as `createClient`.
- Additionally, correct the alias in `src/lib/supabase/server.ts` to avoid confusion: alias `createServerSupabaseClient` (not the async `WithAuth` version) as `createClient`.

**Implementation Steps**
1. In `src/lib/supabase.ts`, add a named re‑export:
   - `export { createServerSupabaseClient as createClient } from './supabase-server';`
   - Keep existing default/named exports as is (do not break consumers of `supabase`).
2. In `src/lib/supabase/server.ts`, change the alias:
   - Replace `export { createServerSupabaseClientWithAuth as createClient };` with `export { createServerSupabaseClient as createClient };`.
3. No changes required for files importing `createClient` from `@supabase/supabase-js` (e.g., backup scripts) — those are valid and server‑key based.

**UI Knowledge Needed?**
- No. This is a server‑side factory export fix. API route behavior does not depend on UI.

**Acceptance Criteria**
- Importing `createClient` from `@/lib/supabase` returns a Supabase client synchronously with server permissions (service role when available, anon as fallback).
- All listed API routes compile and run without “missing export” errors.
- No code paths rely on an async `createClient()`; no `await` is required for the fixed factory.

---

## Issue B — `templateService` missing export from `@/lib/template-service`

**Symptoms**
- Build/runtime errors: “`templateService` is not exported from `@/lib/template-service`”.
- Importers expect a singleton with methods like `resolveTemplate` and `getUsageStats`:
  - `src/app/api/templates/[id]/resolve/route.ts`
  - `src/app/api/templates/[id]/stats/route.ts`

**Root Cause**
- `src/lib/template-service.ts` exports a `TemplateService` class but not a `templateService` singleton.
- `resolveTemplate` is implemented in `src/lib/services/template-resolver.ts`, not on `TemplateService` in either file.
- A `getUsageStats` method is expected by routes but does not exist on the `TemplateService` class in the repo.

**Recommended Fix**
- Add a compositional adapter in `src/lib/template-service.ts` that:
  - Exports a singleton `templateService` created from the server Supabase client.
  - Exposes `resolveTemplate(templateId, params)` by delegating to `TemplateResolver`.
  - Implements `getUsageStats(templateId)` to query usage metrics needed by the stats route.
- Alternatively, adjust the routes to instantiate `TemplateService` and `TemplateResolver` directly and call explicit methods — but the singleton adapter keeps current imports intact and is simpler.

**Implementation Steps**
1. Import the server client factory and resolver:
   - `import { createClient } from '@/lib/supabase';`
   - `import { TemplateResolver } from '@/lib/services/template-resolver';`
2. Instantiate once and export a singleton with the required surface:
   - `const supabase = createClient();`
   - `const service = new TemplateService(supabase);`
   - `const resolver = new TemplateResolver(supabase);`
   - `export const templateService = { ...service, resolveTemplate: (id, params) => resolver.resolveTemplate({ templateId: id, parameters: params }) , getUsageStats: async (id) => {/* see below */} };`
3. Implement `getUsageStats(templateId)` minimal version aligned to route expectations:
   - Query `templates` (or `prompt_templates`) for `usage_count`, `rating`.
   - Derive `conversationsGenerated` via a `count` on `conversations` where `parent_id = templateId`.
   - Compute `successRate` and `avgQualityScore` if available (e.g., from `generation_logs` or `conversation_turns`); otherwise return sane defaults and mark as TODO for enhancement.
   - Return shape: `{ usageCount: number, rating: number, successRate: number, avgQualityScore: number, conversationsGenerated: number }`.

**UI Knowledge Needed?**
- No. The adapter and queries are backend concerns. The returned shape is already defined by the route handler expectations.

**Acceptance Criteria**
- `@/lib/template-service` exports `templateService` with methods `resolveTemplate(id, params)` and `getUsageStats(id)`.
- Both `/api/templates/[id]/resolve` and `/api/templates/[id]/stats` compile and return the expected JSON shapes.
- No additional named exports are introduced on the route modules beyond the HTTP methods.

---

## Issue C — `IExportTransformer` missing or incorrect re‑export

**Symptoms**
- Type import complaints from consumers expecting `IExportTransformer` to be available from the module root, or bundler warnings about re‑exporting a type as a value.

**Root Cause**
- `src/lib/export-transformers/index.ts` currently re‑exports `IExportTransformer` using a value export pattern (`export { IExportTransformer }` after a normal import). Since interfaces are erased at runtime, this can trigger tooling inconsistencies.

**Recommended Fix**
- Re‑export `IExportTransformer` using TypeScript’s type‑only syntax and avoid importing the interface as a runtime value.

**Implementation Steps**
1. In `src/lib/export-transformers/index.ts`:
   - Replace `import { IExportTransformer } from './types';` with `import type { IExportTransformer } from './types';`.
   - Replace `export { IExportTransformer, ... }` with two lines:
     - `export type { IExportTransformer } from './types';`
     - Keep value exports for classes/functions: `export { JSONLTransformer, JSONTransformer, CSVTransformer, MarkdownTransformer };`
   - Retain `export * from './types';` if needed for additional type exports.

**UI Knowledge Needed?**
- No. This is TypeScript export hygiene.

**Acceptance Criteria**
- Consumers can import type `IExportTransformer` from `@/lib/export-transformers` without runtime/bundler warnings.
- API routes importing `getTransformer` continue to work.

---

## Issue D — Invalid named export in Next.js route: `src/app/api/templates/analytics/route.ts`

**Symptoms**
- Build error/warning: Route handlers must only export HTTP methods (`GET`, `POST`, etc.). Found additional named export `getTemplatePerformanceMetrics`.

**Root Cause**
- The route file declares and exports a helper function (non‑HTTP handler), which violates Next.js route module constraints.

**Recommended Fix**
- Move helper(s) to a library module and import them in the route; do not export them from the route file.

**Implementation Steps**
1. Create `src/lib/services/template-analytics.ts` with:
   - `export async function getTemplatePerformanceMetrics(/* params as needed */) { /* existing logic moved here */ }`
   - Keep any pure helper (e.g., `calculateTrend`) in the same module or as a private function.
2. In `src/app/api/templates/analytics/route.ts`:
   - Remove the exported helper function(s) (“named exports” other than HTTP methods).
   - Import and call `getTemplatePerformanceMetrics()` inside the `GET` handler.
3. Ensure the route only exports allowed HTTP method handlers.

**UI Knowledge Needed?**
- No. The change is structural to satisfy Next.js route constraints; UI does not influence it.

**Acceptance Criteria**
- `next build` does not report disallowed named exports for the analytics route.
- Analytics `GET` handler returns the same response payload as before.

---

## Cross‑Cutting Notes

- Keep server‑side Supabase usage consistent: API routes should use the server factory (`createServerSupabaseClient`) to ensure RLS‑safe operations.
- Do not alter files that rely on `@supabase/supabase-js` directly for explicit service‑role usage (e.g., backup scripts).
- If a table naming inconsistency exists (`templates` vs. `prompt_templates`), standardize queries during implementation and document the chosen canonical table.

## Validation Plan

- Build: run `next build` and ensure no missing exports and no route export violations.
- Smoke test the affected routes:
  - `GET /api/templates/[id]/stats` returns `{ usageCount, rating, successRate, avgQualityScore, conversationsGenerated }`.
  - `POST /api/templates/[id]/resolve` returns `{ resolvedText }`.
  - Export/import routes that call `createClient()` compile and can initialize a client without `await`.
- Optional: add a small unit test for the export‑transformers index to assert type availability (TypeScript compile‑time check).

## Effort & Risk

- Effort: Low to moderate (mostly small, surgical changes across a handful of files).
- Risk: Low; changes are additive and align with existing patterns. The only behavioral change is ensuring `createClient()` is synchronous and server‑privileged in `@/lib/supabase`.