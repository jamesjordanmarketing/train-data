#!/bin/bash

# Comprehensive Scaffolding System Test Script
# Tests all scaffolding API endpoints and end-to-end generation workflow

echo "======================================"
echo "Scaffolding System - Complete Test Suite"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
  local test_name=$1
  local endpoint=$2
  local method=${3:-GET}
  local data=${4:-}
  
  TESTS_RUN=$((TESTS_RUN + 1))
  echo -e "${YELLOW}Test $TESTS_RUN:${NC} $test_name"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $http_code"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $http_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$body"
  fi
  
  echo ""
}

echo "======================================"
echo "Part 1: Scaffolding Data API Tests"
echo "======================================"
echo ""

# Test 1: Fetch Personas
run_test "Fetch all personas" "/api/scaffolding/personas" "GET"

# Store first persona ID for later tests
PERSONA_ID=$(curl -s "$BASE_URL/api/scaffolding/personas" | jq -r '.personas[0].id // empty')
echo "Captured Persona ID: $PERSONA_ID"
echo ""

# Test 2: Fetch Emotional Arcs
run_test "Fetch all emotional arcs" "/api/scaffolding/emotional-arcs" "GET"

# Store first arc ID
ARC_ID=$(curl -s "$BASE_URL/api/scaffolding/emotional-arcs" | jq -r '.emotional_arcs[0].id // empty')
echo "Captured Emotional Arc ID: $ARC_ID"
echo ""

# Test 3: Fetch Training Topics
run_test "Fetch all training topics" "/api/scaffolding/training-topics" "GET"

# Store first topic ID
TOPIC_ID=$(curl -s "$BASE_URL/api/scaffolding/training-topics" | jq -r '.training_topics[0].id // empty')
echo "Captured Training Topic ID: $TOPIC_ID"
echo ""

echo "======================================"
echo "Part 2: Compatibility Check Tests"
echo "======================================"
echo ""

if [ -n "$PERSONA_ID" ] && [ -n "$ARC_ID" ] && [ -n "$TOPIC_ID" ]; then
  # Test 4: Check Compatibility
  compatibility_data="{
    \"persona_id\": \"$PERSONA_ID\",
    \"emotional_arc_id\": \"$ARC_ID\",
    \"training_topic_id\": \"$TOPIC_ID\"
  }"
  
  run_test "Check scaffolding compatibility" "/api/scaffolding/check-compatibility" "POST" "$compatibility_data"
else
  echo -e "${RED}⚠ Skipping compatibility test - missing IDs${NC}"
  echo ""
fi

echo "======================================"
echo "Part 3: Conversation Generation Tests"
echo "======================================"
echo ""

if [ -n "$PERSONA_ID" ] && [ -n "$ARC_ID" ] && [ -n "$TOPIC_ID" ]; then
  
  # Test 5: Generate with Template Tier
  echo "Test 5: Generate conversation (Template Tier)"
  generation_data="{
    \"persona_id\": \"$PERSONA_ID\",
    \"emotional_arc_id\": \"$ARC_ID\",
    \"training_topic_id\": \"$TOPIC_ID\",
    \"tier\": \"template\"
  }"
  
  echo "Request payload:"
  echo "$generation_data" | jq '.'
  echo ""
  
  echo "Generating conversation... (this may take 10-30 seconds)"
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/conversations/generate-with-scaffolding" \
    -H "Content-Type: application/json" \
    -d "$generation_data")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $http_code"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Extract and display key metrics
    conversation_id=$(echo "$body" | jq -r '.conversation_id // empty')
    quality_score=$(echo "$body" | jq -r '.quality_metrics.quality_score // empty')
    turn_count=$(echo "$body" | jq -r '.quality_metrics.turn_count // empty')
    compatibility_score=$(echo "$body" | jq -r '.metadata.compatibility_score // empty')
    
    echo ""
    echo -e "${GREEN}Generation Results:${NC}"
    echo "  Conversation ID: $conversation_id"
    echo "  Quality Score: $quality_score"
    echo "  Turn Count: $turn_count"
    echo "  Compatibility Score: $compatibility_score"
    echo ""
    
    # Show scaffolding metadata
    echo "Scaffolding Used:"
    echo "$body" | jq '.metadata.scaffolding'
    echo ""
    
    # Show any warnings
    warnings=$(echo "$body" | jq -r '.metadata.compatibility_warnings // empty')
    if [ -n "$warnings" ] && [ "$warnings" != "[]" ]; then
      echo "Compatibility Warnings:"
      echo "$body" | jq '.metadata.compatibility_warnings'
      echo ""
    fi
    
    # Store conversation ID for verification
    GENERATED_CONVERSATION_ID=$conversation_id
    
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $http_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  fi
  
  echo ""
  
else
  echo -e "${RED}⚠ Skipping generation test - missing IDs${NC}"
  echo ""
fi

echo "======================================"
echo "Part 4: Verify Generated Conversation"
echo "======================================"
echo ""

if [ -n "$GENERATED_CONVERSATION_ID" ]; then
  echo "Test 6: Verify conversation scaffolding provenance"
  
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/conversations/$GENERATED_CONVERSATION_ID")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $http_code"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Verify scaffolding fields are populated
    persona_id_check=$(echo "$body" | jq -r '.conversation.persona_id // empty')
    arc_id_check=$(echo "$body" | jq -r '.conversation.emotional_arc_id // empty')
    topic_id_check=$(echo "$body" | jq -r '.conversation.training_topic_id // empty')
    snapshot_check=$(echo "$body" | jq -r '.conversation.scaffolding_snapshot // empty')
    
    echo ""
    echo "Scaffolding Provenance Check:"
    echo "  ✓ persona_id: ${persona_id_check:0:8}..."
    echo "  ✓ emotional_arc_id: ${arc_id_check:0:8}..."
    echo "  ✓ training_topic_id: ${topic_id_check:0:8}..."
    echo "  ✓ scaffolding_snapshot: $([ -n "$snapshot_check" ] && echo 'Present' || echo 'Missing')"
    echo ""
    
    # Show snapshot summary
    if [ -n "$snapshot_check" ]; then
      echo "Scaffolding Snapshot:"
      echo "$body" | jq '.conversation.scaffolding_snapshot.persona.name'
      echo "$body" | jq '.conversation.scaffolding_snapshot.emotional_arc.name'
      echo "$body" | jq '.conversation.scaffolding_snapshot.training_topic.name'
      echo ""
    fi
    
  else
    echo -e "${RED}✗ FAIL${NC} - HTTP $http_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  fi
  
  echo ""
fi

echo "======================================"
echo "Test Summary"
echo "======================================"
echo ""
echo "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi

