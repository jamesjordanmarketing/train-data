#!/bin/bash
# Apply migration to make generation_logs.conversation_id nullable
# Run this after deploying code to production

echo "🗄️  Applying Database Migration: Make generation_logs.conversation_id Nullable"
echo "=========================================================================="
echo ""
echo "📋 Migration Details:"
echo "   File: 20251119_make_generation_logs_conversation_id_nullable.sql"
echo "   Purpose: Allow logging failed generations even when conversation wasn't created"
echo "   Impact: Low - adds nullable constraint to existing column"
echo ""
echo "⚠️  IMPORTANT: Apply this migration to your production Supabase database"
echo ""
echo "Options:"
echo ""
echo "1. Via Supabase Dashboard SQL Editor:"
echo "   - Go to: https://app.supabase.com/project/YOUR_PROJECT/sql"
echo "   - Copy migration contents from: supabase/migrations/20251119_make_generation_logs_conversation_id_nullable.sql"
echo "   - Paste and run"
echo ""
echo "2. Via Supabase CLI (if configured):"
echo "   npx supabase db push --linked"
echo ""
echo "3. Via Database Migrations UI:"
echo "   - Go to: https://app.supabase.com/project/YOUR_PROJECT/database/migrations"
echo "   - Upload: supabase/migrations/20251119_make_generation_logs_conversation_id_nullable.sql"
echo ""
echo "=========================================================================="
echo ""
echo "Verification SQL (run after applying migration):"
echo ""
cat << 'SQL'
-- Check conversation_id is nullable
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'generation_logs' 
  AND column_name = 'conversation_id';

-- Expected: is_nullable = 'YES'
SQL
echo ""
echo "=========================================================================="
echo "✅ After applying migration, test generation with previously failed params:"
echo "   - Persona: Marcus Chen"
echo "   - Emotional Arc: Fear → Confidence"
echo "   - Topic: Compensation Negotiation Strategy"
echo ""
echo "Expected result: Generation completes successfully within 180 seconds"
echo "=========================================================================="
