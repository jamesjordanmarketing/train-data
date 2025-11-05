# Settings & Administration Module - Database Migration Deployment Guide

## Overview

This guide covers the safe deployment of database migrations for the Settings & Administration Module (E08).

## Prerequisites

- [ ] All code changes deployed to staging
- [ ] Staging validation completed successfully
- [ ] Database backup created
- [ ] Rollback procedures tested in staging
- [ ] Downtime window scheduled (if needed)
- [ ] Team notified of deployment

## Migration Files

The following migrations must be applied in order:

1. `20251101_create_user_preferences.sql` - User preferences table
2. `20251101_create_ai_configurations.sql` - AI configurations table
3. `20251101_create_maintenance_operations.sql` - Maintenance operations log
4. `20251101_create_configuration_audit_log.sql` - Configuration audit trail

## Pre-Deployment Checklist

### Staging Environment

- [ ] Apply migrations to staging database
- [ ] Verify RLS policies work correctly
- [ ] Verify triggers fire as expected
- [ ] Test user preference CRUD operations
- [ ] Test AI configuration CRUD operations
- [ ] Test configuration rollback functionality
- [ ] Test database health monitoring queries
- [ ] Verify audit trail captures all changes
- [ ] Performance test: preference queries < 100ms
- [ ] Performance test: health queries < 500ms

### Production Backup

- [ ] Create full database backup
- [ ] Verify backup is complete and valid
- [ ] Store backup in secure location
- [ ] Document backup timestamp and size
- [ ] Test restore procedure (optional, recommended)

### Rollback Scripts

Prepare rollback scripts in reverse order:

```sql
-- Rollback 4: Drop configuration audit log
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON public.user_preferences;
DROP FUNCTION IF EXISTS public.log_user_preferences_changes();
DROP POLICY IF EXISTS "No deletes from audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "No updates to audit log" ON public.configuration_audit_log;
DROP POLICY IF EXISTS "Users can view own configuration audit logs" ON public.configuration_audit_log;
DROP TABLE IF EXISTS public.configuration_audit_log;

-- Rollback 3: Drop maintenance operations log
DROP POLICY IF EXISTS "Admins can insert maintenance operations" ON public.maintenance_operations;
DROP POLICY IF EXISTS "Authenticated users can view maintenance operations" ON public.maintenance_operations;
DROP TABLE IF EXISTS public.maintenance_operations;

-- Rollback 2: Drop AI configurations
DROP TRIGGER IF EXISTS ai_configuration_audit_trigger ON public.ai_configurations;
DROP FUNCTION IF EXISTS public.log_ai_config_changes();
DROP FUNCTION IF EXISTS public.get_effective_ai_config(UUID);
DROP TABLE IF EXISTS public.ai_configuration_audit;
DROP TABLE IF EXISTS public.ai_configurations;

-- Rollback 1: Drop user preferences
DROP TRIGGER IF EXISTS initialize_user_preferences_on_signup ON auth.users;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS public.initialize_user_preferences();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.user_preferences;
```

## Deployment Steps

### Step 1: Pre-Migration Validation

1. Verify production database connection:
```sql
SELECT version();
SELECT current_database();
```

2. Check for conflicting table names:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_preferences', 'ai_configurations', 'maintenance_operations', 'configuration_audit_log');
```

Expected: 0 rows (tables don't exist yet)

3. Verify auth.users table exists:
```sql
SELECT COUNT(*) FROM auth.users;
```

### Step 2: Apply Migrations

Execute migrations in Supabase SQL Editor in order:

#### Migration 1: User Preferences

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to initialize preferences on user signup
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, preferences)
  VALUES (NEW.id, '{
    "theme": "system",
    "sidebarCollapsed": false,
    "tableDensity": "comfortable",
    "rowsPerPage": 25,
    "enableAnimations": true,
    "notifications": {
      "emailDigest": true,
      "generationComplete": true,
      "qualityAlerts": true,
      "weeklyReport": false
    },
    "defaultFilters": {
      "autoApply": false,
      "tier": [],
      "status": [],
      "qualityRange": [0, 100]
    }
  }'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_preferences();

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
```

Verify:
```sql
SELECT COUNT(*) FROM public.user_preferences;
-- Expected: Number of existing users (auto-initialized)

SELECT * FROM pg_policies WHERE tablename = 'user_preferences';
-- Expected: 3 policies
```

