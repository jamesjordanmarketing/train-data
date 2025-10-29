# Train - Settings & Administration Module Implementation Execution Instructions (E08)
**Generated**: 2025-01-29  
**Segment**: E08 - Settings & Administration Module  
**Total Prompts**: 8  
**Estimated Implementation Time**: 80-100 hours

## Executive Summary

This segment implements the complete Settings & Administration Module covering FR8.1.1 (Customizable User Settings), FR8.2.1 (AI Generation Settings), and FR8.2.2 (Database Maintenance). This critical infrastructure enables:

1. **User Personalization** - Comprehensive preference system for theme, display, notifications, filters, export, shortcuts, and quality thresholds
2. **AI Configuration Management** - Fine-grained control over Claude API parameters, rate limiting, retry strategies, cost management, and model selection
3. **System Health Monitoring** - Database performance tracking, query optimization, maintenance operations, and health alerts

**Strategic Importance**: This module transforms the platform from a fixed-configuration system to a fully customizable, production-ready application with enterprise-grade configuration management and operational monitoring capabilities.

## Context and Dependencies

### Previous Segment Deliverables

Based on the progression of E01-E07 segments:
- **E01-E03**: Foundation modules (document management, chunk extraction, workflow)
- **E04-E06**: Core conversation generation features (templates, scenarios, edge cases)
- **E07**: Review and quality control systems

The Settings & Administration module builds upon ALL previous segments by providing:
- Configuration layer that affects ALL feature behaviors
- System monitoring for ALL database operations
- User preferences that customize ALL UI interactions

### Current Codebase State

**Existing Implementation:**
- Basic SettingsView exists with minimal functionality (2 switches only)
  - File: `train-wireframe/src/components/views/SettingsView.tsx`
  - Current fields: enableAnimations, keyboardShortcutsEnabled
- Minimal UserPreferences type (6 fields)
  - File: `train-wireframe/src/lib/types.ts:216-223`
- Basic AI_CONFIG (hardcoded values, no database storage)
  - File: `src/lib/ai-config.ts`
- Established database service patterns
  - File: `src/lib/database.ts`
- Zustand store for state management
  - File: `train-wireframe/src/stores/useAppStore.ts`

**Gaps to Fill:**
1. Extended UserPreferences type with notification, filter, export, shortcut, quality threshold fields
2. Database schema for user_preferences table
3. AI configuration database schema and service layer
4. Database health monitoring infrastructure
5. Configuration change audit trail
6. Enhanced Settings UI with multiple sections
7. New AI Configuration Settings view
8. New Database Health Dashboard view
9. Integration of preferences throughout the application
10. Theme application logic
11. Unit testing suite

### Cross-Segment Dependencies

**Upstream Dependencies (Required Before This Segment):**
- User authentication system (auth.users table) - COMPLETE
- Supabase database setup - COMPLETE
- Zustand state management - COMPLETE
- Shadcn/UI component library - COMPLETE

**Downstream Impact (Segments Affected By This Module):**
- **All UI Components**: Theme and display preferences affect rendering
- **Dashboard & Tables**: Rows per page, table density, sidebar collapsed state
- **Batch Generation**: AI configuration controls all generation operations
- **Export System**: Export preferences set default formats and options
- **Database Operations**: Health monitoring tracks all query performance

**Integration Points:**
- AI generation API routes must read AI configuration from database
- All table components must respect user's rowsPerPage preference
- Theme provider must apply user's theme selection
- Notification system must respect user's notification preferences
- Database queries must be monitored for performance metrics

## Implementation Strategy

### Risk Assessment

**High-Risk Tasks:**
1. **Database Migration Deployment (T-6.1.0)** - Production database changes
   - **Risk**: Data loss, downtime, rollback failures
   - **Mitigation**: Comprehensive backup, staging validation, rollback scripts tested
2. **AI Configuration Integration (T-1.2.3, T-4.1.0)** - Changing core generation behavior
   - **Risk**: Breaking existing generation workflows, cost overruns
   - **Mitigation**: Default fallback values, configuration validation, gradual rollout
3. **User Preferences Integration (T-4.1.0, T-4.1.2)** - Application-wide state changes
   - **Risk**: Flash of incorrect state, preferences not loading, cross-tab sync issues
   - **Mitigation**: Loading states, error boundaries, BroadcastChannel for sync

**Medium-Risk Tasks:**
1. **Database Health Queries (T-1.3.2)** - PostgreSQL system catalog queries
   - **Risk**: Slow queries affecting performance, missing extensions (pg_stat_statements)
   - **Mitigation**: Query performance testing, graceful extension handling
2. **Configuration Audit Trail (T-2.1.1, T-2.1.2)** - Immutable log tables
   - **Risk**: Audit log corruption, trigger failures
   - **Mitigation**: Trigger testing, RLS policy verification

**Low-Risk Tasks:**
1. UI component enhancements (T-3.1.1, T-3.1.2, T-3.2.1, T-3.2.2, T-3.3.1)
2. Type definitions (T-1.1.1, T-1.2.1, T-1.3.1)
3. Unit testing (T-5.1.0)

### Prompt Sequencing Logic

**Optimal Implementation Sequence:**

**Phase 1: Foundation (Prompts 1-3)**
- Start with data models and database schema to establish storage layer
- Prompt 1: User Preferences Foundation (T-1.1.0) - Complete data model, schema, service layer
- Prompt 2: AI Configuration Foundation (T-1.2.0) - Complete AI config system
- Prompt 3: Database Health Monitoring Foundation (T-1.3.0) - Complete monitoring infrastructure

**Rationale**: Database layer must exist before UI can interact with it. These three prompts are independent and establish parallel infrastructure components.

**Phase 2: Audit & Data Management (Prompt 4)**
- Prompt 4: Configuration Change Management (T-2.1.0) - Audit trails, rollback, change tracking

**Rationale**: Audit system depends on preferences and AI config tables existing. Must be in place before UI allows configuration changes.

**Phase 3: User Interface (Prompts 5-7)**
- Prompt 5: Settings View UI Enhancement (T-3.1.0) - Complete user preferences UI
- Prompt 6: AI Configuration Settings UI (T-3.2.0) - Complete AI config UI
- Prompt 7: Database Health Dashboard UI (T-3.3.0) - Complete health monitoring UI

**Rationale**: UI layer consumes foundation services. These three prompts are UI-focused and can be implemented independently once foundation exists.

**Phase 4: Integration & Deployment (Prompt 8)**
- Prompt 8: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0) - Complete integration, testing, migration deployment

**Rationale**: Final integration ensures all pieces work together. Testing validates implementation. Migration deployment brings to production.

### Quality Assurance Approach

**Per-Prompt Validation:**
- Each prompt includes specific acceptance criteria from task inventory
- Validation steps verify database queries, UI rendering, state management
- Manual testing scenarios provided for each feature

**Cross-Prompt Integration Testing:**
- Phase 4 includes comprehensive integration test scenarios
- Verify user preferences apply across all UI components
- Verify AI configuration affects generation behavior
- Verify database health metrics are accurate

**Production Readiness Checklist:**
- All database migrations tested in staging
- Backup and rollback procedures validated
- RLS policies verified for data isolation
- Performance targets met (< 500ms queries)
- Audit trail completeness validated
- User acceptance testing completed

## Database Setup Instructions

### Required SQL Operations

The following SQL migrations must be executed in Supabase SQL Editor in the order specified. Each migration includes rollback scripts for safety.

========================

-- Migration: Create User Preferences Table
-- File: YYYYMMDDHHMMSS_create_user_preferences.sql
-- Description: Stores user-specific preference settings with JSONB for flexibility
-- Rollback: See rollback section at end

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_created_at ON public.user_preferences(created_at DESC);
CREATE INDEX idx_user_preferences_jsonb ON public.user_preferences USING GIN (preferences);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to initialize default preferences for new users
CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id, preferences)
    VALUES (
        NEW.id,
        jsonb_build_object(
            'theme', 'system',
            'sidebarCollapsed', false,
            'tableDensity', 'comfortable',
            'rowsPerPage', 25,
            'enableAnimations', true,
            'keyboardShortcutsEnabled', true,
            'notifications', jsonb_build_object(
                'toast', true,
                'email', false,
                'inApp', true,
                'frequency', 'immediate'
            ),
            'defaultFilters', jsonb_build_object(
                'tier', null,
                'status', null,
                'qualityRange', jsonb_build_array(0, 10)
            ),
            'exportPreferences', jsonb_build_object(
                'defaultFormat', 'json',
                'includeMetadata', true,
                'includeQualityScores', true,
                'autoCompression', true
            ),
            'qualityThresholds', jsonb_build_object(
                'autoApproval', 8.0,
                'flagging', 6.0,
                'minimumAcceptable', 4.0
            )
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users for automatic preference initialization
CREATE TRIGGER initialize_user_preferences_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_preferences();

-- Rollback script (run in reverse order if needed)
-- DROP TRIGGER IF EXISTS initialize_user_preferences_on_signup ON auth.users;
-- DROP FUNCTION IF EXISTS public.initialize_user_preferences();
-- DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
-- DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
-- DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
-- DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();
-- DROP INDEX IF EXISTS idx_user_preferences_jsonb;
-- DROP INDEX IF EXISTS idx_user_preferences_created_at;
-- DROP INDEX IF EXISTS idx_user_preferences_user_id;
-- DROP TABLE IF EXISTS public.user_preferences;

++++++++++++++++++

-- Migration: Create AI Configurations Table
-- File: YYYYMMDDHHMMSS_create_ai_configurations.sql
-- Description: Stores AI generation configuration with user/org level overrides
-- Rollback: See rollback section at end

-- Create ai_configurations table
CREATE TABLE IF NOT EXISTS public.ai_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    config_name VARCHAR(255) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT ai_configurations_user_or_org_check CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL)
    ),
    CONSTRAINT ai_configurations_user_config_name_unique UNIQUE (user_id, config_name),
    CONSTRAINT ai_configurations_org_config_name_unique UNIQUE (organization_id, config_name)
);

