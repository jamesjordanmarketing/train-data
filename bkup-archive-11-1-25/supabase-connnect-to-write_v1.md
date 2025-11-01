# Supabase Connection Configuration Guide

## Issue: Missing Environment Variables

The application requires a `.env.local` file with Supabase configuration, but this file was not found in the project root directory.

## Solution: What You Actually Need in .env.local

### Current Status: App Already Works Without .env.local

**Your app is already working because:**
- Supabase credentials are hardcoded in `src/utils/supabase/info.tsx`
- Anthropic API key is set in Vercel deployment environment
- Most functionality doesn't require the service role key

### Optional: Create .env.local for Additional Features

**Only create `.env.local` if you need:**
- Server-side operations requiring elevated database permissions
- Local development with different credentials
- Override hardcoded values for testing

**If you do create `.env.local`, place it in the project root** (`c:\Users\james\Master\BrightHub\BRun\train-data\.env.local`):

# Optional feature flags
NEXT_PUBLIC_USE_NORMALIZED_TAGS=true

# Optional cron secret (for performance monitoring)
CRON_SECRET=your_random_secret_here
```

**Note**: Environment variables in `.env.local` will override hardcoded values in the source code.

### Step 2: Get Your Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side operations that need to access PostgreSQL system catalogs. To get this key:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/hqhtbxlgzysfbekexwku
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Replace `your_service_role_key` in the `.env.local` file with this value

### Step 3: Verify Configuration

The application uses the following environment variable hierarchy:

- **Client-side**: Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Server-side**: Uses `SUPABASE_SERVICE_ROLE_KEY` when available, falls back to anon key

### Current Project Configuration

Based on the existing configuration in `src/utils/supabase/info.tsx`:
- **Project ID**: `hqhtbxlgzysfbekexwku`
- **Supabase URL**: `https://hqhtbxlgzysfbekexwku.supabase.co`
- **Anon Key**: Already configured in the codebase

### Project Structure and Environment Variables

Your project has a unique multi-tool architecture:

```
c:\Users\james\Master\BrightHub\BRun\train-data\
├── .env.local                    ← Place it HERE (project root)
├── src\                          ← Main Next.js app
│   ├── app\
│   ├── lib\
│   └── ...
├── pmc\                          ← Development tools
│   ├── context-ai\
│   ├── product\
│   └── ...
├── scripts\                      ← Utility scripts
└── ...
```

**Why `.env.local` must be in the project root:**
- **Next.js app** (`\src`) automatically loads environment variables from project root
- **Development tools** (`\pmc`) need database access for AI operations and data management
- **Scripts** need consistent access to the same Supabase instance
- **Unified configuration** ensures all tools work with the same database

### Why This File Was Missing

The `.env.local` file is typically:
1. **Gitignored** (as seen in `.gitignore`) to prevent sensitive keys from being committed
2. **Developer-specific** - each developer needs to create their own
3. **Environment-specific** - different values for development, staging, and production

### Files That Require These Environment Variables

The following components across your project depend on these environment variables:

**Main Application (`\src`):**
- `src/lib/supabase.ts` - Main Supabase client configuration
- `src/lib/supabase-server.ts` - Server-side Supabase operations
- `src/lib/services/database-health-service.ts` - Database monitoring
- `src/lib/services/database-maintenance-service.ts` - Database maintenance
- Various API routes that need database access

**Development Tools (`\pmc`):**
- AI context tools that read/write training data
- Product management tools that access database schemas
- Development scripts that need database connectivity

**Utility Scripts (`\scripts`):**
- `scripts/test-export-monitoring.ts` - Requires `SUPABASE_SERVICE_ROLE_KEY`
- Database migration and testing scripts

**Supabase Functions (`\src\supabase\functions`):**
- Server-side functions that need service role access

### Security Notes

- **Never commit** `.env.local` to version control
- **Service role key** has full database access - keep it secure
- **Use different keys** for development, staging, and production environments

## Verification

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

The application should now be able to connect to Supabase properly for both client-side and server-side operations.