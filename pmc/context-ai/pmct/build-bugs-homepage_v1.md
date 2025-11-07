# Vercel 404 Deployment Issue - Analysis and Solution

**Date:** November 7, 2025  
**Issue:** Train-data deploys successfully to Vercel but returns 404 on all routes  
**Working Reference:** chunks-alpha (same structure, deploys successfully)

---

## Executive Summary

The train-data application is deploying to Vercel successfully but returning 404 errors because of a **vercel.json configuration mismatch**. The working chunks-alpha reference project has vercel.json inside the `src` folder with simple build commands, while train-data has it in the root with complex "cd" commands that contradict the Vercel Root Directory setting.

**Root Cause:** When Vercel's Root Directory is set to `src`, the system treats `src` as the project root. Having vercel.json in the actual repository root with "cd src" commands creates a conflict where Vercel tries to execute commands relative to the wrong directory.

**Solution:** Move vercel.json from repository root into the `src` folder and simplify the build commands to match the working chunks-alpha pattern.

---

## Investigation Findings

### 1. Current Configuration Analysis

#### train-data (BROKEN - 404s)

**Location:** `C:\Users\james\Master\BrightHub\BRun\train-data\vercel.json`

```json
{
  "buildCommand": "cd src && npm run build",
  "outputDirectory": "src/.next",
  "installCommand": "npm install --prefix src",
  "devCommand": "cd src && npm run dev",
  "framework": null,
  "crons": [...]
}
```

**Vercel Project Settings:**
- Root Directory: `src` (configured in Vercel dashboard)
- Framework: "Other" (not detected as Next.js)
- Build Command: Varies based on production overrides

**Key Problems:**
1. ❌ vercel.json is in repository root, but Vercel Root Directory is set to `src`
2. ❌ Commands use "cd src" but Vercel is already in the src directory
3. ❌ Framework set to `null` instead of "nextjs"
4. ❌ Install command uses `--prefix src` which is unnecessary when already in src

#### chunks-alpha (WORKING)

**Location:** `C:\Users\james\Master\BrightHub\BRun\chunks-alpha\src\vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "functions": {
    "app/api/chunks/extract/route.ts": {
      "maxDuration": 300
    },
    "app/api/chunks/regenerate/route.ts": {
      "maxDuration": 300
    },
    "app/api/chunks/generate-dimensions/route.ts": {
      "maxDuration": 300
    }
  }
}
```

**Vercel Project Settings:**
- Root Directory: `src` (configured in Vercel dashboard)
- Framework: "Next.js" (properly detected)
- Build Command: `npm run build` (simple, relative to src)

**Key Success Factors:**
1. ✅ vercel.json is INSIDE the src folder
2. ✅ Commands are simple (no directory changes needed)
3. ✅ Framework properly set to "nextjs"
4. ✅ Functions configuration for long-running API routes

### 2. Package.json Comparison

Both projects have identical npm scripts in their `src/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

This confirms that both projects are standard Next.js applications that expect to run from within the src directory.

### 3. Next.js Configuration

Both projects have identical `next.config.js` files with:
- A redirect from `/` to `/dashboard`
- Webpack configurations for SVG, pdf-parse, and canvas
- Server component external packages

Both have identical root `app/page.tsx` that:
- Checks authentication status
- Redirects to `/dashboard` if authenticated
- Redirects to `/signin` if not authenticated

**This means:** The 404 issue is NOT related to Next.js routing or configuration. The application itself is correctly set up.

### 4. Directory Structure Comparison

Both projects have the same non-standard structure:

```
Repository Root (e.g., train-data/)
├── pmc/              (build tools - NOT part of web app)
├── docs/             (documentation)
├── scripts/          (utility scripts)
└── src/              ← ACTUAL WEB APPLICATION ROOT
    ├── app/          (Next.js pages and API routes)
    ├── components/   (React components)
    ├── lib/          (utilities)
    ├── package.json  (dependencies)
    ├── next.config.js
    └── vercel.json   (should be here for chunks-alpha)
