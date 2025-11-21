#!/bin/bash

# Export Monitoring Cron Endpoints Test Script
# 
# Tests the cron API endpoints locally or in development.
# 
# Usage:
#   ./scripts/test-cron-endpoints.sh [base_url] [cron_secret]
# 
# Examples:
#   ./scripts/test-cron-endpoints.sh http://localhost:3000 my-secret-key
#   ./scripts/test-cron-endpoints.sh https://my-app.vercel.app my-secret-key

set -e

# Configuration
BASE_URL="${1:-http://localhost:3000}"
CRON_SECRET="${2:-test-secret}"

echo "=========================================="
echo "Export Monitoring Cron Endpoints Test"
echo "=========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Cron Secret: ${CRON_SECRET:0:10}..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name="$1"
  local path="$2"
  local expected_status="${3:-200}"
  
  echo "🧪 Testing: $name"
  echo "   Path: $path"
  
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json" \
    "$BASE_URL$path")
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" -eq "$expected_status" ]; then
    echo -e "   ${GREEN}✅ PASSED${NC} (HTTP $status_code)"
    PASSED=$((PASSED + 1))
    
    # Pretty print JSON response
    if command -v jq &> /dev/null; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
      echo "$body"
    fi
  else
    echo -e "   ${RED}❌ FAILED${NC} (HTTP $status_code, expected $expected_status)"
    FAILED=$((FAILED + 1))
    echo "$body"
  fi
  
  echo ""
}

# Test 1: Export metrics aggregation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Export Metrics Aggregation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
  "Export metrics aggregation (hourly)" \
  "/api/cron/export-metrics-aggregate" \
  200

# Test 2: Export file cleanup
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Export File Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
  "Export file cleanup (daily)" \
  "/api/cron/export-file-cleanup" \
  200

# Test 3: Export log cleanup
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Export Log Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint \
  "Export log cleanup (monthly)" \
  "/api/cron/export-log-cleanup" \
  200

# Test 4: Unauthorized access (should fail)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Security - Unauthorized Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing: Security check (invalid secret)"
echo "   Path: /api/cron/export-metrics-aggregate"

response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer invalid-secret" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/cron/export-metrics-aggregate")

status_code=$(echo "$response" | tail -n1)

if [ "$status_code" -eq 401 ]; then
  echo -e "   ${GREEN}✅ PASSED${NC} (HTTP 401 - Unauthorized as expected)"
  PASSED=$((PASSED + 1))
else
  echo -e "   ${RED}❌ FAILED${NC} (HTTP $status_code, expected 401)"
  FAILED=$((FAILED + 1))
fi

echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total tests: $((PASSED + FAILED))"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Some tests failed. Please check the output above.${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed! 🎉${NC}"
  exit 0
fi

