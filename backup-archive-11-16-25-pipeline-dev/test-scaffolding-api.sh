#!/bin/bash

# Test Script for Scaffolding API Endpoints
# This script tests all scaffolding-related API endpoints
# Usage: ./test-scaffolding-api.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL (adjust if needed)
BASE_URL="http://localhost:3000"

echo "========================================"
echo "Scaffolding API Test Suite"
echo "========================================"
echo ""

# Test 1: GET /api/scaffolding/personas
echo -e "${YELLOW}Test 1: GET /api/scaffolding/personas${NC}"
echo "Request: GET $BASE_URL/api/scaffolding/personas"
echo ""
RESPONSE=$(curl -s "$BASE_URL/api/scaffolding/personas")
echo "$RESPONSE" | jq '.'
echo ""

# Extract a persona ID for later tests
PERSONA_ID=$(echo "$RESPONSE" | jq -r '.personas[0].id // empty')
if [ -z "$PERSONA_ID" ]; then
  echo -e "${RED}❌ No personas found. Please ensure database is populated.${NC}"
  echo ""
else
  echo -e "${GREEN}✓ Found persona: $PERSONA_ID${NC}"
  echo ""
fi

# Test 2: GET /api/scaffolding/emotional-arcs
echo -e "${YELLOW}Test 2: GET /api/scaffolding/emotional-arcs${NC}"
echo "Request: GET $BASE_URL/api/scaffolding/emotional-arcs"
echo ""
RESPONSE=$(curl -s "$BASE_URL/api/scaffolding/emotional-arcs")
echo "$RESPONSE" | jq '.'
echo ""

# Extract an arc ID for later tests
ARC_ID=$(echo "$RESPONSE" | jq -r '.emotional_arcs[0].id // empty')
if [ -z "$ARC_ID" ]; then
  echo -e "${RED}❌ No emotional arcs found. Please ensure database is populated.${NC}"
  echo ""
else
  echo -e "${GREEN}✓ Found emotional arc: $ARC_ID${NC}"
  echo ""
fi

# Test 3: GET /api/scaffolding/training-topics
echo -e "${YELLOW}Test 3: GET /api/scaffolding/training-topics${NC}"
echo "Request: GET $BASE_URL/api/scaffolding/training-topics"
echo ""
RESPONSE=$(curl -s "$BASE_URL/api/scaffolding/training-topics")
echo "$RESPONSE" | jq '.'
echo ""

# Extract a topic ID for later tests
TOPIC_ID=$(echo "$RESPONSE" | jq -r '.training_topics[0].id // empty')
if [ -z "$TOPIC_ID" ]; then
  echo -e "${RED}❌ No training topics found. Please ensure database is populated.${NC}"
  echo ""
else
  echo -e "${GREEN}✓ Found training topic: $TOPIC_ID${NC}"
  echo ""
fi

# Test 4: POST /api/scaffolding/check-compatibility (if we have IDs)
if [ -n "$PERSONA_ID" ] && [ -n "$ARC_ID" ] && [ -n "$TOPIC_ID" ]; then
  echo -e "${YELLOW}Test 4: POST /api/scaffolding/check-compatibility${NC}"
  echo "Request: POST $BASE_URL/api/scaffolding/check-compatibility"
  echo "Body: {persona_id: $PERSONA_ID, emotional_arc_id: $ARC_ID, training_topic_id: $TOPIC_ID}"
  echo ""
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/scaffolding/check-compatibility" \
    -H "Content-Type: application/json" \
    -d "{
      \"persona_id\": \"$PERSONA_ID\",
      \"emotional_arc_id\": \"$ARC_ID\",
      \"training_topic_id\": \"$TOPIC_ID\"
    }")
  echo "$RESPONSE" | jq '.'
  echo ""
  
  IS_COMPATIBLE=$(echo "$RESPONSE" | jq -r '.is_compatible // false')
  CONFIDENCE=$(echo "$RESPONSE" | jq -r '.confidence // 0')
  
  if [ "$IS_COMPATIBLE" = "true" ]; then
    echo -e "${GREEN}✓ Combination is compatible (confidence: $CONFIDENCE)${NC}"
  else
    echo -e "${YELLOW}⚠ Combination has compatibility warnings (confidence: $CONFIDENCE)${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 4: SKIPPED (missing persona, arc, or topic IDs)${NC}"
  echo ""