```

**Key Insight:** This non-standard structure is intentional and valid. The `pmc` directory contains project management and build tools that should NOT be deployed. Only the `src` directory should be deployed to Vercel, which is why "Root Directory: src" is set in Vercel.

---

## Why chunks-alpha Works and train-data Doesn't

### Vercel's Execution Flow (Conceptual Model)

When Vercel deploys with "Root Directory: src":

1. **Clone repository** → Gets full repo including root and src
2. **Change to Root Directory** → `cd src` (Vercel does this automatically)
3. **Read vercel.json** → Looks for it in the CURRENT directory (src)
4. **Execute installCommand** → Runs from within src
5. **Execute buildCommand** → Runs from within src
6. **Detect output** → Looks for outputDirectory in current context

### What Happens with chunks-alpha (CORRECT)

```bash
# Vercel's internal process
git clone repo
cd chunks-alpha/src          # Automatic via Root Directory setting
cat vercel.json              # Found! It's right here in src/
npm install                  # Runs in src/ ✅
npm run build                # Runs in src/ ✅
# Output: .next directory found in current directory ✅
```

### What Happens with train-data (INCORRECT)

```bash
# Vercel's internal process
git clone repo
cd train-data/src                    # Automatic via Root Directory setting
cat vercel.json                      # NOT FOUND HERE! It's in parent directory
cat ../vercel.json                   # Falls back to parent? Vercel tries to help
npm install --prefix src             # But we're already IN src! This tries src/src/ ❌
cd src && npm run build              # Tries to cd to src/src/ ❌ (doesn't exist)
# Build fails OR succeeds but routes aren't mapped correctly
```

The commands are executing in the wrong context because:
1. Vercel is already in `train-data/src/` due to Root Directory setting
2. Commands in vercel.json are trying to go to `src/` again
3. This creates a path like `train-data/src/src/` which doesn't exist
4. Or, Vercel gets confused about where the actual Next.js app is located

---

## The Root Cause Explained

The fundamental issue is a **configuration contradiction**:

- **Vercel Dashboard Setting:** "Root Directory = src" 
  - Tells Vercel: "The project starts in the src folder"
  
- **vercel.json Location:** Repository root with "cd src" commands
  - Tells Vercel: "Change to src folder to run commands"

These two instructions conflict. It's like telling someone:
1. "You're starting in the kitchen"
2. "Now go to the kitchen"

Result: Confusion and execution in the wrong location.

---

## Recommended Solution

### Solution 1: Match chunks-alpha Pattern (RECOMMENDED)

This is the cleanest, proven solution.

**Step 1:** Move vercel.json from root to src

```bash
mv vercel.json src/vercel.json
```

**Step 2:** Update src/vercel.json content

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "functions": {
    "app/api/cron/daily-maintenance/route.ts": {
      "maxDuration": 300
    },
    "app/api/cron/export-file-cleanup/route.ts": {
      "maxDuration": 300
    },
    "app/api/chunks/extract/route.ts": {
      "maxDuration": 300
    },
    "app/api/chunks/regenerate/route.ts": {
      "maxDuration": 300
    },
    "app/api/chunks/generate-dimensions/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cron/daily-maintenance",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/export-file-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Step 3:** Verify Vercel Dashboard Settings

Ensure these settings are configured:
- **Root Directory:** `src`
- **Framework Preset:** Should auto-detect as "Next.js" now
- **Build Command:** (can leave as default, vercel.json will override)
- **Output Directory:** (can leave as default, Next.js default)
- **Install Command:** (can leave as default, vercel.json will override)

**Why This Works:**
- Vercel navigates to src/ automatically
- Finds vercel.json in the current directory
- Executes simple commands relative to current directory (src/)
- Framework detection works properly
- Output directory (.next) is found in the correct location

---

### Solution 2: Remove Root Directory Setting (ALTERNATIVE)

If you prefer to keep vercel.json in the repository root:

**Step 1:** Keep vercel.json in root with current "cd src" commands

**Step 2:** Change Vercel Dashboard Settings:
- **Root Directory:** Leave BLANK (or set to `.`)
- **Build Command:** Will use vercel.json's "cd src && npm run build"
- **Install Command:** Will use vercel.json's "npm install --prefix src"

**Why This Could Work:**
- Vercel starts in repository root
- Commands in vercel.json navigate to src/ explicitly
- No conflicting directory instructions

**Why This Is NOT Recommended:**
1. More complex commands (cd, --prefix)
2. Doesn't match the proven chunks-alpha pattern
3. Deploys more to Vercel (entire repo) when only src/ is needed
4. May have issues with framework detection

---

### Solution 3: Use .vercelignore (SUPPLEMENTARY)

Regardless of which solution above you choose, add a `.vercelignore` file to explicitly control what gets deployed:

**Location:** Repository root: `train-data/.vercelignore`

```
# Exclude build and dev tools from deployment
pmc/
docs/
scripts/
archive/
*.md
!src/**

# Only include src directory
# (This is redundant if Root Directory = src, but makes intent clear)
```

**Purpose:**
- Explicitly exclude non-application directories
- Reduce deployment size
- Make deployment intent clear
- Prevent accidental deployment of sensitive build tools

---

## Implementation Plan

### Immediate Actions (Solution 1 - Recommended)

1. **Back up current vercel.json**
   ```bash
   cp vercel.json vercel.json.backup
   ```

2. **Create new vercel.json in src/**
   - Location: `train-data/src/vercel.json`
   - Content: See Solution 1 above

3. **Delete or rename root vercel.json**
   ```bash
   mv vercel.json vercel.json.old
   ```

4. **Verify Vercel Dashboard Settings**
   - Root Directory: `src`
   - Let Vercel auto-detect framework (should show "Next.js")

5. **Deploy and Test**
   ```bash
   git add src/vercel.json
   git rm vercel.json  # or git add vercel.json.old if you renamed
   git commit -m "fix: Move vercel.json to src folder to fix 404 deployment issue"
   git push origin main
   ```

6. **Verify Deployment**
   - Wait for Vercel deployment to complete
   - Check deployment logs for any errors
   - Test the deployed URL
   - Should redirect to /dashboard or /signin
   - Verify API routes work (test an API endpoint)

### Verification Checklist

After deployment, verify:

- [ ] Build completes successfully (check Vercel logs)
- [ ] Homepage loads (even if it redirects)
- [ ] Redirects to /dashboard or /signin work
- [ ] At least one API route works (e.g., /api/documents)
- [ ] No 404 errors on valid routes
- [ ] Static assets load (CSS, images)
- [ ] Console shows no critical errors

### Rollback Plan

If the solution doesn't work:

1. **Quick Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Original Configuration**
   ```bash
   mv vercel.json.old vercel.json
   git add vercel.json
   git commit -m "rollback: Restore original vercel.json"
   git push origin main
   ```

3. **Try Alternative Solution 2**
   - Keep vercel.json in root
   - Remove Root Directory setting from Vercel dashboard
   - Redeploy

---

## Technical Deep Dive: Why This Causes 404s

### The 404 Mystery Explained

When Vercel can't find the Next.js application in the expected location:

1. **Build Might Succeed** - Because npm commands can be forgiving and create directories
2. **Routing Doesn't Work** - Next.js router doesn't initialize properly
3. **Catch-All 404** - Vercel returns generic 404 for all routes

The 404 isn't from your Next.js app's not-found.tsx, it's from Vercel's infrastructure saying "I can't find the application."

### What Vercel Looks For

After building, Vercel looks for:
- `.next/` directory (Next.js build output)
- Server configuration files
- Static assets in `.next/static/`
- Server functions in `.next/server/`

If these are in the wrong location relative to where Vercel expects them (due to the Root Directory setting), Vercel can't serve the application.

### Directory Context Matters

```
Scenario 1: Root Directory = src, vercel.json in src (CORRECT ✅)
Repository Clone: /vercel/temp/project/
Vercel Working Dir: /vercel/temp/project/src/
Build Output: /vercel/temp/project/src/.next/
Vercel Serves From: /vercel/temp/project/src/.next/ ✅ Match!

Scenario 2: Root Directory = src, vercel.json in root (BROKEN ❌)
Repository Clone: /vercel/temp/project/
Vercel Working Dir: /vercel/temp/project/src/
Build Output: /vercel/temp/project/src/.next/ or /vercel/temp/project/.next/ (ambiguous!)
Vercel Serves From: /vercel/temp/project/src/.next/ ❌ Mismatch if built in wrong place!
```

---

## Additional Considerations

### Cron Jobs

Your cron jobs are defined correctly and will work with either solution:

```json
"crons": [
  {
    "path": "/api/cron/daily-maintenance",
    "schedule": "0 2 * * *"
  }
]
```

These paths are relative to the application root (not filesystem root), so they'll work correctly once the app is serving properly.

### Function Timeouts

Consider adding function timeout configurations for long-running API routes (like chunks-alpha does):

```json
"functions": {
  "app/api/chunks/extract/route.ts": {
    "maxDuration": 300
  }
}
```

This prevents Vercel from timing out operations that might take longer than the default 10 seconds.

### Environment Variables

Ensure all necessary environment variables are set in Vercel dashboard:
- Database connection strings
- API keys (OpenAI, etc.)
- NextAuth secrets
- Supabase credentials

These are separate from the routing issue but necessary for the app to function.

---

## Comparison Table

| Aspect | chunks-alpha (✅ Working) | train-data (❌ 404s) |
|--------|---------------------------|----------------------|
| vercel.json location | `src/vercel.json` | `vercel.json` (root) |
| Framework setting | `"nextjs"` | `null` |
| Build command | `npm run build` | `cd src && npm run build` |
| Install command | `npm install` | `npm install --prefix src` |
| Root Directory setting | `src` | `src` |
| Vercel working directory | `src/` | `src/` (but commands contradict this) |
| Command execution context | Simple, in current dir | Complex, tries to navigate |
| Result | ✅ Routes work | ❌ 404 errors |

---

## Conclusion and Recommendation

**Primary Recommendation:** Implement Solution 1 (match chunks-alpha pattern)

**Reasoning:**
1. ✅ Proven to work (chunks-alpha is live and functional)
2. ✅ Simpler configuration (fewer moving parts)
3. ✅ Better framework detection (Vercel recognizes it as Next.js)
4. ✅ Cleaner deployment (only deploys src/)
5. ✅ Easier to maintain and debug

**Confidence Level:** Very High (95%+)

This pattern is exactly what chunks-alpha uses successfully. The only differences between the two projects are:
1. Location of vercel.json (root vs src/)
2. Complexity of commands (simple vs cd commands)
3. Framework declaration (nextjs vs null)

Aligning these three aspects should resolve the 404 issue.

**Expected Outcome After Fix:**
- ✅ Homepage loads and redirects to /dashboard or /signin
- ✅ All routes work correctly
- ✅ API endpoints respond properly
- ✅ No more 404 errors
- ✅ Deployment logs show successful Next.js build

---

## Next Steps

1. **Review this analysis** - Ensure understanding of root cause
2. **Create backup** - Copy current vercel.json for safety
3. **Implement Solution 1** - Move and update vercel.json
4. **Deploy** - Push changes and let Vercel rebuild
5. **Verify** - Test all critical routes and functionality
6. **Document** - Update project docs with correct configuration

If issues persist after implementing Solution 1, we can investigate:
- Vercel deployment logs in detail
- Next.js build output structure
- Environment variable configuration
- Framework detection issues

But based on the evidence, Solution 1 should resolve the 404 issue.

