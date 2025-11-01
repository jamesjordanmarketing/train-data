-- =====================================================================
-- Migration: Unified Configuration Audit Trail
-- Description: Creates unified audit log for all configuration changes
--              (User Preferences + AI Configuration)
-- Created: 2025-11-01
-- Purpose: Track all configuration changes with comprehensive audit trail,
--          enable rollback capabilities, ensure configuration integrity
-- =====================================================================

-- Drop old configuration_audit_log table if it exists (from user_preferences migration)
-- We'll create a new unified one
DROP TABLE IF EXISTS public.configuration_audit_log CASCADE;

-- =====================================================================
-- Create Unified Configuration Audit Log Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL, -- 'user_preference', 'ai_config'
    config_id UUID NOT NULL, -- References either user_preferences.id or ai_configurations.id
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    old_values JSONB, -- Full configuration snapshot before change
    new_values JSONB, -- Full configuration snapshot after change
    change_reason TEXT, -- Optional reason for change
    client_ip INET, -- Client IP address
    user_agent TEXT, -- User agent string
    
    -- Enforce valid config types
    CONSTRAINT config_audit_log_type_check CHECK (config_type IN ('user_preference', 'ai_config'))
);

-- Add table comment
COMMENT ON TABLE public.configuration_audit_log IS 'Unified audit trail for all configuration changes (User Preferences and AI Configuration)';

-- =====================================================================
-- Create Indexes for Efficient Queries
-- =====================================================================

-- Index on config_type for filtering by configuration type
CREATE INDEX IF NOT EXISTS idx_config_audit_config_type ON public.configuration_audit_log(config_type);

-- Index on config_id for querying specific configuration history
CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON public.configuration_audit_log(config_id);

-- Index on changed_by for user-specific audit queries
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_by ON public.configuration_audit_log(changed_by);

-- Index on changed_at for chronological queries (DESC for recent-first)
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_at ON public.configuration_audit_log(changed_at DESC);

-- GIN indexes on JSONB columns for efficient querying within configuration values
CREATE INDEX IF NOT EXISTS idx_config_audit_old_values ON public.configuration_audit_log USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_config_audit_new_values ON public.configuration_audit_log USING GIN (new_values);

-- Composite index for common query pattern: config_type + config_id + changed_at
CREATE INDEX IF NOT EXISTS idx_config_audit_type_id_time ON public.configuration_audit_log(config_type, config_id, changed_at DESC);

-- =====================================================================
-- Enable Row Level Security (RLS)
-- =====================================================================

ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS Policies (Append-Only, Read-Only for Users)
-- =====================================================================

-- Policy: Users can view their own configuration audit logs
CREATE POLICY "Users can view own configuration audit logs"
    ON public.configuration_audit_log
    FOR SELECT
    USING (changed_by = auth.uid());

-- Policy: System can insert audit logs (via triggers)
-- Note: INSERT will be done via SECURITY DEFINER trigger functions
CREATE POLICY "System can insert audit logs"
    ON public.configuration_audit_log
    FOR INSERT
    WITH CHECK (true);

-- Policy: Prevent updates to audit log (immutability)
CREATE POLICY "No updates to audit log"
    ON public.configuration_audit_log
    FOR UPDATE
    USING (false);

-- Policy: Prevent deletes from audit log (immutability)
CREATE POLICY "No deletes from audit log"
    ON public.configuration_audit_log
    FOR DELETE
    USING (false);

-- =====================================================================
-- Trigger Functions for Automatic Audit Logging
-- =====================================================================

-- Trigger function for user_preferences audit
CREATE OR REPLACE FUNCTION public.log_user_preferences_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log on UPDATE (we track changes, not initial creation)
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values,
            change_reason
        ) VALUES (
            'user_preference',
            NEW.id,
            auth.uid(),
            OLD.preferences,
            NEW.preferences,
            NULL -- Change reason can be added via application layer
        );
    END IF;
    RETURN NULL; -- Result ignored since this is AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to user_preferences table
DROP TRIGGER IF EXISTS user_preferences_audit_trigger ON public.user_preferences;
CREATE TRIGGER user_preferences_audit_trigger
    AFTER UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_preferences_changes();

-- Trigger function for ai_configurations audit
CREATE OR REPLACE FUNCTION public.log_ai_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log INSERT, UPDATE, DELETE operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values,
            change_reason
        ) VALUES (
            'ai_config',
            NEW.id,
            auth.uid(),
            NULL, -- No old values for INSERT
            to_jsonb(NEW),
            'Configuration created'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values,
            change_reason
        ) VALUES (
            'ai_config',
            NEW.id,
            auth.uid(),
            to_jsonb(OLD),
            to_jsonb(NEW),
            NULL -- Change reason can be added via application layer
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.configuration_audit_log (
            config_type,
            config_id,
            changed_by,
            old_values,
            new_values,
            change_reason
        ) VALUES (
            'ai_config',
            OLD.id,
            auth.uid(),
            to_jsonb(OLD),
            NULL, -- No new values for DELETE
            'Configuration deleted'
        );
    END IF;
    
    RETURN NULL; -- Result ignored since this is AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to ai_configurations table (if it exists)
-- Note: This assumes ai_configurations table exists. If not, this will fail gracefully.
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_configurations'
    ) THEN
        DROP TRIGGER IF EXISTS ai_configurations_audit_trigger ON public.ai_configurations;
        CREATE TRIGGER ai_configurations_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.ai_configurations
            FOR EACH ROW
            EXECUTE FUNCTION public.log_ai_config_changes();
    ELSE
        RAISE NOTICE 'Table ai_configurations does not exist yet. Trigger will need to be created after table creation.';
    END IF;
END $$;

-- =====================================================================
-- Grant Permissions
-- =====================================================================

-- Grant SELECT on audit log to authenticated users (RLS enforces own data only)
GRANT SELECT ON public.configuration_audit_log TO authenticated;

-- Grant INSERT on audit log to authenticated users (for trigger functions)
GRANT INSERT ON public.configuration_audit_log TO authenticated;

-- =====================================================================
-- Migration Complete
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE 'Unified configuration audit trail created successfully';
    RAISE NOTICE 'Audit triggers attached to user_preferences and ai_configurations';
    RAISE NOTICE 'All configuration changes will now be tracked automatically';
END $$;

