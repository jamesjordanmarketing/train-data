# train-data Vercel 404 — Execution Plan (Low-Hanging Fruit First)

Date: November 7, 2025  
Project: train-data (Bright Run LoRA Training Data Platform)

Goal: Resolve Vercel 404s by executing the smallest, fastest fixes first, stopping as soon as the issue is resolved. Each step lists Owner, Actions, and Stop Criteria.

---

## Step 1 — Verify Environment Variables (fastest win)
- Owner: You
- Actions:
  - In Vercel → Project Settings → Environment Variables:
    - Confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` exist and are set for Production (and Preview if needed).
  - Trigger a new deployment.
- Stop Criteria:
  - Deployment duration ≥ 60s and homepage is not 404.
  - If fixed, stop here. If still 404 or deploy < 60s, continue.

## Step 2 — Remove Build/Install/Output Overrides (let auto-detection work)
- Owner: You
- Actions:
  - In Vercel → Project Settings → Build & Output:
    - Turn OFF overrides for `Build Command`, `Install Command`, and `Output Directory` (use Next.js defaults).
  - Keep Root Directory set to `src`.
  - Trigger a new deployment.
- Stop Criteria:
  - Build logs show Next.js detection (type checking, page generation) and duration ≥ 60s.
  - If fixed, stop here. If not, continue.

## Step 3 — Pin Node.js to 20.x (reduce variability)
- Owner: Agent + You
- Actions (Agent - code change proposal):
  - Add engines to `src/package.json`:
    ```json
    {
      "engines": { "node": "20.x" }
    }
    ```
- Actions (You - Vercel setting):
  - In Vercel → Project Settings → General → Node.js Version: set to `20.x`.
  - Trigger a new deployment.
- Stop Criteria:
  - Build logs show Next.js compilation and duration ≥ 60s; homepage no longer 404.
  - If fixed, stop here. If not, continue.

## Step 4 — Simplify `src/vercel.json` (avoid conflicting signals)
- Owner: Agent + You
- Actions (Agent - code change proposal):
  - Edit `src/vercel.json` to remove framework/command overrides; keep only crons if needed:
    ```json
    {
      "crons": [
        { "path": "/api/cron/daily-maintenance", "schedule": "0 2 * * *" },
        { "path": "/api/cron/export-file-cleanup", "schedule": "0 2 * * *" }
      ]
    }
    ```
  - Alternatively, delete `src/vercel.json` to rely fully on auto-detection.
- Actions (You):
  - Trigger a new deployment.
- Stop Criteria:
  - Build logs show Next.js compilation and duration ≥ 60s; homepage no longer 404.
  - If fixed, stop here. If not, continue.

## Step 5 — Local Build Sanity Check
- Owner: Agent (or You if preferred)
- Actions:
  - Run locally from repo root:
    ```bash
    cd src
    npm ci
    npm run build
    npm run start
    ```
  - Visit `http://localhost:3000/` and check for 404.
- Stop Criteria:
  - If local build or runtime fails, capture error and fix before deploying.
  - If local build and runtime work, continue to next step.

## Step 6 — Vercel CLI Debug Build (high signal, low risk)
- Owner: You
- Actions:
  - Install and link:
    ```bash
    npm i -g vercel
    vercel login
    cd <repo-root>
    vercel link
    ```
  - Run debug build:
    ```bash
    vercel build --debug
    ```
  - Observe whether Next.js framework is detected and which commands run.
- Stop Criteria:
  - If Next.js is not detected or build is 7s, collect logs and proceed; if proper detection and logs look good, deploy again and verify.

## Step 7 — Root Route Cleanup (remove double redirect)
- Owner: Agent
- Actions (code changes):
  - Remove `/ → /dashboard` redirect from `src/next.config.js`.
  - Change `src/app/page.tsx` to a server component redirect:
    ```ts
    import { redirect } from 'next/navigation'
    import { cookies } from 'next/headers'
    import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

    export const dynamic = 'force-dynamic'

    export default async function HomePage() {
      const supabase = createServerComponentClient({ cookies })
      const { data: { session } } = await supabase.auth.getSession()
      redirect(session ? '/dashboard' : '/signin')
    }
    ```
  - Test locally (Step 5) and redeploy.
- Stop Criteria:
  - Homepage works and no 404; if fixed, stop here.

## Step 8 — Fresh Vercel Project (clean slate)
- Owner: You
- Actions:
  - Create a new Vercel project pointing to the same repo.
  - Root Directory: `src`; do not set any overrides.
  - Set required environment variables.
  - Deploy.
- Stop Criteria:
  - If the new project deploys correctly (≥ 60s, homepage not 404), keep it; otherwise continue.

## Step 9 — Explicit Root Build Fallback (if auto-detection remains odd)
- Owner: Agent + You
- Actions (Agent - code change proposal):
  - Move `vercel.json` to repo root and set explicit commands:
    ```json
    {
      "github": { "silent": true },
      "buildCommand": "cd src && npm ci && npm run build",
      "outputDirectory": "src/.next",
      "installCommand": "npm ci --prefix src",
      "devCommand": "cd src && npm run dev"
    }
    ```
  - Add root `package.json` script (optional):
    ```json
    { "scripts": { "vercel-build": "cd src && npm ci && npm run build" } }
    ```
- Actions (You):
  - Clear Root Directory in Vercel (set to `.`).
  - Deploy.
- Stop Criteria:
  - Build shows Next.js compilation and routes work.

## Step 10 — Contact Vercel Support (if all else fails)
- Owner: You
- Actions:
  - Provide: project IDs (train-data and chunks-alpha), build logs (debug and dashboard), env vars list (redacted keys), and a note on prior overrides.
  - Ask for internal configuration diff and framework detection details.

---

## Notes & Checks
- `.vercelignore` should not exclude `src/` or `.next/` (current excludes pmc/, docs/, scripts/, archive/ which is fine).
- For App Router functions, configure per-route:
  - Use `export const maxDuration = 300` or `export const runtime = 'nodejs'` inside `app/api/.../route.ts`.
- Priority rationale:
  - Steps 1–4 are low-risk fixes that often resolve detection and build issues without code changes.
  - Steps 5–6 provide high-quality diagnostics to avoid blind changes.
  - Step 7 addresses potential routing conflicts cleanly.
  - Step 8 avoids project-level configuration corruption.
  - Step 9 is a controlled fallback for explicit builds.

## Success Criteria (same as analysis)
- Build duration ≥ 60s with Next.js compilation logs.
- Homepage and dashboard routes load; API routes respond.
- No 404s across primary routes; static assets load.