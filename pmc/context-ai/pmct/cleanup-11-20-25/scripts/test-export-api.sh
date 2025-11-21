#!/bin/bash

###############################################################################
# Export API Manual Test Script
# 
# Tests all export API endpoints with various scenarios
# Prerequisites:
# - Server running on localhost:3000 (or set BASE_URL)
# - curl installed
# - jq installed (for JSON parsing, optional)
###############################################################################

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
USER_ID="${USER_ID:-00000000-0000-0000-0000-000000000000}"
EXPORT_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Export API Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "User ID: $USER_ID"
echo ""

###############################################################################
# Test 1: Create export with scope 'all' (JSONL format)
###############################################################################
echo -e "${YELLOW}Test 1: POST /api/export/conversations (scope: all, format: jsonl)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/export/conversations" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "config": {
      "scope": "all",
      "format": "jsonl",
      "includeMetadata": true,
      "includeQualityScores": true,
      "includeTimestamps": true,
      "includeApprovalHistory": false,
      "includeParentReferences": false,
      "includeFullContent": true
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "202" ]; then
  echo -e "${GREEN}✓ Test 1 Passed${NC}"
  EXPORT_ID=$(echo "$BODY" | grep -o '"export_id":"[^"]*"' | cut -d'"' -f4)
  echo "Export ID: $EXPORT_ID"
else
  echo -e "${RED}✗ Test 1 Failed${NC}"
fi
echo ""

###############################################################################
# Test 2: Create export with CSV format
###############################################################################
echo -e "${YELLOW}Test 2: POST /api/export/conversations (format: csv)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/export/conversations" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "config": {
      "scope": "all",
      "format": "csv",
      "includeMetadata": true,
      "includeQualityScores": true,
      "includeTimestamps": true,
      "includeApprovalHistory": false,
      "includeParentReferences": false,
      "includeFullContent": true
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "202" ] || [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Test 2 Passed${NC}"
else
  echo -e "${RED}✗ Test 2 Failed${NC}"
fi
echo ""

###############################################################################
# Test 3: Create export with filtered scope
###############################################################################
echo -e "${YELLOW}Test 3: POST /api/export/conversations (scope: filtered)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/export/conversations" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "config": {
      "scope": "filtered",
      "format": "markdown",
      "includeMetadata": true,
      "includeQualityScores": true,
      "includeTimestamps": true,
      "includeApprovalHistory": false,
      "includeParentReferences": false,
      "includeFullContent": true
    },
    "filters": {
      "tier": ["template"],
      "status": ["approved"],
      "qualityScoreMin": 7.0
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "202" ] || [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Test 3 Passed${NC}"
else
  echo -e "${RED}✗ Test 3 Failed${NC}"
fi
echo ""

###############################################################################
# Test 4: Invalid request (missing required field)
###############################################################################
echo -e "${YELLOW}Test 4: POST /api/export/conversations (invalid - missing format)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/export/conversations" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "config": {
      "scope": "all"
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "400" ]; then
  echo -e "${GREEN}✓ Test 4 Passed (Validation Error Expected)${NC}"
else
  echo -e "${RED}✗ Test 4 Failed (Expected 400)${NC}"
fi
echo ""

###############################################################################
# Test 5: Get export status
###############################################################################
if [ -n "$EXPORT_ID" ]; then
  echo -e "${YELLOW}Test 5: GET /api/export/status/${EXPORT_ID}${NC}"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/status/$EXPORT_ID" \
    -H "x-user-id: $USER_ID")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response: $BODY"
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Test 5 Passed${NC}"
  else
    echo -e "${RED}✗ Test 5 Failed${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 5: Skipped (No export_id available)${NC}"
  echo ""
fi

###############################################################################
# Test 6: Get export status with invalid ID (should return 404)
###############################################################################
echo -e "${YELLOW}Test 6: GET /api/export/status/[invalid] (should return 404)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/status/00000000-0000-0000-0000-000000000000" \
  -H "x-user-id: $USER_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Test 6 Passed (404 Expected)${NC}"
else
  echo -e "${RED}✗ Test 6 Failed (Expected 404)${NC}"
fi
echo ""

###############################################################################
# Test 7: Get export history
###############################################################################
echo -e "${YELLOW}Test 7: GET /api/export/history${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/history" \
  -H "x-user-id: $USER_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Test 7 Passed${NC}"
else
  echo -e "${RED}✗ Test 7 Failed${NC}"
fi
echo ""

###############################################################################
# Test 8: Get export history with filters
###############################################################################
echo -e "${YELLOW}Test 8: GET /api/export/history?format=jsonl&status=completed${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/history?format=jsonl&status=completed" \
  -H "x-user-id: $USER_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Test 8 Passed${NC}"
else
  echo -e "${RED}✗ Test 8 Failed${NC}"
fi
echo ""

###############################################################################
# Test 9: Get export history with pagination
###############################################################################
echo -e "${YELLOW}Test 9: GET /api/export/history?page=1&limit=5${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/history?page=1&limit=5" \
  -H "x-user-id: $USER_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Test 9 Passed${NC}"
else
  echo -e "${RED}✗ Test 9 Failed${NC}"
fi
echo ""

###############################################################################
# Test 10: Download export
###############################################################################
if [ -n "$EXPORT_ID" ]; then
  echo -e "${YELLOW}Test 10: GET /api/export/download/${EXPORT_ID}${NC}"
  
  HTTP_CODE=$(curl -s -o /tmp/export-test-download.jsonl -w "%{http_code}" \
    -X GET "$BASE_URL/api/export/download/$EXPORT_ID" \
    -H "x-user-id: $USER_ID")
  
  echo "HTTP Status: $HTTP_CODE"
  
  if [ "$HTTP_CODE" == "200" ]; then
    FILE_SIZE=$(wc -c < /tmp/export-test-download.jsonl)
    echo "Downloaded file size: $FILE_SIZE bytes"
    
    if [ "$FILE_SIZE" -gt 0 ]; then
      echo -e "${GREEN}✓ Test 10 Passed${NC}"
    else
      echo -e "${RED}✗ Test 10 Failed (File is empty)${NC}"
    fi
  else
    echo -e "${RED}✗ Test 10 Failed${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 10: Skipped (No export_id available)${NC}"
  echo ""
fi

###############################################################################
# Test 11: Unauthorized download attempt
###############################################################################
if [ -n "$EXPORT_ID" ]; then
  echo -e "${YELLOW}Test 11: GET /api/export/download/${EXPORT_ID} (unauthorized - should return 403)${NC}"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/export/download/$EXPORT_ID" \
    -H "x-user-id: 11111111-1111-1111-1111-111111111111")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  echo "HTTP Status: $HTTP_CODE"
  
  if [ "$HTTP_CODE" == "403" ]; then
    echo -e "${GREEN}✓ Test 11 Passed (403 Expected)${NC}"
  else
    echo -e "${RED}✗ Test 11 Failed (Expected 403)${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 11: Skipped (No export_id available)${NC}"
  echo ""
fi

###############################################################################
# Summary
###############################################################################
echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "Note: Some tests may be skipped if no conversations exist in the database."
echo "To run with custom base URL: BASE_URL=https://your-app.vercel.app ./scripts/test-export-api.sh"