#### Migration 2: AI Configurations

```sql
-- Create ai_configurations table
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI config"
  ON public.ai_configurations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI config"
  ON public.ai_configurations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI config"
  ON public.ai_configurations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI config"
  ON public.ai_configurations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get effective AI configuration (with fallback)
CREATE OR REPLACE FUNCTION public.get_effective_ai_config(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_config JSONB;
  default_config JSONB := '{
    "model": "claude-sonnet-4-5-20250929",
    "maxTokens": 4096,
    "temperature": 1.0,
    "topP": 1.0
  }'::jsonb;
BEGIN
  SELECT config INTO user_config
  FROM public.ai_configurations
  WHERE user_id = p_user_id AND is_active = true;
  
  RETURN COALESCE(user_config, default_config);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index
CREATE INDEX idx_ai_configurations_user_id ON public.ai_configurations(user_id);
```

Verify:
```sql
SELECT COUNT(*) FROM public.ai_configurations;
-- Expected: 0 (no configurations yet)

SELECT * FROM pg_policies WHERE tablename = 'ai_configurations';
-- Expected: 4 policies

SELECT proname FROM pg_proc WHERE proname = 'get_effective_ai_config';
-- Expected: 1 row (function exists)
```

#### Migration 3: Maintenance Operations

```sql
-- Create maintenance_operations table
CREATE TABLE IF NOT EXISTS public.maintenance_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  table_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.maintenance_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view maintenance operations"
  ON public.maintenance_operations
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert maintenance operations"
  ON public.maintenance_operations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_maintenance_operations_status ON public.maintenance_operations(status);
CREATE INDEX idx_maintenance_operations_type ON public.maintenance_operations(operation_type);
```

Verify:
```sql
SELECT COUNT(*) FROM public.maintenance_operations;
-- Expected: 0

SELECT * FROM pg_policies WHERE tablename = 'maintenance_operations';
-- Expected: 2 policies
```

#### Migration 4: Configuration Audit Log

```sql
-- Create configuration_audit_log table
CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changes JSONB NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for users, append-only)
CREATE POLICY "Users can view own configuration audit logs"
  ON public.configuration_audit_log
  FOR SELECT
  USING (auth.uid() = changed_by);

CREATE POLICY "No updates to audit log"
  ON public.configuration_audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes from audit log"
  ON public.configuration_audit_log
  FOR DELETE
  USING (false);

-- Trigger to log user preference changes
CREATE OR REPLACE FUNCTION public.log_user_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.configuration_audit_log (
    config_type,
    changed_by,
    changes,
    previous_value,
    new_value
  ) VALUES (
    'user_preference',
    NEW.user_id,
    jsonb_build_object('preferences', NEW.preferences),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.preferences ELSE NULL END,
    NEW.preferences
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_audit_trigger
  AFTER INSERT OR UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_preferences_changes();

-- Create indexes
CREATE INDEX idx_config_audit_changed_by ON public.configuration_audit_log(changed_by);
CREATE INDEX idx_config_audit_type ON public.configuration_audit_log(config_type);
CREATE INDEX idx_config_audit_created_at ON public.configuration_audit_log(created_at);
```

Verify:
```sql
SELECT COUNT(*) FROM public.configuration_audit_log;
-- Expected: 0

SELECT tgname FROM pg_trigger WHERE tgname = 'user_preferences_audit_trigger';
-- Expected: 1 row (trigger exists)
```

### Step 3: Post-Migration Validation

1. Test user preferences initialization:
```sql
-- Create test user via Supabase Auth UI
-- Then verify preferences auto-initialized:
SELECT * FROM public.user_preferences WHERE user_id = '<test-user-id>';
-- Expected: 1 row with default preferences
```

2. Test RLS policies:
```sql
-- As test user, try to access another user's preferences
-- Should return 0 rows (RLS blocks access)
```

3. Test audit trail:
```sql
-- Update preferences as test user
UPDATE public.user_preferences
SET preferences = jsonb_set(preferences, '{theme}', '"dark"')
WHERE user_id = '<test-user-id>';

-- Verify audit log entry
SELECT * FROM public.configuration_audit_log
WHERE changed_by = '<test-user-id>';
-- Expected: 1+ rows
```

