# Back to Chunks-Alpha Pattern - Final Attempt

**Date:** November 7, 2025  
**Attempt:** #5
**Strategy:** Match chunks-alpha EXACTLY

---

## What We're Doing

Going back to the chunks-alpha configuration that you said works:

1. **vercel.json location:** `src/vercel.json`
2. **Commands:** Simple (no "cd src")
3. **Framework:** "nextjs"
4. **Root package.json:** Minimal (no scripts/workspaces)

---

## Files

### src/vercel.json (EXACTLY like chunks-alpha)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "crons": [...]
}
```

### package.json (root - stays minimal)

```json
{
  "name": "train-data-root",
  "version": "1.0.0",
  "private": true,
  "description": "..."
}
```

---

## CRITICAL Vercel Dashboard Settings

**You MUST set these in Vercel Dashboard:**

1. Go to Project Settings → General
2. **Root Directory:** Set to `src` (NOT blank!)
3. **Framework Preset:** Let it auto-detect (should show Next.js)
4. **Build Command:** Leave blank (vercel.json handles it)
5. **Output Directory:** Leave blank (Next.js default)
6. **Install Command:** Leave blank (vercel.json handles it)

**Save settings before deploying!**

---

## Deploy

```bash
git add -A
git commit -m "fix: Back to chunks-alpha pattern with Root Directory=src"
git push origin main
```

---

## What Should Happen

- ✅ Build takes 60+ seconds
- ✅ Shows "Compiling..."
- ✅ Shows "Generating static pages..."
- ✅ Deployment succeeds
- ✅ **Routes work (no 404)**

---

## If Still 404

Then we need:
1. Screenshot of Vercel Project Settings (Root Directory specifically)
2. Full deployment logs from successful build
3. The actual URL it's deploying to
4. Comparison with chunks-alpha Vercel settings

There might be some other Vercel configuration difference.

---

## Key Difference from Previous Attempts

**Previous attempts mixed approaches:**
- Try #1-3: vercel.json in src/ WITH Root Directory = src (but root package.json interfered)
- Try #4: vercel.json in root WITHOUT Root Directory (build worked but routing broken)

**This attempt:**
- vercel.json in src/ WITH Root Directory = src AND minimal root package.json
- Exact chunks-alpha pattern

---

**This is the configuration chunks-alpha uses successfully. It should work.**