-- Create indexes
CREATE INDEX idx_ai_configurations_user_id ON public.ai_configurations(user_id);
CREATE INDEX idx_ai_configurations_org_id ON public.ai_configurations(organization_id);
CREATE INDEX idx_ai_configurations_is_active ON public.ai_configurations(is_active) WHERE is_active = true;
CREATE INDEX idx_ai_configurations_jsonb ON public.ai_configurations USING GIN (configuration);
CREATE INDEX idx_ai_configurations_created_at ON public.ai_configurations(created_at DESC);

-- Attach updated_at trigger
CREATE TRIGGER update_ai_configurations_updated_at
    BEFORE UPDATE ON public.ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI configs"
    ON public.ai_configurations
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT user_id FROM public.organization_members
            WHERE organization_id = ai_configurations.organization_id
        )
    );

CREATE POLICY "Users can update own AI configs"
    ON public.ai_configurations
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = created_by)
    WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can insert own AI configs"
    ON public.ai_configurations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own AI configs"
    ON public.ai_configurations
    FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Create AI configuration audit log table
CREATE TABLE IF NOT EXISTS public.ai_configuration_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_id UUID NOT NULL REFERENCES public.ai_configurations(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'activated', 'deactivated'
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for audit log
CREATE INDEX idx_ai_config_audit_config_id ON public.ai_configuration_audit(config_id);
CREATE INDEX idx_ai_config_audit_changed_by ON public.ai_configuration_audit(changed_by);
CREATE INDEX idx_ai_config_audit_created_at ON public.ai_configuration_audit(created_at DESC);
CREATE INDEX idx_ai_config_audit_action ON public.ai_configuration_audit(action);

-- RLS for audit log (read-only)
ALTER TABLE public.ai_configuration_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI config audit logs"
    ON public.ai_configuration_audit
    FOR SELECT
    USING (
        changed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.ai_configurations
            WHERE id = config_id AND (user_id = auth.uid() OR created_by = auth.uid())
        )
    );

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_ai_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.ai_configuration_audit (config_id, action, changed_by, new_values)
        VALUES (NEW.id, 'created', NEW.created_by, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.ai_configuration_audit (config_id, action, changed_by, old_values, new_values)
        VALUES (NEW.id, 'updated', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.ai_configuration_audit (config_id, action, changed_by, old_values)
        VALUES (OLD.id, 'deleted', auth.uid(), to_jsonb(OLD));
    END IF;
    RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger
CREATE TRIGGER ai_configuration_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.log_ai_config_changes();

-- Create function to get effective AI configuration (with fallback chain)
CREATE OR REPLACE FUNCTION public.get_effective_ai_config(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_config JSONB;
    v_default_config JSONB;
BEGIN
    -- Define default configuration
    v_default_config := jsonb_build_object(
        'model', 'claude-sonnet-4-5-20250929',
        'temperature', 0.7,
        'maxTokens', 4096,
        'topP', 0.9,
        'streaming', false,
        'rateLimiting', jsonb_build_object(
            'requestsPerMinute', 50,
            'concurrentRequests', 3,
            'burstAllowance', 10
        ),
        'retryStrategy', jsonb_build_object(
            'maxRetries', 3,
            'backoffType', 'exponential',
            'baseDelay', 1000,
            'maxDelay', 16000
        ),
        'costBudget', jsonb_build_object(
            'dailyBudget', 100.0,
            'weeklyBudget', 500.0,
            'monthlyBudget', 2000.0,
            'alertThresholds', jsonb_build_array(0.5, 0.75, 0.9)
        ),
        'timeouts', jsonb_build_object(
            'generationTimeout', 60000,
            'connectionTimeout', 10000,
            'totalRequestTimeout', 120000
        )
    );
    
    -- Try to get user-specific active configuration
    SELECT configuration INTO v_config
    FROM public.ai_configurations
    WHERE user_id = p_user_id AND is_active = true
    ORDER BY priority DESC
    LIMIT 1;
    
    -- If no user config, return default
    IF v_config IS NULL THEN
        RETURN v_default_config;
    END IF;
    
    -- Merge user config with defaults (user config takes precedence)
    RETURN v_default_config || v_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_effective_ai_config(UUID) TO authenticated;

-- Rollback script
-- DROP FUNCTION IF EXISTS public.get_effective_ai_config(UUID);
-- DROP TRIGGER IF EXISTS ai_configuration_audit_trigger ON public.ai_configurations;
-- DROP FUNCTION IF EXISTS public.log_ai_config_changes();
-- DROP POLICY IF EXISTS "Users can view AI config audit logs" ON public.ai_configuration_audit;
-- DROP INDEX IF EXISTS idx_ai_config_audit_action;
-- DROP INDEX IF EXISTS idx_ai_config_audit_created_at;
-- DROP INDEX IF EXISTS idx_ai_config_audit_changed_by;
-- DROP INDEX IF EXISTS idx_ai_config_audit_config_id;
-- DROP TABLE IF EXISTS public.ai_configuration_audit;
-- DROP POLICY IF EXISTS "Users can delete own AI configs" ON public.ai_configurations;
-- DROP POLICY IF EXISTS "Users can insert own AI configs" ON public.ai_configurations;
-- DROP POLICY IF EXISTS "Users can update own AI configs" ON public.ai_configurations;
-- DROP POLICY IF EXISTS "Users can view own AI configs" ON public.ai_configurations;
-- DROP TRIGGER IF EXISTS update_ai_configurations_updated_at ON public.ai_configurations;
-- DROP INDEX IF EXISTS idx_ai_configurations_created_at;
-- DROP INDEX IF EXISTS idx_ai_configurations_jsonb;
-- DROP INDEX IF EXISTS idx_ai_configurations_is_active;
-- DROP INDEX IF EXISTS idx_ai_configurations_org_id;
-- DROP INDEX IF EXISTS idx_ai_configurations_user_id;
-- DROP TABLE IF EXISTS public.ai_configurations;

++++++++++++++++++

-- Migration: Create Maintenance Operations Log Table
-- File: YYYYMMDDHHMMSS_create_maintenance_operations.sql
-- Description: Tracks database maintenance operations (VACUUM, ANALYZE, REINDEX)
-- Rollback: See rollback section at end

CREATE TABLE IF NOT EXISTS public.maintenance_operations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL, -- 'VACUUM', 'ANALYZE', 'REINDEX', 'VACUUM FULL'
    table_name VARCHAR(255),
    index_name VARCHAR(255),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    status VARCHAR(50) NOT NULL, -- 'queued', 'running', 'completed', 'failed'
    initiated_by UUID REFERENCES auth.users(id),
    error_message TEXT,
    options JSONB, -- Additional operation parameters
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_maintenance_ops_table_name ON public.maintenance_operations(table_name);
CREATE INDEX idx_maintenance_ops_operation_type ON public.maintenance_operations(operation_type);
CREATE INDEX idx_maintenance_ops_status ON public.maintenance_operations(status);
CREATE INDEX idx_maintenance_ops_started_at ON public.maintenance_operations(started_at DESC);
CREATE INDEX idx_maintenance_ops_created_at ON public.maintenance_operations(created_at DESC);

-- RLS policies
ALTER TABLE public.maintenance_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view maintenance operations"
    ON public.maintenance_operations
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert maintenance operations"
    ON public.maintenance_operations
    FOR INSERT
    WITH CHECK (auth.uid() = initiated_by);

-- Rollback script
-- DROP POLICY IF EXISTS "Admins can insert maintenance operations" ON public.maintenance_operations;
-- DROP POLICY IF EXISTS "Authenticated users can view maintenance operations" ON public.maintenance_operations;
-- DROP INDEX IF EXISTS idx_maintenance_ops_created_at;
-- DROP INDEX IF EXISTS idx_maintenance_ops_started_at;
-- DROP INDEX IF EXISTS idx_maintenance_ops_status;
-- DROP INDEX IF EXISTS idx_maintenance_ops_operation_type;
-- DROP INDEX IF EXISTS idx_maintenance_ops_table_name;
-- DROP TABLE IF EXISTS public.maintenance_operations;

++++++++++++++++++

-- Migration: Create Configuration Audit Log Table
-- File: YYYYMMDDHHMMSS_create_configuration_audit_log.sql
-- Description: Unified audit trail for all configuration changes (user preferences + AI config)
-- Rollback: See rollback section at end

CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL, -- 'user_preference', 'ai_config'
    config_id UUID NOT NULL, -- References either user_preferences.id or ai_configurations.id
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    client_ip INET,
    user_agent TEXT,
    CONSTRAINT config_audit_log_type_check CHECK (config_type IN ('user_preference', 'ai_config'))
);

-- Create indexes
CREATE INDEX idx_config_audit_config_type ON public.configuration_audit_log(config_type);
CREATE INDEX idx_config_audit_config_id ON public.configuration_audit_log(config_id);
CREATE INDEX idx_config_audit_changed_by ON public.configuration_audit_log(changed_by);
CREATE INDEX idx_config_audit_changed_at ON public.configuration_audit_log(changed_at DESC);
CREATE INDEX idx_config_audit_old_values ON public.configuration_audit_log USING GIN (old_values);
CREATE INDEX idx_config_audit_new_values ON public.configuration_audit_log USING GIN (new_values);

-- RLS policies (read-only, append-only)
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own configuration audit logs"
    ON public.configuration_audit_log
    FOR SELECT
    USING (changed_by = auth.uid());

-- Prevent updates and deletes (append-only)
CREATE POLICY "No updates to audit log"
    ON public.configuration_audit_log
    FOR UPDATE
    USING (false);

CREATE POLICY "No deletes from audit log"
    ON public.configuration_audit_log
    FOR DELETE
    USING (false);

-- Trigger function for user_preferences audit
CREATE OR REPLACE FUNCTION public.log_user_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values
        ) VALUES (
            'user_preference',
            NEW.id,
            auth.uid(),
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to user_preferences
CREATE TRIGGER user_preferences_audit_trigger
    AFTER UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_preferences_changes();

-- Rollback script
-- DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON public.user_preferences;
-- DROP FUNCTION IF EXISTS public.log_user_preferences_changes();
-- DROP POLICY IF EXISTS "No deletes from audit log" ON public.configuration_audit_log;
-- DROP POLICY IF EXISTS "No updates to audit log" ON public.configuration_audit_log;
-- DROP POLICY IF EXISTS "Users can view own configuration audit logs" ON public.configuration_audit_log;
-- DROP INDEX IF EXISTS idx_config_audit_new_values;
-- DROP INDEX IF EXISTS idx_config_audit_old_values;
-- DROP INDEX IF EXISTS idx_config_audit_changed_at;
-- DROP INDEX IF EXISTS idx_config_audit_changed_by;
-- DROP INDEX IF EXISTS idx_config_audit_config_id;
-- DROP INDEX IF EXISTS idx_config_audit_config_type;
-- DROP TABLE IF EXISTS public.configuration_audit_log;

++++++++++++++++++


## Implementation Prompts

### Prompt 1: User Preferences Foundation (T-1.1.0)
**Scope**: Complete user preferences data model, database integration, and service layer  
**Dependencies**: None (Foundation task) - Database migrations must be applied first  
**Estimated Time**: 6-8 hours  
**Risk Level**: Low-Medium

========================


You are a senior full-stack developer implementing the User Preferences Foundation for the Train platform (Interactive LoRA Training Data Generation). This is a critical infrastructure component that will enable comprehensive user customization across the entire application.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform is a UI-driven workflow for generating, reviewing, and managing 90-100 high-quality training conversations for LoRA fine-tuning. Users need to customize their workspace preferences, notification settings, default filters, export options, keyboard shortcuts, and quality thresholds to optimize their workflow.

**Functional Requirements (FR8.1.1):**
- Settings view accessible from user menu
- User preferences stored per-user in database with JSONB flexibility
- Theme selection: light, dark, system
- Display preferences: sidebar collapsed, table density, rows per page, animations
- Notification preferences: toast, email, in-app notifications, frequency
- Default filters: tier, status, quality range - auto-applied on load
- Export preferences: default format, metadata inclusion, auto-compression
- Keyboard shortcuts: customizable mappings
- Quality thresholds: auto-approval, flagging, minimum acceptable
- Settings auto-save on change with debouncing (300ms)
- Reset to defaults functionality
- Complete audit trail of preference changes

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Shadcn/UI
- **State Management**: Zustand store (`train-wireframe/src/stores/useAppStore.ts`)
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Database**: PostgreSQL with JSONB, RLS policies, audit triggers
- **Type Safety**: Strict TypeScript mode throughout

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Minimal UserPreferences Type** (`train-wireframe/src/lib/types.ts:216-223`):
```typescript
export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  rowsPerPage: number;
  enableAnimations: boolean;
  keyboardShortcutsEnabled: boolean;
};
```

2. **Basic SettingsView** (`train-wireframe/src/components/views/SettingsView.tsx`):
   - Only 2 switches: enableAnimations, keyboardShortcutsEnabled
   - Uses Zustand: `const { preferences, updatePreferences } = useAppStore();`
   - Placeholder sections for Quality Thresholds and Integration Setup

3. **Zustand Store** (`train-wireframe/src/stores/useAppStore.ts`):
   - Has `preferences: UserPreferences` state
   - Has `updatePreferences: (updates: Partial<UserPreferences>) => void` action
   - No database integration yet (all in-memory)

4. **Database Service Patterns** (`src/lib/database.ts`):
   - Established patterns for CRUD operations with Supabase
   - Example: `documentService.getAll()`, `documentService.update()`

5. **Database Schema**:
   - `user_preferences` table created via migration (see Database Setup Instructions)
   - JSONB column for flexible storage
   - RLS policies for user isolation
   - Trigger for automatic initialization on signup

**Gaps to Fill:**
- Extended UserPreferences type with all sub-interfaces
- Service layer for user preferences CRUD operations
- Integration with Zustand store to persist to database
- Auto-save with debouncing (300ms delay)
- Validation functions for preference values
- Default preferences constant
- API routes for preferences management

**IMPLEMENTATION TASKS:**

**Task T-1.1.1: Extend UserPreferences Type Definition**

Create comprehensive TypeScript type definitions in `src/lib/types/user-preferences.ts`:

1. **Define Sub-Interfaces:**
```typescript
export interface NotificationPreferences {
  toast: boolean;
  email: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: {
    generationComplete: boolean;
    approvalRequired: boolean;
    errors: boolean;
    systemAlerts: boolean;
  };
}

export interface DefaultFilterPreferences {
  tier: string[] | null; // ['template', 'scenario'] or null for all
  status: string[] | null;
  qualityRange: [number, number]; // [min, max] 0-10
  autoApply: boolean;
}

export interface ExportPreferences {
  defaultFormat: 'json' | 'jsonl' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  autoCompression: boolean;
  autoCompressionThreshold: number; // conversation count threshold
}

export interface KeyboardShortcuts {
  enabled: boolean;
  customBindings: Record<string, string>; // action -> key combination
}

export interface QualityThresholds {
  autoApproval: number; // 0-10, conversations above this auto-approved
  flagging: number; // 0-10, conversations below this flagged for review
  minimumAcceptable: number; // 0-10, hard minimum for inclusion
}
```

2. **Define Comprehensive UserPreferences Type:**
```typescript
export interface UserPreferences {
  // Display Preferences
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  rowsPerPage: 10 | 25 | 50 | 100;
  enableAnimations: boolean;
  
  // Notification Preferences
  notifications: NotificationPreferences;
  
  // Default Filter Preferences
  defaultFilters: DefaultFilterPreferences;
  
  // Export Preferences
  exportPreferences: ExportPreferences;
  
  // Keyboard Shortcuts
  keyboardShortcuts: KeyboardShortcuts;
  
  // Quality Thresholds
  qualityThresholds: QualityThresholds;
}
```

3. **Define Default Preferences Constant:**
```typescript
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  tableDensity: 'comfortable',
  rowsPerPage: 25,
  enableAnimations: true,
  notifications: {
    toast: true,
    email: false,
    inApp: true,
    frequency: 'immediate',
    categories: {
      generationComplete: true,
      approvalRequired: true,
      errors: true,
      systemAlerts: true,
    },
  },
  defaultFilters: {
    tier: null,
    status: null,
    qualityRange: [0, 10],
    autoApply: false,
  },
  exportPreferences: {
    defaultFormat: 'json',
    includeMetadata: true,
    includeQualityScores: true,
    includeTimestamps: true,
    includeApprovalHistory: false,
    autoCompression: true,
    autoCompressionThreshold: 1000,
  },
  keyboardShortcuts: {
    enabled: true,
    customBindings: {
      'openSearch': 'Ctrl+K',
      'generateAll': 'Ctrl+G',
      'export': 'Ctrl+E',
      'approve': 'A',
      'reject': 'R',
      'nextItem': 'ArrowRight',
      'previousItem': 'ArrowLeft',
    },
  },
  qualityThresholds: {
    autoApproval: 8.0,
    flagging: 6.0,
    minimumAcceptable: 4.0,
  },
};
```

4. **Add Validation Functions:**
```typescript
export function validateUserPreferences(preferences: Partial<UserPreferences>): string[] {
  const errors: string[] = [];
  
  if (preferences.rowsPerPage && ![10, 25, 50, 100].includes(preferences.rowsPerPage)) {
    errors.push('rowsPerPage must be 10, 25, 50, or 100');
  }
  
  if (preferences.qualityThresholds) {
    const { autoApproval, flagging, minimumAcceptable } = preferences.qualityThresholds;
    if (autoApproval < 0 || autoApproval > 10) {
      errors.push('autoApproval must be between 0 and 10');
    }
    if (flagging < 0 || flagging > 10) {
      errors.push('flagging must be between 0 and 10');
    }
    if (minimumAcceptable < 0 || minimumAcceptable > 10) {
      errors.push('minimumAcceptable must be between 0 and 10');
    }
    if (autoApproval < flagging) {
      errors.push('autoApproval must be greater than or equal to flagging threshold');
    }
  }
  
  if (preferences.defaultFilters?.qualityRange) {
    const [min, max] = preferences.defaultFilters.qualityRange;
    if (min < 0 || min > 10 || max < 0 || max > 10) {
      errors.push('Quality range values must be between 0 and 10');
    }
    if (min > max) {
      errors.push('Quality range minimum must be less than or equal to maximum');
    }
  }
  
  return errors;
}
```

**Task T-1.1.2: Database Schema Validation**

The database schema has been created via migration. Validate the implementation:

1. **Verify Table Structure:**
   - `user_preferences` table exists
   - Columns: id (UUID PK), user_id (UUID FK), preferences (JSONB), created_at, updated_at
   - UNIQUE constraint on user_id
   - Indexes: user_id, created_at, GIN index on preferences JSONB

2. **Verify RLS Policies:**
   - Users can SELECT own preferences: `auth.uid() = user_id`
   - Users can UPDATE own preferences: `auth.uid() = user_id`
   - Users can INSERT own preferences: `auth.uid() = user_id`

3. **Verify Triggers:**
   - `update_updated_at_column` function exists
   - Trigger on UPDATE updates `updated_at` timestamp
   - `initialize_user_preferences` function creates default preferences on signup
   - Trigger on auth.users INSERT initializes preferences

**Task T-1.1.3: User Preferences Service Layer**

Create `src/lib/services/user-preferences-service.ts`:

```typescript
import { supabase } from '../supabase';
import { UserPreferences, DEFAULT_USER_PREFERENCES, validateUserPreferences } from '../types/user-preferences';

export interface UserPreferencesRecord {
  id: string;
  user_id: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

class UserPreferencesService {
  /**
   * Get user preferences with fallback to defaults
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.warn('Failed to fetch user preferences, using defaults:', error);
      return DEFAULT_USER_PREFERENCES;
    }
    
    if (!data || !data.preferences) {
      return DEFAULT_USER_PREFERENCES;
    }
    
    // Merge with defaults to ensure new fields exist
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...data.preferences,
    };
  }
  
  /**
   * Update user preferences (partial update with merge)
   */
  async updatePreferences(
    userId: string, 
    updates: Partial<UserPreferences>
  ): Promise<{ success: boolean; errors?: string[] }> {
    // Validate updates
    const validationErrors = validateUserPreferences(updates);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }
    
    // Get current preferences
    const currentPreferences = await this.getPreferences(userId);
    
    // Deep merge updates with current preferences
    const updatedPreferences = this.deepMerge(currentPreferences, updates);
    
    // Update in database
    const { error } = await supabase
      .from('user_preferences')
      .update({ preferences: updatedPreferences })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Failed to update user preferences:', error);
      return { success: false, errors: [error.message] };
    }
    
    return { success: true };
  }
  
  /**
   * Reset to default preferences
   */
  async resetToDefaults(userId: string): Promise<{ success: boolean; errors?: string[] }> {
    const { error } = await supabase
      .from('user_preferences')
      .update({ preferences: DEFAULT_USER_PREFERENCES })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Failed to reset preferences:', error);
      return { success: false, errors: [error.message] };
    }
    
    return { success: true };
  }
  
  /**
   * Deep merge objects (handles nested preferences)
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key] as any);
      } else {
        output[key] = source[key] as any;
      }
    }
    
    return output;
  }
  
  /**
   * Debounced update wrapper for auto-save
   */
  private updateTimeouts = new Map<string, NodeJS.Timeout>();
  
  async updatePreferencesDebounced(
    userId: string,
    updates: Partial<UserPreferences>,
    delay: number = 300
  ): Promise<void> {
    // Clear existing timeout for this user
    const existingTimeout = this.updateTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.updatePreferences(userId, updates);
      this.updateTimeouts.delete(userId);
    }, delay);
    
    this.updateTimeouts.set(userId, timeout);
  }
}

export const userPreferencesService = new UserPreferencesService();
```

**Task T-1.1.4: API Routes for User Preferences**

Create `src/app/api/user-preferences/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { userPreferencesService } from '@/lib/services/user-preferences-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const preferences = await userPreferencesService.getPreferences(user.id);
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const updates = await request.json();
    const result = await userPreferencesService.updatePreferences(user.id, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { action } = await request.json();
    
    if (action === 'reset') {
      const result = await userPreferencesService.resetToDefaults(user.id);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to reset preferences', errors: result.errors },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in user preferences action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
```

**Task T-1.1.5: Update Zustand Store Integration**

Update `train-wireframe/src/stores/useAppStore.ts` to integrate with database:

```typescript
// Add imports
import { userPreferencesService } from '@/lib/services/user-preferences-service';
import { UserPreferences, DEFAULT_USER_PREFERENCES } from '@/lib/types/user-preferences';

// Update store interface
interface AppStore {
  // ... existing state ...
  
  preferences: UserPreferences;
  preferencesLoaded: boolean;
  
  // Actions
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => Promise<void>;
}

// Update store implementation
export const useAppStore = create<AppStore>((set, get) => ({
  // ... existing state ...
  
  preferences: DEFAULT_USER_PREFERENCES,
  preferencesLoaded: false,
  
  loadPreferences: async () => {
    try {
      const response = await fetch('/api/user-preferences');
      if (response.ok) {
        const { preferences } = await response.json();
        set({ preferences, preferencesLoaded: true });
      } else {
        console.error('Failed to load preferences');
        set({ preferences: DEFAULT_USER_PREFERENCES, preferencesLoaded: true });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      set({ preferences: DEFAULT_USER_PREFERENCES, preferencesLoaded: true });
    }
  },
  
  updatePreferences: (updates: Partial<UserPreferences>) => {
    const currentPreferences = get().preferences;
    const updatedPreferences = { ...currentPreferences, ...updates };
    
    // Optimistic update
    set({ preferences: updatedPreferences });
    
    // Debounced API call
    fetch('/api/user-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((error) => {
      console.error('Failed to save preferences:', error);
      // Revert on error
      set({ preferences: currentPreferences });
    });
  },
  
  resetPreferences: async () => {
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      
      if (response.ok) {
        set({ preferences: DEFAULT_USER_PREFERENCES });
      } else {
        console.error('Failed to reset preferences');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  },
}));
```

**ACCEPTANCE CRITERIA:**

1. **Type Definitions:**
   - [ ] UserPreferences type includes all sub-interfaces (Notification, DefaultFilter, Export, KeyboardShortcuts, QualityThresholds)
   - [ ] DEFAULT_USER_PREFERENCES constant defined with sensible defaults
   - [ ] validateUserPreferences function rejects invalid values
   - [ ] TypeScript compilation succeeds with strict mode
   - [ ] All interfaces have JSDoc comments

2. **Database Integration:**
   - [ ] user_preferences table exists with correct schema
   - [ ] RLS policies verified: users can only access own preferences
   - [ ] Triggers verified: updated_at auto-updates, default preferences auto-initialize on signup
   - [ ] JSONB GIN index exists for efficient queries

3. **Service Layer:**
   - [ ] getPreferences() returns preferences with fallback to defaults
   - [ ] updatePreferences() validates input and merges with existing preferences
   - [ ] resetToDefaults() restores default preferences
   - [ ] deepMerge() correctly handles nested object updates
   - [ ] updatePreferencesDebounced() debounces API calls (300ms)

4. **API Routes:**
   - [ ] GET /api/user-preferences returns user's preferences
   - [ ] PATCH /api/user-preferences updates preferences with validation
   - [ ] POST /api/user-preferences with action=reset resets to defaults
   - [ ] All routes require authentication
   - [ ] Error responses include helpful messages

5. **Zustand Store:**
   - [ ] loadPreferences() fetches from API on app initialization
   - [ ] updatePreferences() optimistically updates UI and debounces API call
   - [ ] resetPreferences() calls API and updates state
   - [ ] preferencesLoaded flag prevents premature rendering

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/types/user-preferences.ts (NEW)
src/lib/services/user-preferences-service.ts (NEW)
src/app/api/user-preferences/route.ts (NEW)
train-wireframe/src/stores/useAppStore.ts (UPDATE)
```

**Data Models:**
- UserPreferences interface with 6 sub-interfaces
- DEFAULT_USER_PREFERENCES constant
- UserPreferencesRecord interface for database rows

**API Specifications:**
- GET /api/user-preferences → 200 { preferences: UserPreferences }
- PATCH /api/user-preferences (body: Partial<UserPreferences>) → 200 { success: true } | 400 { errors: string[] }
- POST /api/user-preferences (body: { action: 'reset' }) → 200 { success: true }

**Error Handling:**
- Validation errors return detailed error messages
- Database errors log to console and return generic error to client
- Network failures fall back to default preferences
- Optimistic updates revert on API failure

**Performance:**
- Debounced auto-save (300ms delay)
- Deep merge avoids unnecessary re-renders
- JSONB GIN index for efficient preference queries
- RLS policies enforce user isolation

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Create new user account → verify default preferences initialized
   - Update preference via UI → verify database updated after 300ms
   - Make rapid changes → verify only final value saved (debouncing works)
   - Reset preferences → verify reverted to defaults
   - Check user_preferences table → verify JSONB structure matches type

2. **Database Testing:**
   - Query user_preferences table for test user
   - Verify preferences JSONB contains all expected fields
   - Verify RLS: user A cannot access user B's preferences
   - Verify trigger: updated_at changes on UPDATE
   - Verify audit trail: configuration_audit_log captures changes

3. **API Testing:**
   - Call GET /api/user-preferences → verify returns preferences
   - Call PATCH with valid data → verify success
   - Call PATCH with invalid data → verify 400 error with validation messages
   - Call POST with action=reset → verify preferences reset
   - Call without auth token → verify 401 error

4. **Integration Testing:**
   - Load app → verify preferences loaded before UI renders
   - Change theme preference → verify stored in database
   - Change rowsPerPage → verify value between 10-100
   - Change quality thresholds → verify autoApproval >= flagging
   - Open app in two tabs → verify preference changes sync (via refresh)

**DELIVERABLES:**

1. [ ] `src/lib/types/user-preferences.ts` - Complete type definitions with validation
2. [ ] `src/lib/services/user-preferences-service.ts` - Service layer with CRUD operations
3. [ ] `src/app/api/user-preferences/route.ts` - API routes for preferences management
4. [ ] `train-wireframe/src/stores/useAppStore.ts` - Updated with database integration
5. [ ] Database migrations applied successfully (user_preferences table, triggers, RLS)
6. [ ] Manual testing completed with all validation scenarios passing
7. [ ] API testing completed with Postman/Insomnia
8. [ ] Database testing completed with SQL queries

Implement this foundation completely, ensuring type safety, proper error handling, and comprehensive validation. This component will be used by all subsequent UI enhancements and application-wide preference application.


++++++++++++++++++


### Prompt 2: AI Configuration Foundation (T-1.2.0)
**Scope**: Complete AI configuration data model, database integration, service layer with fallback chain  
**Dependencies**: Database migrations applied  
**Estimated Time**: 8-10 hours  
**Risk Level**: Medium

========================


You are a senior full-stack developer implementing the AI Configuration Foundation for the Train platform. This critical system enables fine-grained control over Claude API parameters, rate limiting, retry strategies, cost management, and model selection at user and organization levels.

**CONTEXT AND REQUIREMENTS:**

**Product Context:**
The Train platform uses Claude API to generate training conversations. Different users and organizations have varying requirements for generation quality, cost budgets, and performance characteristics. The AI Configuration system provides a flexible, hierarchical configuration management system with environment defaults, organizational overrides, and user-specific customization.

**Functional Requirements (FR8.2.1):**
- AI configuration with all Claude API parameters (model, temperature, max_tokens, top_p, streaming)
- Rate limiting configuration (requests/minute, concurrent requests, burst allowance)
- Retry strategy configuration (max retries, backoff type, base/max delays)
- Cost budget tracking (daily/weekly/monthly budgets with alert thresholds)
- API key management with rotation support (primary/secondary keys)
- Timeout configuration (generation, connection, total request timeouts)
- Model selection from available Claude models
- Configuration priority: user DB override → org DB override → environment variables → defaults
- Real-time configuration updates without service restart
- Complete audit trail of configuration changes
- Supabase Vault integration for API key encryption

**Technical Architecture:**
- **Backend**: Next.js API routes, Supabase PostgreSQL, TypeScript
- **Database**: PostgreSQL with JSONB, RLS policies, Supabase Vault for secrets
- **AI Integration**: Anthropic SDK for Claude API
- **Environment Variables**: Support for .env configuration
- **Service Pattern**: Singleton service with caching and fallback chain

**CURRENT CODEBASE STATE:**

**Existing Implementation:**
1. **Basic AI_CONFIG** (`src/lib/ai-config.ts`):
```typescript
export const AI_CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    maxTokens: 4096,
    temperature: 0.7,
};
```

2. **Database Schema**:
   - `ai_configurations` table created via migration (see Database Setup Instructions)
   - Support for user_id OR organization_id (not both)
   - JSONB configuration column for flexibility
   - Audit log table: `ai_configuration_audit`
   - Function: `get_effective_ai_config(user_id)` for fallback chain resolution

3. **API Integration**:
   - Existing dimension generation API: `src/app/api/chunks/generate-dimensions/route.ts`
   - Uses basic AI_CONFIG currently

**Gaps to Fill:**
- Comprehensive AIConfiguration type with all parameters
- Service layer for AI configuration management
- Configuration fallback chain implementation
- API routes for configuration CRUD
- Environment variable integration
- Cost calculation utilities
- Rate limiter implementation
- Retry strategy implementation
- API key rotation logic
- Integration with existing generation endpoints

**IMPLEMENTATION TASKS:**

**Task T-1.2.1: AI Configuration Type Definition**

Create comprehensive TypeScript type definitions in `src/lib/types/ai-config.ts`:

```typescript
export interface ModelConfiguration {
  model: string; // claude-sonnet-4-5-20250929, claude-3-opus, claude-3-haiku
  temperature: number; // 0.0-1.0
  maxTokens: number; // 1-4096
  topP: number; // 0.0-1.0
  streaming: boolean;
}

export interface RateLimitConfiguration {
  requestsPerMinute: number;
  concurrentRequests: number;
  burstAllowance: number; // Extra requests allowed in burst
}

export type BackoffStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryStrategyConfiguration {
  maxRetries: number; // 0-10
  backoffType: BackoffStrategy;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds, cap for exponential backoff
}

export interface CostBudgetConfiguration {
  dailyBudget: number; // USD
  weeklyBudget: number; // USD
  monthlyBudget: number; // USD
  alertThresholds: number[]; // [0.5, 0.75, 0.9] = 50%, 75%, 90%
}

export interface APIKeyConfiguration {
  primaryKey: string; // Encrypted
  secondaryKey?: string; // Optional for rotation
  keyVersion: number;
  rotationSchedule?: 'manual' | 'monthly' | 'quarterly';
}

export interface TimeoutConfiguration {
  generationTimeout: number; // milliseconds
  connectionTimeout: number; // milliseconds
  totalRequestTimeout: number; // milliseconds
}

export interface ModelCapabilities {
  contextWindow: number; // tokens
  outputLimit: number; // tokens
  costPer1kInputTokens: number; // USD
  costPer1kOutputTokens: number; // USD
  supportedFeatures: string[]; // ['vision', 'function_calling', etc]
}

export interface AIConfiguration {
  // Model Configuration
  model: ModelConfiguration;
  
  // Rate Limiting
  rateLimiting: RateLimitConfiguration;
  
  // Retry Strategy
  retryStrategy: RetryStrategyConfiguration;
  
  // Cost Budget
  costBudget: CostBudgetConfiguration;
  
  // API Keys
  apiKeys: APIKeyConfiguration;
  
  // Timeouts
  timeouts: TimeoutConfiguration;
  
  // Metadata
  capabilities?: ModelCapabilities;
}

export const DEFAULT_AI_CONFIGURATION: AIConfiguration = {
  model: {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    streaming: false,
  },
  rateLimiting: {
    requestsPerMinute: 50,
    concurrentRequests: 3,
    burstAllowance: 10,
  },
  retryStrategy: {
    maxRetries: 3,
    backoffType: 'exponential',
    baseDelay: 1000,
    maxDelay: 16000,
  },
  costBudget: {
    dailyBudget: 100.0,
    weeklyBudget: 500.0,
    monthlyBudget: 2000.0,
    alertThresholds: [0.5, 0.75, 0.9],
  },
  apiKeys: {
    primaryKey: '', // Will be loaded from env/vault
    keyVersion: 1,
    rotationSchedule: 'manual',
  },
  timeouts: {
    generationTimeout: 60000,
    connectionTimeout: 10000,
    totalRequestTimeout: 120000,
  },
};

export const AVAILABLE_MODELS: Record<string, ModelCapabilities> = {
  'claude-sonnet-4-5-20250929': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportedFeatures: ['text', 'vision', 'tool_use'],
  },
  'claude-3-opus-20240229': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    supportedFeatures: ['text', 'vision', 'tool_use'],
  },
  'claude-3-haiku-20240307': {
    contextWindow: 200000,
    outputLimit: 4096,
    costPer1kInputTokens: 0.00025,
    costPer1kOutputTokens: 0.00125,
    supportedFeatures: ['text', 'vision'],
  },
};

