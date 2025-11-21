#!/bin/bash

# Verification Script for Enrichment Service Implementation
# Checks that all required files exist and are properly configured

echo "=========================================="
echo "Enrichment Service Implementation Checker"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
  else
    echo -e "${RED}❌${NC} $1 (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
}

# Function to check directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $1/"
  else
    echo -e "${RED}❌${NC} $1/ (MISSING)"
    ERRORS=$((ERRORS+1))
  fi
}

# Function to check file contains text
check_contains() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $1 contains '$2'"
  else
    echo -e "${YELLOW}⚠️${NC} $1 missing '$2'"
    WARNINGS=$((WARNINGS+1))
  fi
}

echo "1. Checking Required Files"
echo "----------------------------"
check_file "src/lib/services/conversation-enrichment-service.ts"
check_file "src/lib/services/conversation-storage-service.ts"
check_file "src/lib/services/conversation-validation-service.ts"
check_file "src/lib/types/conversations.ts"
check_file "test-enrichment.ts"
check_file "setup-test-conversation.ts"
check_file "supabase/migrations/20251120_add_enrichment_tracking.sql"
echo ""

echo "2. Checking Documentation"
echo "-------------------------"
check_file "ENRICHMENT_README.md"
check_file "ENRICHMENT_QUICK_START.md"
check_file "ENRICHMENT_IMPLEMENTATION_SUMMARY.md"
echo ""

echo "3. Checking Type Definitions"
echo "----------------------------"
check_contains "src/lib/types/conversations.ts" "EnrichedConversation"
check_contains "src/lib/types/conversations.ts" "DatasetMetadata"
check_contains "src/lib/types/conversations.ts" "TrainingPair"
check_contains "src/lib/types/conversations.ts" "DatabaseEnrichmentMetadata"
echo ""

echo "4. Checking Service Implementation"
echo "-----------------------------------"
check_contains "src/lib/services/conversation-enrichment-service.ts" "ConversationEnrichmentService"
check_contains "src/lib/services/conversation-enrichment-service.ts" "enrichConversation"
check_contains "src/lib/services/conversation-enrichment-service.ts" "fetchDatabaseMetadata"
check_contains "src/lib/services/conversation-enrichment-service.ts" "buildTrainingPairs"
check_contains "src/lib/services/conversation-enrichment-service.ts" "classifyEmotionalValence"
check_contains "src/lib/services/conversation-enrichment-service.ts" "CONSULTANT_PROFILE"
echo ""

echo "5. Checking Storage Integration"
echo "-------------------------------"
check_contains "src/lib/services/conversation-storage-service.ts" "storeEnrichedConversation"
check_contains "src/lib/services/conversation-storage-service.ts" "EnrichedConversation"
echo ""

echo "6. Checking Package Dependencies"
echo "---------------------------------"
check_file "package.json"
check_contains "package.json" "@supabase/supabase-js"
check_contains "package.json" "dotenv"
echo ""

echo "7. Checking Environment Setup"
echo "-----------------------------"
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅${NC} .env.local exists"
  check_contains ".env.local" "NEXT_PUBLIC_SUPABASE_URL"
  check_contains ".env.local" "SUPABASE_SERVICE_ROLE_KEY"
else
  echo -e "${YELLOW}⚠️${NC} .env.local not found (expected - may be gitignored)"
  echo "   Create .env.local with:"
  echo "   - NEXT_PUBLIC_SUPABASE_URL"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  WARNINGS=$((WARNINGS+1))
fi
echo ""

echo "8. Checking Migration Status"
echo "----------------------------"
check_file "supabase/migrations/20251120_add_enrichment_tracking.sql"
check_contains "supabase/migrations/20251120_add_enrichment_tracking.sql" "enrichment_status"
check_contains "supabase/migrations/20251120_add_enrichment_tracking.sql" "enriched_file_path"
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run: npx tsx setup-test-conversation.ts"
  echo "2. Run: npx tsx test-enrichment.ts"
  echo "3. Verify results in Supabase Dashboard"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️ Implementation complete with ${WARNINGS} warning(s)${NC}"
  echo ""
  echo "Warnings are typically non-blocking. You can proceed with testing."
else
  echo -e "${RED}❌ Found ${ERRORS} error(s) and ${WARNINGS} warning(s)${NC}"
  echo ""
  echo "Please fix the errors before proceeding."
  exit 1
fi
echo ""