fi

# Test 5: POST /api/conversations/generate-with-scaffolding (if we have IDs and ANTHROPIC_API_KEY)
if [ -n "$PERSONA_ID" ] && [ -n "$ARC_ID" ] && [ -n "$TOPIC_ID" ]; then
  if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}Test 5: POST /api/conversations/generate-with-scaffolding${NC}"
    echo "Request: POST $BASE_URL/api/conversations/generate-with-scaffolding"
    echo "Body: {persona_id: $PERSONA_ID, emotional_arc_id: $ARC_ID, training_topic_id: $TOPIC_ID, tier: 'template'}"
    echo ""
    echo -e "${YELLOW}Note: This may take 10-30 seconds...${NC}"
    echo ""
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/conversations/generate-with-scaffolding" \
      -H "Content-Type: application/json" \
      -d "{
        \"persona_id\": \"$PERSONA_ID\",
        \"emotional_arc_id\": \"$ARC_ID\",
        \"training_topic_id\": \"$TOPIC_ID\",
        \"tier\": \"template\"
      }")
    echo "$RESPONSE" | jq '.'
    echo ""
    
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
    if [ "$SUCCESS" = "true" ]; then
      CONVERSATION_ID=$(echo "$RESPONSE" | jq -r '.conversation_id')
      QUALITY_SCORE=$(echo "$RESPONSE" | jq -r '.quality_metrics.quality_score')
      COST=$(echo "$RESPONSE" | jq -r '.cost')
      echo -e "${GREEN}✓ Conversation generated successfully!${NC}"
      echo -e "  Conversation ID: $CONVERSATION_ID"
      echo -e "  Quality Score: $QUALITY_SCORE"
      echo -e "  Cost: \$$COST"
    else
      ERROR=$(echo "$RESPONSE" | jq -r '.error')
      echo -e "${RED}❌ Generation failed: $ERROR${NC}"
    fi
    echo ""
  else
    echo -e "${YELLOW}Test 5: SKIPPED (ANTHROPIC_API_KEY not set)${NC}"
    echo "To run this test, set ANTHROPIC_API_KEY environment variable:"
    echo "  export ANTHROPIC_API_KEY=sk-ant-..."
    echo ""
  fi
else
  echo -e "${YELLOW}Test 5: SKIPPED (missing persona, arc, or topic IDs)${NC}"
  echo ""
fi

# Test 6: Test with filters
echo -e "${YELLOW}Test 6: GET /api/scaffolding/personas with filters${NC}"
echo "Request: GET $BASE_URL/api/scaffolding/personas?domain=financial_planning&is_active=true"
echo ""
RESPONSE=$(curl -s "$BASE_URL/api/scaffolding/personas?domain=financial_planning&is_active=true")
echo "$RESPONSE" | jq '.'
echo ""

# Test 7: Test error handling - invalid UUID
echo -e "${YELLOW}Test 7: Error handling - invalid UUID${NC}"
echo "Request: POST $BASE_URL/api/scaffolding/check-compatibility"
echo "Body: {persona_id: 'invalid-uuid', emotional_arc_id: 'invalid', training_topic_id: 'invalid'}"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/api/scaffolding/check-compatibility" \
  -H "Content-Type: application/json" \
  -d '{
    "persona_id": "invalid-uuid",
    "emotional_arc_id": "invalid",
    "training_topic_id": "invalid"
  }')
echo "$RESPONSE" | jq '.'
echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo "All basic endpoint tests completed."
echo ""
echo "Next steps:"
echo "1. Verify that the RPC functions are created in Supabase:"
echo "   - Open Supabase SQL Editor"
echo "   - Run: src/lib/services/scaffolding-rpc-functions.sql"
echo ""
echo "2. Ensure database tables are populated with test data:"
echo "   - personas"
echo "   - emotional_arcs"
echo "   - training_topics"
echo "   - prompt_templates (with emotional_arc_type populated)"
echo ""
echo "3. Test the full generation flow with real data"
echo ""
echo "For more information, see:"
echo "  - src/lib/services/SCAFFOLDING-SERVICES-README.md"
echo "  - pmc/product/04-categories-to-conversation-pipeline-spec_v1.md"
echo ""