4. Test AI configuration fallback:
```sql
SELECT public.get_effective_ai_config('<test-user-id>');
-- Expected: JSON with default configuration
```

5. Performance validation:
```sql
EXPLAIN ANALYZE
SELECT preferences FROM public.user_preferences WHERE user_id = '<test-user-id>';
-- Expected: Execution time < 100ms
```

## Monitoring Post-Deployment

### Critical Metrics to Monitor

1. **User Preferences Queries** (first 24 hours):
   - Query count: Should match user login count
   - Average execution time: < 100ms
   - Error rate: < 0.1%

2. **Configuration Audit Log** (first 24 hours):
   - Insert count: Should match preference updates
   - Table size growth: < 10MB per day

3. **Database Health Queries** (first hour):
   - Execution time: < 500ms
   - No index scan errors

### Alerts to Configure

```sql
-- Alert on slow preference queries
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%user_preferences%'
AND mean_exec_time > 100;

-- Alert on failed preference updates
SELECT * FROM pg_stat_database
WHERE datname = current_database()
AND conflicts > 0;

-- Alert on high audit log growth
SELECT pg_size_pretty(pg_total_relation_size('public.configuration_audit_log'));
```

## Rollback Procedures

### When to Rollback

Rollback if any of these occur within 1 hour:
- Error rate > 5% on preference queries
- Any RLS policy failures
- Trigger failures preventing updates
- Performance degradation > 50%

### Rollback Execution

1. Stop application deployments
2. Execute rollback scripts (reverse order)
3. Restore database from backup (if needed)
4. Verify rollback successful
5. Restart application with previous code version
6. Monitor for 30 minutes

### Post-Rollback

1. Document rollback reason
2. Analyze failure cause
3. Fix issues in staging
4. Re-validate in staging
5. Schedule new deployment

## Success Criteria

Deployment is successful when:
- [ ] All migrations applied without errors
- [ ] All RLS policies enforce correct access
- [ ] All triggers fire correctly
- [ ] Audit trail captures all changes
- [ ] Performance within acceptable limits
- [ ] No errors in application logs (1 hour)
- [ ] User preferences load correctly
- [ ] AI configuration fallback works
- [ ] Database health dashboard displays metrics
- [ ] Cross-tab preference sync works

## Deployment Checklist Summary

### Pre-Deployment
- [ ] Code deployed to staging
- [ ] Staging validation passed
- [ ] Production backup created
- [ ] Rollback scripts prepared
- [ ] Team notified

### Deployment
- [ ] Migration 1 applied and verified
- [ ] Migration 2 applied and verified
- [ ] Migration 3 applied and verified
- [ ] Migration 4 applied and verified
- [ ] Post-migration validation passed

### Post-Deployment
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Performance within limits
- [ ] No errors in logs (1 hour)
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Team notified of completion

## Frontend Integration Deployment

### Code Deployment Steps

1. **Deploy Theme System**:
   - Verify `train-wireframe/src/lib/theme.ts` deployed
   - Verify App.tsx theme initialization deployed
   - Verify dark mode CSS in index.css deployed

2. **Deploy Preference Integration**:
   - Verify DashboardView uses `preferences.rowsPerPage`
   - Verify default filters auto-apply on load
   - Verify all table views respect rowsPerPage preference

3. **Deploy Tests**:
   - Verify all test files deployed
   - Run test suite: `npm test`
   - Verify test coverage > 80%

### Validation Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- user-preferences-service.test
npm test -- SettingsView.test
npm test -- theme-integration.test

# Check test coverage
npm run coverage
```

## Performance Targets

- Theme application: < 50ms
- Preference load: < 100ms
- Preference update: < 200ms
- AI config load: < 100ms
- Database health query: < 500ms
- Table render with preferences: < 200ms

## Security Considerations

- RLS policies prevent cross-user access
- Audit trail immutable (append-only)
- API keys encrypted in database
- Authentication required for all routes
- Validation on client and server
- CSRF protection via Supabase

## Support Contacts

- Database Admin: [contact]
- Backend Lead: [contact]
- DevOps: [contact]
- On-Call Engineer: [contact]

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Policy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Triggers Guide](https://supabase.com/docs/guides/database/triggers)
- [Performance Monitoring](https://supabase.com/docs/guides/platform/performance)

