-- =====================================================================
-- Migration: Create User Preferences Infrastructure
-- Description: Creates user_preferences table with JSONB storage,
--              RLS policies, triggers, and initialization function
-- Created: 2025-11-01
-- =====================================================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one preferences record per user
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON public.user_preferences(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferences_gin ON public.user_preferences USING GIN (preferences);

-- Add table comment
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences and settings in JSONB format for flexibility';

-- =====================================================================
-- Trigger: Auto-update updated_at timestamp
-- =====================================================================

-- Create or replace the update_updated_at_column function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- RLS (Row Level Security) Policies
-- =====================================================================

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own preferences (optional, for account cleanup)
CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================================
-- Function: Initialize default preferences for new users
-- =====================================================================

CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS TRIGGER AS $$
DECLARE
    default_preferences JSONB;
BEGIN
    -- Define default preferences structure
    default_preferences := jsonb_build_object(
        'theme', 'system',
        'sidebarCollapsed', false,
        'tableDensity', 'comfortable',
        'rowsPerPage', 25,
        'enableAnimations', true,
        'notifications', jsonb_build_object(
            'toast', true,
            'email', false,
            'inApp', true,
            'frequency', 'immediate',
            'categories', jsonb_build_object(
                'generationComplete', true,
                'approvalRequired', true,
                'errors', true,
                'systemAlerts', true
            )
        ),
        'defaultFilters', jsonb_build_object(
            'tier', null,
            'status', null,
            'qualityRange', jsonb_build_array(0, 10),
            'autoApply', false
        ),
        'exportPreferences', jsonb_build_object(
            'defaultFormat', 'json',
            'includeMetadata', true,
            'includeQualityScores', true,
            'includeTimestamps', true,
            'includeApprovalHistory', false,
            'autoCompression', true,
            'autoCompressionThreshold', 1000
        ),
        'keyboardShortcuts', jsonb_build_object(
            'enabled', true,
            'customBindings', jsonb_build_object(
                'openSearch', 'Ctrl+K',
                'generateAll', 'Ctrl+G',
                'export', 'Ctrl+E',
                'approve', 'A',
                'reject', 'R',
                'nextItem', 'ArrowRight',
                'previousItem', 'ArrowLeft'
            )
        ),
        'qualityThresholds', jsonb_build_object(
            'autoApproval', 8.0,
            'flagging', 6.0,
            'minimumAcceptable', 4.0
        ),
        'retryConfig', jsonb_build_object(
            'strategy', 'exponential',
            'maxAttempts', 3,
            'baseDelayMs', 1000,
            'maxDelayMs', 300000,
            'continueOnError', false
        )
    );
    
    -- Insert default preferences for new user
    INSERT INTO public.user_preferences (user_id, preferences)
    VALUES (NEW.id, default_preferences)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize preferences on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_preferences();

-- =====================================================================
-- Optional: Configuration Audit Log
-- =====================================================================

-- Create configuration_audit_log table for tracking preference changes
CREATE TABLE IF NOT EXISTS public.configuration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    changed_field TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id)
);

-- Create index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_config_audit_user_id ON public.configuration_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_at ON public.configuration_audit_log(changed_at);

-- Enable RLS on audit log
ALTER TABLE public.configuration_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.configuration_audit_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.configuration_audit_log IS 'Audit trail for user preference changes';

-- =====================================================================
-- Grant necessary permissions
-- =====================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT ON public.configuration_audit_log TO authenticated;

-- =====================================================================
-- Migration Complete
-- =====================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'User preferences infrastructure created successfully';
END $$;

