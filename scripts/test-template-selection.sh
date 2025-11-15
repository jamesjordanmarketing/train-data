#!/bin/bash

###############################################################################
# Template Selection Service Integration Test
# Tests the arc-first selection strategy and template resolution
###############################################################################

set -e

echo "🚀 Testing Template Selection Service Integration"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (adjust if needed)
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo -e "${BLUE}Step 1: Test Template Selection by Emotional Arc${NC}"
echo "------------------------------------------------"

# Test 1: Select templates by emotional arc
echo "Testing arc-first selection..."
RESPONSE=$(curl -s "$BASE_URL/api/templates/select?emotional_arc_type=confusion_to_clarity&tier=template")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Template selection by emotional arc successful${NC}"
  TEMPLATE_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
  echo "  Found $TEMPLATE_COUNT templates"
else
  echo -e "${RED}✗ Template selection failed${NC}"
  echo "  Response: $RESPONSE"
fi

echo ""
echo -e "${BLUE}Step 2: Test Template Selection with Filters${NC}"
echo "------------------------------------------------"

# Test 2: Select with persona and topic filters
echo "Testing with persona and topic filters..."
RESPONSE=$(curl -s "$BASE_URL/api/templates/select?emotional_arc_type=confusion_to_clarity&tier=template&persona_type=young_professional&topic_key=retirement_basics")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Filtered template selection successful${NC}"
  TEMPLATE_COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
  echo "  Found $TEMPLATE_COUNT compatible templates"
else
  echo -e "${RED}✗ Filtered selection failed${NC}"
  echo "  Response: $RESPONSE"
fi

echo ""
echo -e "${BLUE}Step 3: Test Template Compatibility Validation${NC}"
echo "------------------------------------------------"

# First, get a template ID from the previous response
TEMPLATE_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TEMPLATE_ID" ]; then
  echo "Testing compatibility validation with template: $TEMPLATE_ID"
  
  VALIDATION=$(curl -s -X POST "$BASE_URL/api/templates/select" \
    -H "Content-Type: application/json" \
    -d "{
      \"templateId\": \"$TEMPLATE_ID\",
      \"personaKey\": \"young_professional\",
      \"topicKey\": \"retirement_basics\"
    }")
  
  if echo "$VALIDATION" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Template compatibility validation successful${NC}"
    COMPATIBLE=$(echo "$VALIDATION" | grep -o '"compatible":[^,]*' | cut -d: -f2)
    echo "  Compatible: $COMPATIBLE"
  else
    echo -e "${RED}✗ Compatibility validation failed${NC}"
    echo "  Response: $VALIDATION"
  fi
else
  echo -e "${RED}✗ Could not extract template ID for testing${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Test Scaffolding Data Endpoints${NC}"
echo "------------------------------------------------"

# Test personas endpoint
echo "Testing personas endpoint..."
PERSONAS=$(curl -s "$BASE_URL/api/scaffolding/personas")
if echo "$PERSONAS" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Personas endpoint working${NC}"
  PERSONA_COUNT=$(echo "$PERSONAS" | grep -o '"count":[0-9]*' | cut -d: -f2)
  echo "  Found $PERSONA_COUNT personas"
else
  echo -e "${RED}✗ Personas endpoint failed${NC}"
fi

# Test emotional arcs endpoint
echo "Testing emotional arcs endpoint..."
ARCS=$(curl -s "$BASE_URL/api/scaffolding/emotional-arcs")
if echo "$ARCS" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Emotional arcs endpoint working${NC}"
  ARC_COUNT=$(echo "$ARCS" | grep -o '"count":[0-9]*' | cut -d: -f2)
  echo "  Found $ARC_COUNT emotional arcs"
else
  echo -e "${RED}✗ Emotional arcs endpoint failed${NC}"
fi

# Test training topics endpoint
echo "Testing training topics endpoint..."
TOPICS=$(curl -s "$BASE_URL/api/scaffolding/training-topics")
if echo "$TOPICS" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Training topics endpoint working${NC}"
  TOPIC_COUNT=$(echo "$TOPICS" | grep -o '"count":[0-9]*' | cut -d: -f2)
  echo "  Found $TOPIC_COUNT training topics"
else
  echo -e "${RED}✗ Training topics endpoint failed${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Test Scaffolding Compatibility Check${NC}"
echo "------------------------------------------------"

# Extract IDs for compatibility test
PERSONA_ID=$(echo "$PERSONAS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
ARC_ID=$(echo "$ARCS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
TOPIC_ID=$(echo "$TOPICS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$PERSONA_ID" ] && [ -n "$ARC_ID" ] && [ -n "$TOPIC_ID" ]; then
  echo "Testing compatibility with:"
  echo "  Persona: $PERSONA_ID"
  echo "  Arc: $ARC_ID"
  echo "  Topic: $TOPIC_ID"
  
  COMPATIBILITY=$(curl -s -X POST "$BASE_URL/api/scaffolding/check-compatibility" \
    -H "Content-Type: application/json" \
    -d "{
      \"persona_id\": \"$PERSONA_ID\",
      \"emotional_arc_id\": \"$ARC_ID\",
      \"training_topic_id\": \"$TOPIC_ID\"
    }")
  
  if echo "$COMPATIBILITY" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Compatibility check successful${NC}"
    CONFIDENCE=$(echo "$COMPATIBILITY" | grep -o '"confidence":[0-9.]*' | cut -d: -f2)
    echo "  Confidence: $CONFIDENCE"
  else
    echo -e "${RED}✗ Compatibility check failed${NC}"
    echo "  Response: $COMPATIBILITY"
  fi
else
  echo -e "${RED}✗ Could not extract IDs for compatibility test${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✓ Template Selection Service Integration Test Complete${NC}"
echo "=================================================="

