-- AI Configuration System Database Migration
-- This migration creates the necessary tables, functions, and triggers
-- for the AI Configuration Foundation

-- ============================================================================
-- 1. Create ai_configurations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  config_name TEXT NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  
  -- Ensure either user_id OR organization_id is set, not both
  CONSTRAINT user_or_org_only CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  ),
  
  -- Unique configuration name per user
  CONSTRAINT unique_user_config UNIQUE(user_id, config_name),
  
  -- Unique configuration name per organization
  CONSTRAINT unique_org_config UNIQUE(organization_id, config_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_configs_user_id ON ai_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_configs_org_id ON ai_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_configs_active ON ai_configurations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_configs_priority ON ai_configurations(priority DESC);

-- ============================================================================
-- 2. Create ai_configuration_audit table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_configuration_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES ai_configurations(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_value JSONB,
  new_value JSONB,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_config_id ON ai_configuration_audit(config_id);
CREATE INDEX IF NOT EXISTS idx_ai_config_audit_changed_at ON ai_configuration_audit(changed_at DESC);

-- ============================================================================
-- 3. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configuration_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own configs" ON ai_configurations;
DROP POLICY IF EXISTS "Users can insert their own configs" ON ai_configurations;
DROP POLICY IF EXISTS "Users can update their own configs" ON ai_configurations;
DROP POLICY IF EXISTS "Users can delete their own configs" ON ai_configurations;
DROP POLICY IF EXISTS "Users can view audit logs for their configs" ON ai_configuration_audit;

-- RLS Policies for ai_configurations
CREATE POLICY "Users can view their own configs"
  ON ai_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configs"
  ON ai_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

CREATE POLICY "Users can update their own configs"
  ON ai_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs"
  ON ai_configurations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_configuration_audit
CREATE POLICY "Users can view audit logs for their configs"
  ON ai_configuration_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_configurations
      WHERE ai_configurations.id = ai_configuration_audit.config_id
      AND ai_configurations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Create audit trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_ai_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO ai_configuration_audit (config_id, action, old_value, changed_by)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO ai_configuration_audit (config_id, action, old_value, new_value, changed_by)
    VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO ai_configuration_audit (config_id, action, new_value, changed_by)
    VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Create audit trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_audit_ai_config_changes ON ai_configurations;

CREATE TRIGGER trigger_audit_ai_config_changes
  AFTER INSERT OR UPDATE OR DELETE ON ai_configurations
  FOR EACH ROW EXECUTE FUNCTION audit_ai_config_changes();

-- ============================================================================
-- 6. Create updated_at trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ai_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Create updated_at trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_ai_config_updated_at ON ai_configurations;

CREATE TRIGGER trigger_update_ai_config_updated_at
  BEFORE UPDATE ON ai_configurations
  FOR EACH ROW EXECUTE FUNCTION update_ai_config_updated_at();

-- ============================================================================
-- 8. Create function for effective configuration resolution
-- ============================================================================

CREATE OR REPLACE FUNCTION get_effective_ai_config(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_config JSONB;
  v_org_id UUID;
  v_org_config JSONB;
BEGIN
  -- Try to get active user configuration with highest priority
  SELECT configuration INTO v_user_config
  FROM ai_configurations
  WHERE user_id = p_user_id
    AND is_active = true
  ORDER BY priority DESC, created_at DESC
  LIMIT 1;
  
  -- If user config exists, return it
  IF v_user_config IS NOT NULL THEN
    RETURN v_user_config;
  END IF;
  
  -- Get user's organization_id (if your schema has this)
  -- Note: Modify this query based on your actual user/organization schema
  -- For now, we'll skip organization lookup and return null
  -- v_org_id := (SELECT organization_id FROM users WHERE id = p_user_id);
  
  -- Try to get organization configuration
  IF v_org_id IS NOT NULL THEN
    SELECT configuration INTO v_org_config
    FROM ai_configurations
    WHERE organization_id = v_org_id
      AND is_active = true
    ORDER BY priority DESC, created_at DESC
    LIMIT 1;
    
    IF v_org_config IS NOT NULL THEN
      RETURN v_org_config;
    END IF;
  END IF;
  
  -- No configuration found in database, return null (will use env/defaults)
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. Grant necessary permissions
-- ============================================================================

-- Grant execute permission on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_effective_ai_config(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION audit_ai_config_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_config_updated_at() TO authenticated;

-- ============================================================================
-- 10. Insert default configurations (optional)
-- ============================================================================

-- You can insert default configurations for testing here
-- Example:
-- INSERT INTO ai_configurations (user_id, config_name, configuration, created_by)
-- VALUES (
--   'your-user-id',
--   'default',
--   '{
--     "model": {
--       "model": "claude-sonnet-4-5-20250929",
--       "temperature": 0.7,
--       "maxTokens": 4096,
--       "topP": 0.9,
--       "streaming": false
--     },
--     "rateLimiting": {
--       "requestsPerMinute": 50,
--       "concurrentRequests": 3,
--       "burstAllowance": 10
--     }
--   }'::jsonb,
--   'your-user-id'
-- );

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_configurations') THEN
    RAISE NOTICE 'Table ai_configurations created successfully';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_configuration_audit') THEN
    RAISE NOTICE 'Table ai_configuration_audit created successfully';
  END IF;
  
  RAISE NOTICE 'AI Configuration System migration completed successfully';
END $$;

