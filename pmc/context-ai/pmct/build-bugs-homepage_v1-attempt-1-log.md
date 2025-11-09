# Build & Routing Debug Log — train-data

Date: November 7, 2025

## Events
- Verified Vercel env vars (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`. Redeploy still completed in ~4s and returned 404.
- Simplified `src/vercel.json` (removed `framework`, `buildCommand`, `installCommand`) to allow Next.js auto-detection.
- Pinned Node to `20.x` via `"engines"` in `src/package.json`.
- Triggered new deployment: build ran properly, site works.
- Confirmed app is reachable: `https://train-data-three.vercel.app/dashboard`.
- Enumerated user-facing routes by scanning `src/app`.

## Derived Routes (from codebase)
- `/` → root (currently redirects to `/dashboard`)
- `/signin` → auth sign-in
- `/signup` → auth sign-up
- `/dashboard` → main dashboard
- `/upload` → upload page
- `/conversations` → conversations overview
- `/chunks` → chunks overview
- `/chunks/[documentId]` → chunk group by document
- `/chunks/[documentId]/dimensions/[chunkId]` → chunk dimensions view
- `/chunks/[documentId]/spreadsheet/[chunkId]` → chunk spreadsheet view
- `/workflow/[documentId]/stage1` → workflow stage 1
- `/workflow/[documentId]/stage2` → workflow stage 2
- `/workflow/[documentId]/stage3` → workflow stage 3
- `/workflow/[documentId]/complete` → workflow completion
- `/test-chunks` → test page for chunks

## Notes
- App Router route groups in parentheses (e.g., `(auth)`, `(dashboard)`, `(workflow)`) do not affect the URL path.
- Auth gating may redirect `/dashboard` and other pages to `/signin` unless a valid session exists.