export function validateAIConfiguration(config: Partial<AIConfiguration>): string[] {
  const errors: string[] = [];
  
  if (config.model) {
    if (config.model.temperature < 0 || config.model.temperature > 1) {
      errors.push('Temperature must be between 0 and 1');
    }
    if (config.model.maxTokens < 1 || config.model.maxTokens > 4096) {
      errors.push('Max tokens must be between 1 and 4096');
    }
    if (config.model.topP < 0 || config.model.topP > 1) {
      errors.push('Top P must be between 0 and 1');
    }
  }
  
  if (config.rateLimiting) {
    if (config.rateLimiting.requestsPerMinute < 1) {
      errors.push('Requests per minute must be at least 1');
    }
    if (config.rateLimiting.concurrentRequests < 1) {
      errors.push('Concurrent requests must be at least 1');
    }
  }
  
  if (config.retryStrategy) {
    if (config.retryStrategy.maxRetries < 0 || config.retryStrategy.maxRetries > 10) {
      errors.push('Max retries must be between 0 and 10');
    }
    if (config.retryStrategy.baseDelay < 0) {
      errors.push('Base delay must be non-negative');
    }
    if (config.retryStrategy.maxDelay < config.retryStrategy.baseDelay) {
      errors.push('Max delay must be greater than or equal to base delay');
    }
  }
  
  if (config.costBudget) {
    if (config.costBudget.dailyBudget < 0) {
      errors.push('Daily budget must be non-negative');
    }
    if (config.costBudget.weeklyBudget < config.costBudget.dailyBudget) {
      errors.push('Weekly budget must be at least daily budget');
    }
    if (config.costBudget.monthlyBudget < config.costBudget.weeklyBudget) {
      errors.push('Monthly budget must be at least weekly budget');
    }
  }
  
  return errors;
}

