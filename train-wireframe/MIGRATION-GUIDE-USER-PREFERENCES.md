# User Preferences Migration Guide

## 🎯 Quick Migration Steps

Follow these steps to apply the user preferences database migration.

### Step 1: Verify Prerequisites

Before running the migration, ensure:
- [ ] Supabase project is set up and running
- [ ] Database connection is working
- [ ] You have admin access to the Supabase project
- [ ] No conflicting `user_preferences` table exists

### Step 2: Apply the Migration

#### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd train-data

# Apply all pending migrations
supabase migration up

# Verify migration applied
supabase migration list
```

#### Option B: Manual Application via Supabase Dashboard

1. Open Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy entire contents of `supabase/migrations/20251101_create_user_preferences.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify success message appears

#### Option C: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"

# Run the migration file
\i supabase/migrations/20251101_create_user_preferences.sql
```

### Step 3: Verify Migration Success

Run these verification queries in SQL Editor:

```sql
-- 1. Verify table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'user_preferences';
-- Expected: 1 row with table_name = 'user_preferences'

-- 2. Verify columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_preferences'
ORDER BY ordinal_position;
-- Expected: id, user_id, preferences, created_at, updated_at

-- 3. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_preferences';
-- Expected: rowsecurity = true

-- 4. Verify RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_preferences';
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- 5. Verify triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('user_preferences', 'users');
-- Expected: update_user_preferences_updated_at, on_auth_user_created

-- 6. Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_preferences';
-- Expected: 3-4 indexes (PK, user_id, created_at, GIN on preferences)

-- 7. Verify unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_preferences'
  AND constraint_type = 'UNIQUE';
-- Expected: unique_user_preferences on user_id

-- 8. Test default preferences function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'initialize_user_preferences';
-- Expected: Function definition exists
```

### Step 4: Test with Existing Users

```sql
-- For existing users, manually trigger preference initialization
-- (New users will auto-initialize via trigger)

-- Insert default preferences for existing user
INSERT INTO user_preferences (user_id, preferences)
SELECT id, '{
  "theme": "system",
  "sidebarCollapsed": false,
  "tableDensity": "comfortable",
  "rowsPerPage": 25,
  "enableAnimations": true,
  "notifications": {
    "toast": true,
    "email": false,
    "inApp": true,
    "frequency": "immediate",
    "categories": {
      "generationComplete": true,
      "approvalRequired": true,
      "errors": true,
      "systemAlerts": true
    }
  },
  "defaultFilters": {
    "tier": null,
    "status": null,
    "qualityRange": [0, 10],
    "autoApply": false
  },
  "exportPreferences": {
    "defaultFormat": "json",
    "includeMetadata": true,
    "includeQualityScores": true,
    "includeTimestamps": true,
    "includeApprovalHistory": false,
    "autoCompression": true,
    "autoCompressionThreshold": 1000
  },
  "keyboardShortcuts": {
    "enabled": true,
    "customBindings": {
      "openSearch": "Ctrl+K",
      "generateAll": "Ctrl+G",
      "export": "Ctrl+E",
      "approve": "A",
      "reject": "R",
      "nextItem": "ArrowRight",
      "previousItem": "ArrowLeft"
    }
  },
  "qualityThresholds": {
    "autoApproval": 8.0,
    "flagging": 6.0,
    "minimumAcceptable": 4.0
  },
  "retryConfig": {
    "strategy": "exponential",
    "maxAttempts": 3,
    "baseDelayMs": 1000,
    "maxDelayMs": 300000,
    "continueOnError": false
  }
}'::jsonb
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;
```

### Step 5: Verify Application Integration

1. **Start the application**:
   ```bash
   cd train-wireframe
   npm run dev
   ```

2. **Check browser console** for errors
   - Look for "Loading preferences" messages
   - Verify no authentication errors
   - Check for successful database queries

3. **Test preferences loading**:
   - Sign in as a user
   - Open browser DevTools → Network tab
   - Look for Supabase queries to `user_preferences` table
   - Verify successful response (200 status)

4. **Test preferences saving**:
   - Navigate to Settings view
   - Toggle a preference (e.g., Enable Animations)
   - Wait 300ms (debounce delay)
   - Check Network tab for UPDATE query to `user_preferences`
   - Refresh page and verify preference persisted

## 🐛 Troubleshooting

### Error: relation "user_preferences" does not exist

**Cause**: Migration not applied or failed  
**Solution**: Re-run migration, check for SQL syntax errors

### Error: permission denied for table user_preferences

**Cause**: RLS policies not created or incorrectly configured  
**Solution**: Verify RLS policies exist and `auth.uid() = user_id` condition is correct

### Error: duplicate key value violates unique constraint "unique_user_preferences"

**Cause**: Attempting to insert multiple preference records for same user  
**Solution**: This is expected behavior - use UPDATE or UPSERT instead of INSERT

### Error: function initialize_user_preferences() does not exist

**Cause**: Function not created or trigger not attached  
**Solution**: Re-run migration, verify function and trigger exist

### Preferences not loading in UI

**Cause**: Authentication issue or service layer error  
**Solution**: 
1. Check `supabase.auth.getUser()` returns authenticated user
2. Check browser console for errors
3. Verify Supabase client is initialized correctly
4. Check `loadPreferences()` is called in App.tsx useEffect

### Preferences not saving

**Cause**: Validation errors or database connection issues  
**Solution**:
1. Check console for validation error messages
2. Verify RLS policies allow UPDATE
3. Wait full 300ms debounce period
4. Check Network tab for failed requests

## ✅ Migration Validation Checklist

- [ ] Migration applied successfully (no SQL errors)
- [ ] user_preferences table exists
- [ ] All columns present (id, user_id, preferences, created_at, updated_at)
- [ ] RLS enabled on table
- [ ] 4 RLS policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] Unique constraint on user_id exists
- [ ] 3+ indexes exist (PK, user_id, GIN on preferences)
- [ ] Triggers exist (update_updated_at_column, on_auth_user_created)
- [ ] Functions exist (update_updated_at_column, initialize_user_preferences)
- [ ] configuration_audit_log table exists (optional)
- [ ] Test user can read own preferences
- [ ] Test user cannot read other user's preferences
- [ ] Test user can update own preferences
- [ ] Test new user gets default preferences on signup
- [ ] Application loads preferences on startup
- [ ] Application saves preferences with debouncing
- [ ] Preferences persist across page refreshes

## 📊 Post-Migration Monitoring

After migration, monitor these metrics:

```sql
-- Count total users with preferences
SELECT COUNT(*) FROM user_preferences;

-- Count users without preferences (should be 0 after trigger setup)
SELECT COUNT(*) 
FROM auth.users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE up.id IS NULL;

-- Check preference update frequency
SELECT 
  DATE_TRUNC('hour', updated_at) as hour,
  COUNT(*) as updates
FROM user_preferences
WHERE updated_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Most recently updated preferences
SELECT user_id, updated_at, preferences->'theme' as theme
FROM user_preferences
ORDER BY updated_at DESC
LIMIT 10;
```

## 🔄 Rolling Back (If Needed)

If you need to rollback the migration:

```sql
-- WARNING: This will delete all user preferences data!

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop functions
DROP FUNCTION IF EXISTS initialize_user_preferences();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop audit log table (if created)
DROP TABLE IF EXISTS configuration_audit_log;

-- Drop main table
DROP TABLE IF EXISTS user_preferences;
```

---

**Migration File**: `supabase/migrations/20251101_create_user_preferences.sql`  
**Created**: November 1, 2025  
**Status**: Ready for deployment