export function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const capabilities = AVAILABLE_MODELS[model];
  if (!capabilities) {
    console.warn(`Unknown model: ${model}, using default cost`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1000) * capabilities.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * capabilities.costPer1kOutputTokens;
  
  return inputCost + outputCost;
}
```

**Task T-1.2.2: AI Configuration Service Layer**

Create `src/lib/services/ai-config-service.ts`:

```typescript
import { supabase } from '../supabase';
import {
  AIConfiguration,
  DEFAULT_AI_CONFIGURATION,
  validateAIConfiguration,
  ModelConfiguration,
} from '../types/ai-config';

export interface AIConfigurationRecord {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  config_name: string;
  configuration: AIConfiguration;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

class AIConfigService {
  private configCache = new Map<string, AIConfiguration>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get effective AI configuration for user with fallback chain
   * Priority: User DB → Org DB → Environment → Defaults
   */
  async getEffectiveConfiguration(userId: string): Promise<AIConfiguration> {
    const cacheKey = `user:${userId}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    // Try database-based resolution
    const { data, error } = await supabase
      .rpc('get_effective_ai_config', { p_user_id: userId });
    
    if (!error && data) {
      const config = this.mergeWithDefaults(data as Partial<AIConfiguration>);
      this.setCache(cacheKey, config);
      return config;
    }
    
    // Fallback to environment-based configuration
    const envConfig = this.getEnvironmentConfiguration();
    this.setCache(cacheKey, envConfig);
    return envConfig;
  }
  
  /**
   * Get configuration from environment variables
   */
  private getEnvironmentConfiguration(): AIConfiguration {
    return {
      ...DEFAULT_AI_CONFIGURATION,
      model: {
        ...DEFAULT_AI_CONFIGURATION.model,
        model: process.env.ANTHROPIC_MODEL || DEFAULT_AI_CONFIGURATION.model.model,
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096'),
      },
      apiKeys: {
        primaryKey: process.env.ANTHROPIC_API_KEY || '',
        keyVersion: 1,
        rotationSchedule: 'manual',
      },
    };
  }
  
  /**
   * Create or update user AI configuration
   */
  async updateConfiguration(
    userId: string,
    configName: string,
    updates: Partial<AIConfiguration>
  ): Promise<{ success: boolean; errors?: string[] }> {
    // Validate configuration
    const validationErrors = validateAIConfiguration(updates);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }
    
    // Get current configuration
    const currentConfig = await this.getEffectiveConfiguration(userId);
    
    // Merge updates
    const updatedConfig = this.deepMerge(currentConfig, updates);
    
    // Upsert configuration
    const { error } = await supabase
      .from('ai_configurations')
      .upsert({
        user_id: userId,
        config_name: configName,
        configuration: updatedConfig,
        is_active: true,
        priority: 0,
        created_by: userId,
      }, {
        onConflict: 'user_id,config_name',
      });
    
    if (error) {
      console.error('Failed to update AI configuration:', error);
      return { success: false, errors: [error.message] };
    }
    
    // Invalidate cache
    this.invalidateCache(`user:${userId}`);
    
    return { success: true };
  }
  
  /**
   * Delete user AI configuration (revert to organization/environment defaults)
   */
  async deleteConfiguration(userId: string, configName: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('ai_configurations')
      .delete()
      .eq('user_id', userId)
      .eq('config_name', configName);
    
    if (error) {
      console.error('Failed to delete AI configuration:', error);
      return { success: false };
    }
    
    // Invalidate cache
    this.invalidateCache(`user:${userId}`);
    
    return { success: true };
  }
  
  /**
   * Get all configurations for user (for UI display)
   */
  async getUserConfigurations(userId: string): Promise<AIConfigurationRecord[]> {
    const { data, error } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch user configurations:', error);
      return [];
    }
    
    return data as AIConfigurationRecord[];
  }
  
  /**
   * Activate/deactivate configuration
   */
  async toggleConfiguration(configId: string, isActive: boolean): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('ai_configurations')
      .update({ is_active: isActive })
      .eq('id', configId);
    
    if (error) {
      console.error('Failed to toggle configuration:', error);
      return { success: false };
    }
    
    return { success: true };
  }
  
  /**
   * API key rotation
   */
  async rotateAPIKey(userId: string, newPrimaryKey: string): Promise<{ success: boolean }> {
    // Get current configuration
    const currentConfig = await this.getEffectiveConfiguration(userId);
    
    // Move current primary to secondary
    const updatedKeys = {
      primaryKey: newPrimaryKey,
      secondaryKey: currentConfig.apiKeys.primaryKey,
      keyVersion: currentConfig.apiKeys.keyVersion + 1,
    };
    
    // Update configuration
    return await this.updateConfiguration(userId, 'default', {
      apiKeys: {
        ...currentConfig.apiKeys,
        ...updatedKeys,
      },
    });
  }
  
  /**
   * Merge configuration with defaults (handles nested objects)
   */
  private mergeWithDefaults(config: Partial<AIConfiguration>): AIConfiguration {
    return this.deepMerge(DEFAULT_AI_CONFIGURATION, config);
  }
  
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key] as any);
      } else if (source[key] !== undefined) {
        output[key] = source[key] as any;
      }
    }
    
    return output;
  }
  
  /**
   * Cache management
   */
  private getCached(key: string): AIConfiguration | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.configCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.configCache.get(key) || null;
  }
  
  private setCache(key: string, config: AIConfiguration): void {
    this.configCache.set(key, config);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
  
  private invalidateCache(key: string): void {
    this.configCache.delete(key);
    this.cacheExpiry.delete(key);
  }
}

export const aiConfigService = new AIConfigService();
```

**Task T-1.2.3: API Routes for AI Configuration**

Create `src/app/api/ai-configuration/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { aiConfigService } from '@/lib/services/ai-config-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const effectiveConfig = await aiConfigService.getEffectiveConfiguration(user.id);
    const userConfigs = await aiConfigService.getUserConfigurations(user.id);
    
    return NextResponse.json({
      effective: effectiveConfig,
      userConfigurations: userConfigs,
    });
  } catch (error) {
    console.error('Error fetching AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { configName, updates } = await request.json();
    
    if (!configName) {
      return NextResponse.json(
        { error: 'configName is required' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.updateConfiguration(user.id, configName, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { configName } = await request.json();
    
    if (!configName) {
      return NextResponse.json(
        { error: 'configName is required' },
        { status: 400 }
      );
    }
    
    const result = await aiConfigService.deleteConfiguration(user.id, configName);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
```

**Task T-1.2.4: Update Existing AI Config Integration**

Update `src/lib/ai-config.ts` to use the new service:

```typescript
import { aiConfigService } from './services/ai-config-service';
import { AIConfiguration, DEFAULT_AI_CONFIGURATION } from './types/ai-config';

// Keep environment-based config for backward compatibility
export const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1',
  model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Get AI configuration for a specific user
 * Falls back to environment config if user not authenticated
 */
export async function getAIConfigForUser(userId?: string): Promise<AIConfiguration> {
  if (!userId) {
    // Return environment-based configuration
    return {
      ...DEFAULT_AI_CONFIGURATION,
      model: {
        ...DEFAULT_AI_CONFIGURATION.model,
        model: AI_CONFIG.model,
        temperature: AI_CONFIG.temperature,
        maxTokens: AI_CONFIG.maxTokens,
      },
      apiKeys: {
        primaryKey: AI_CONFIG.apiKey,
        keyVersion: 1,
        rotationSchedule: 'manual',
      },
    };
  }
  
  // Get user-specific configuration with fallback chain
  return await aiConfigService.getEffectiveConfiguration(userId);
}
```

**ACCEPTANCE CRITERIA:**

1. **Type Definitions:**
   - [ ] AIConfiguration type includes all sub-interfaces (Model, RateLimit, Retry, CostBudget, APIKeys, Timeouts)
   - [ ] DEFAULT_AI_CONFIGURATION defined with production-ready defaults
   - [ ] AVAILABLE_MODELS mapping includes Claude models with capabilities
   - [ ] validateAIConfiguration function validates all constraints
   - [ ] calculateCost function accurately computes API costs
   - [ ] TypeScript compilation succeeds with strict mode

2. **Database Integration:**
   - [ ] ai_configurations table exists with user_id/organization_id exclusivity
   - [ ] RLS policies verified: users can manage own configs
   - [ ] Audit trail: ai_configuration_audit captures all changes
   - [ ] Function get_effective_ai_config() implements fallback chain correctly
   - [ ] Triggers log configuration changes automatically

3. **Service Layer:**
   - [ ] getEffectiveConfiguration() implements full fallback chain
   - [ ] updateConfiguration() validates, merges, and upserts configuration
   - [ ] deleteConfiguration() removes config and invalidates cache
   - [ ] getUserConfigurations() returns all user configs
   - [ ] toggleConfiguration() activates/deactivates configs
   - [ ] rotateAPIKey() implements key rotation with secondary key
   - [ ] Cache system works with 5-minute TTL
   - [ ] deepMerge() correctly handles nested configuration objects

4. **API Routes:**
   - [ ] GET /api/ai-configuration returns effective config + user configs
   - [ ] PATCH /api/ai-configuration updates configuration with validation
   - [ ] DELETE /api/ai-configuration removes configuration
   - [ ] All routes require authentication
   - [ ] Error responses include helpful messages

5. **Integration:**
   - [ ] getAIConfigForUser() function provides unified access
   - [ ] Existing generation endpoints can use new configuration system
   - [ ] Environment variables still work for fallback
   - [ ] No breaking changes to existing AI generation flows

**TECHNICAL SPECIFICATIONS:**

**File Structure:**
```
src/lib/types/ai-config.ts (NEW)
src/lib/services/ai-config-service.ts (NEW)
src/app/api/ai-configuration/route.ts (NEW)
src/lib/ai-config.ts (UPDATE)
```

**Data Models:**
- AIConfiguration with 7 sub-interfaces
- DEFAULT_AI_CONFIGURATION constant
- AVAILABLE_MODELS mapping
- AIConfigurationRecord for database rows

**API Specifications:**
- GET /api/ai-configuration → 200 { effective: AIConfiguration, userConfigurations: AIConfigurationRecord[] }
- PATCH /api/ai-configuration (body: { configName, updates }) → 200 { success: true } | 400 { errors }
- DELETE /api/ai-configuration (body: { configName }) → 200 { success: true }

**Fallback Chain Logic:**
1. Check cache (5-minute TTL)
2. Query database for user-specific active configuration
3. Fall back to database function get_effective_ai_config (includes org config)
4. Fall back to environment variables
5. Fall back to DEFAULT_AI_CONFIGURATION

**Error Handling:**
- Validation errors return detailed messages
- Database errors log and return generic error
- Fallback chain ensures generation never fails due to config issues
- Cache invalidation on configuration changes

**Performance:**
- Configuration caching with 5-minute TTL
- Database function for efficient fallback resolution
- Deep merge optimized for nested objects
- RLS policies enforce data isolation

**VALIDATION REQUIREMENTS:**

1. **Manual Testing:**
   - Create AI configuration via API → verify stored in database
   - Retrieve configuration → verify fallback chain works (user → env → default)
   - Update temperature to 0.9 → verify validates and saves
   - Try invalid temperature (1.5) → verify 400 error
   - Delete configuration → verify reverts to defaults

2. **Database Testing:**
   - Insert user configuration → verify stored correctly
   - Call get_effective_ai_config(user_id) → verify returns merged config
   - Update configuration → verify audit log captures change
   - Verify RLS: user A cannot access user B's configurations

3. **API Testing:**
   - GET /api/ai-configuration → verify returns effective + user configs
   - PATCH with valid updates → verify success
   - PATCH with invalid data → verify 400 with validation errors
   - DELETE configuration → verify removed and cache invalidated
   - Call without auth → verify 401 error

4. **Integration Testing:**
   - Set user temperature to 0.8 → generate conversation → verify uses 0.8
   - Delete user config → generate conversation → verify uses environment/default
   - Rotate API key → verify generation uses new key
   - Test cost calculation → verify matches expected pricing

**DELIVERABLES:**

1. [ ] `src/lib/types/ai-config.ts` - Complete type definitions
2. [ ] `src/lib/services/ai-config-service.ts` - Service layer with fallback chain
3. [ ] `src/app/api/ai-configuration/route.ts` - API routes
4. [ ] `src/lib/ai-config.ts` - Updated with getAIConfigForUser function
5. [ ] Database migrations applied (ai_configurations, audit, function)
6. [ ] Manual testing completed
7. [ ] API testing with Postman/Insomnia
8. [ ] Integration testing with generation endpoints

Implement this AI configuration foundation completely, ensuring the fallback chain works correctly, configuration changes are audited, and the system integrates seamlessly with existing generation flows.


++++++++++++++++++


## Remaining Implementation Prompts (3-8) Summary

Due to the comprehensive nature of this implementation, Prompts 3-8 follow similar detailed patterns established in Prompts 1-2. Below is a summary of each remaining prompt with key focus areas:

### Prompt 3: Database Health Monitoring Foundation (T-1.3.0)
**Scope**: Database health metrics collection, maintenance operations, monitoring infrastructure  
**Key Deliverables**:
- `src/lib/types/database-health.ts` - Comprehensive health metrics types
- `src/lib/services/database-health-service.ts` - PostgreSQL system catalog queries
- `src/lib/services/database-maintenance-service.ts` - VACUUM, ANALYZE, REINDEX executors
- API routes for health metrics and maintenance operations
- Integration with pg_stat_* views and pg_stat_statements

**Critical Implementation Details**:
- Query pg_stat_user_tables for table statistics
- Query pg_stat_user_indexes for index health
- Calculate bloat percentages
- Track connection pool metrics via pg_stat_activity
- Implement safety checks before maintenance operations
- Log all maintenance operations to maintenance_operations table

### Prompt 4: Configuration Change Management (T-2.1.0)
**Scope**: Unified audit trail, rollback capabilities, change tracking  
**Key Deliverables**:
- Integration with configuration_audit_log table (already created)
- `src/lib/services/config-rollback-service.ts` - Rollback functionality
- API routes for change history and rollback operations
- Diff visualization utilities
- Change validation before rollback

**Critical Implementation Details**:
- Leverage existing audit triggers on user_preferences and ai_configurations
- Implement getChangeHistory() with pagination
- Implement rollbackToVersion() with validation
- Implement previewRollback() showing before/after diff
- Implement bulkRollback() with transaction support

### Prompt 5: Settings View UI Enhancement (T-3.1.0)
**Scope**: Complete user preferences UI with all sections  
**Key Deliverables**:
- Update `train-wireframe/src/components/views/SettingsView.tsx`
- Display Preferences section (theme, sidebar, table density, rows per page, animations)
- Notification Preferences section (toast, email, in-app, frequency, categories)
- Default Filters section (tier, status, quality range, auto-apply)
- Export Preferences section (format, metadata options, compression)
- Keyboard Shortcuts section (enable/disable, custom bindings)
- Quality Thresholds section (auto-approval, flagging, minimum acceptable)
- Reset to Defaults button per section

**Critical Implementation Details**:
- Use Shadcn/UI components (Card, Label, Switch, Select, Slider, RadioGroup)
- Connect all controls to Zustand updatePreferences action
- Auto-save on change with visual feedback
- Form validation for numeric ranges
- Preview functionality for theme changes

### Prompt 6: AI Configuration Settings UI (T-3.2.0)
**Scope**: AI configuration management UI with tabs  
**Key Deliverables**:
- New `train-wireframe/src/components/views/AIConfigView.tsx`
- Model Configuration tab (model selector, temperature slider, max tokens, top_p, streaming toggle)
- Rate Limiting & Retry tab (requests/minute, concurrent requests, retry strategy, backoff visualization)
- Cost Management tab (budget inputs, alert thresholds, spending history)
- API Keys tab (key rotation interface, masked display)
- Timeout Configuration tab (generation, connection, total request timeouts)

**Critical Implementation Details**:
- Use Tabs component for organization
- Real-time validation with helpful error messages
- Preview pane showing effective configuration (merged from fallback chain)
- Backoff strategy visualization (chart showing delay progression)
- Confirmation dialog for critical changes
- Rollback/version history functionality

### Prompt 7: Database Health Dashboard UI (T-3.3.0)
**Scope**: Database monitoring and maintenance UI  
**Key Deliverables**:
- New `train-wireframe/src/components/views/DatabaseHealthView.tsx`
- Overview Card (database size, cache hit ratio, transaction stats, conflicts)
- Tables Card (table list with sizes, row counts, last vacuum/analyze, bloat %)
- Indexes Card (index usage stats, unused indexes highlighted)
- Queries Card (slow queries >500ms with execution stats)
- Connections Card (active/idle/waiting with pool utilization)
- Maintenance Section (VACUUM, ANALYZE, REINDEX buttons with table selection)

**Critical Implementation Details**:
- Use Recharts for data visualization (charts, gauges)
- Real-time updates every 30 seconds with manual refresh button
- Alert banner for critical issues (high bloat, unused indexes, slow queries)
- Confirmation dialogs for maintenance operations with impact warnings
- Progress indicators for running operations
- Monthly health report generation

### Prompt 8: Integration, Testing & Deployment (T-4.1.0, T-5.1.0, T-6.1.0)
**Scope**: Application-wide integration, comprehensive testing, production deployment  
**Key Deliverables**:
- **User Preferences Integration**:
  - Update `train-wireframe/src/App.tsx` to load preferences on mount
  - Theme application logic with CSS class toggling
  - Apply rowsPerPage to all tables
  - Apply default filters on dashboard load
  - Cross-tab preference synchronization via BroadcastChannel
- **Unit Testing Suite**:
  - Test files for all services (user-preferences-service, ai-config-service, database-health-service)
  - Component tests for Settings, AI Config, Database Health views
  - API route tests with mocked Supabase client
  - Validation function tests with edge cases
- **Database Migration Deployment**:
  - Staging environment validation
  - Production backup procedures
  - Migration execution plan
  - Rollback procedures documented
  - Post-migration validation queries
  - Monitoring alerts configuration

**Critical Implementation Details**:
- Loading state prevents UI flash before preferences loaded
- Theme detection for 'system' preference using matchMedia
- Auto-save debouncing verified (rapid changes → single DB write)
- Vitest test suite with React Testing Library
- Test coverage >85% for services, >80% for components
- Migration timing estimation and low-traffic window scheduling


## Quality Validation Checklist

### Post-Implementation Verification

#### Foundation Layer (Prompts 1-3)
- [ ] User preferences table exists with all fields and constraints
- [ ] AI configurations table exists with fallback chain working
- [ ] Database health queries return accurate metrics
- [ ] All service layers have proper error handling
- [ ] API routes require authentication and validate inputs
- [ ] Database migrations reversible with rollback scripts tested

#### Data Management (Prompt 4)
- [ ] Configuration audit log captures all changes
- [ ] Rollback functionality restores previous states correctly
- [ ] Change history displays with pagination
- [ ] Diff visualization shows before/after accurately
- [ ] Bulk operations use transactions (atomic)

#### User Interface (Prompts 5-7)
- [ ] Settings view displays all preference categories
- [ ] AI Configuration view includes all parameter controls
- [ ] Database Health dashboard shows real-time metrics
- [ ] All forms have validation with helpful error messages
- [ ] Auto-save works with visual feedback (debounced)
- [ ] Reset buttons restore defaults correctly
- [ ] Keyboard navigation works throughout
- [ ] Responsive design adapts to screen sizes

#### Integration (Prompt 8)
- [ ] Preferences loaded before UI renders (no flash)
- [ ] Theme changes apply to entire application
- [ ] User preferences affect behavior (rows per page, filters, etc.)
- [ ] AI configuration used by generation endpoints
- [ ] Database health monitoring operational
- [ ] Cross-tab preference synchronization works
- [ ] All unit tests passing (>85% coverage)
- [ ] Integration tests verify end-to-end flows

### Cross-Prompt Consistency
- [ ] Consistent error handling patterns across all services
- [ ] Consistent validation approach (client + server)
- [ ] Consistent naming conventions (camelCase, PascalCase)
- [ ] Consistent UI patterns (Shadcn/UI components)
- [ ] Consistent data models (TypeScript interfaces aligned with DB schema)
- [ ] Consistent API response format ({ success, data, error })

### Performance Verification
- [ ] User preferences queries < 100ms
- [ ] AI configuration queries < 100ms (with caching)
- [ ] Database health queries < 500ms
- [ ] Settings UI renders < 200ms
- [ ] Auto-save debouncing prevents excessive DB writes
- [ ] Cache invalidation works correctly

### Security Verification
- [ ] RLS policies prevent cross-user data access
- [ ] API keys encrypted in database (Supabase Vault)
- [ ] Authentication required for all sensitive routes
- [ ] Input validation prevents injection attacks
- [ ] Audit trail captures user attribution
- [ ] Configuration changes logged immutably

### Documentation Verification
- [ ] All type interfaces have JSDoc comments
- [ ] API routes documented with request/response examples
- [ ] Database schema documented with comments
- [ ] User guide for Settings & Administration features
- [ ] Deployment runbook with rollback procedures
- [ ] Troubleshooting guide for common issues


## Implementation Execution Plan

### Week 1: Foundation Layer
**Days 1-2**: Prompt 1 (User Preferences Foundation)
- Implement types, service, API routes
- Apply database migrations
- Test with manual scenarios

**Days 3-5**: Prompt 2 (AI Configuration Foundation)
- Implement types, service, API routes, fallback chain
- Apply database migrations
- Integration test with generation endpoints

### Week 2: Monitoring & Data Management
**Days 1-3**: Prompt 3 (Database Health Monitoring)
- Implement health metrics collection
- Implement maintenance operations
- Test with actual database operations

**Days 4-5**: Prompt 4 (Configuration Change Management)
- Implement rollback service
- Implement change history queries
- Test rollback scenarios

### Week 3: User Interface Layer
**Days 1-2**: Prompt 5 (Settings View UI Enhancement)
- Build all preference sections
- Connect to backend services
- Test auto-save and validation

**Days 3-4**: Prompt 6 (AI Configuration Settings UI)
- Build all configuration tabs
- Implement validation and previews
- Test with real AI configurations

**Day 5**: Prompt 7 (Database Health Dashboard UI)
- Build health dashboard
- Implement visualizations
- Test with real metrics

### Week 4: Integration & Production
**Days 1-2**: Prompt 8 Part A (Application Integration)
- Integrate preferences throughout app
- Theme application logic
- Cross-tab synchronization

**Days 3-4**: Prompt 8 Part B (Testing)
- Write unit tests for all services
- Write component tests
- Integration testing

**Day 5**: Prompt 8 Part C (Deployment)
- Staging validation
- Production migration execution
- Post-deployment verification


## Next Segment Preparation

### Information for E09 (Next Segment)
Once Settings & Administration Module is complete, the following information will be available for subsequent segments:

**Available Infrastructure:**
- User preference system with persistent storage
- AI configuration management with hierarchical fallback
- Database health monitoring and maintenance capabilities
- Complete audit trail for all configuration changes

**Integration Points:**
- All generation endpoints can use `getAIConfigForUser(userId)` for configuration
- All UI components can access preferences via Zustand `useAppStore().preferences`
- Database operations can be monitored via database health service
- Configuration changes automatically audited

**Dependencies for Future Segments:**
- Any feature requiring user customization can leverage preferences system
- Any AI generation can use configuration management
- Any database-intensive feature can use health monitoring
- Any configuration-driven feature can use audit trail

**Technical Debt to Address:**
- Consider WebSocket for real-time health metrics updates (currently polling)
- Consider Supabase Edge Functions for long-running maintenance operations
- Consider implementing role-based access control for organization configurations
- Consider A/B testing framework for AI configuration templates


## Document Summary

This execution document provides comprehensive implementation instructions for the Settings & Administration Module (E08) of the Train platform, covering:

**Total Prompts**: 8 prompts (2 detailed + 6 summarized)  
**Total Implementation Time**: 80-100 hours (4 weeks)  
**Total Deliverables**: 20+ new files, 5+ updated files, 4 database migrations

**Scope Coverage:**
- FR8.1.1: Customizable User Settings (Complete)
- FR8.2.1: AI Generation Settings (Complete)
- FR8.2.2: Database Maintenance (Complete)

**Implementation Approach:**
- Foundation-first: Data models and services before UI
- Incremental: Each prompt builds on previous work
- Testable: Comprehensive acceptance criteria per prompt
- Integrated: Full application integration in final prompt

**Quality Standards:**
- Type safety: 100% TypeScript strict mode
- Test coverage: >85% for services, >80% for components
- Performance: <500ms database queries, <200ms UI rendering
- Security: RLS policies, encrypted API keys, authentication required
- Audit: Complete immutable audit trail for all changes

**Success Criteria:**
All functional requirements from FR8.1.1, FR8.2.1, and FR8.2.2 implemented with comprehensive testing, documentation, and production deployment procedures.

---

**Document Generated**: 2025-01-29  
**Document Status**: Complete (Prompts 1-2 Detailed, 3-8 Summarized)  
**Output Location**: `C:\Users\james\Master\BrightHub\BRun\train-data\pmc\product\_mapping\fr-maps\04-FR-wireframes-execution-E08.md`  
**Total Lines**: 2200+  
**Ready for**: Implementation by development team using Claude-4.5-sonnet

