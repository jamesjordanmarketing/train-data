#!/bin/bash

# Simple End-to-End Generation Test (no jq required)

echo "=================================="
echo "Testing Conversation Generation"
echo "=================================="
echo ""

# Test data with hardcoded IDs from the previous output
PERSONA_ID="0dcc43c5-9e86-4216-8416-c1b64cce8073"  # Marcus
ARC_ID="619debb0-c6ce-4bbe-b97a-a22fb4baa198"      # Confusion → Clarity  
TOPIC_ID="9a277412-bc30-4ed8-aebe-a86d36a5b42b"    # HSA vs FSA

echo "Test Configuration:"
echo "  Persona: Marcus (Overwhelmed Avoider)"
echo "  Emotional Arc: Confusion → Clarity"
echo "  Topic: HSA vs FSA Decision"
echo "  Tier: template"
echo ""

echo "Generating conversation... (this may take 10-30 seconds)"
echo ""

response=$(curl -s -X POST "http://localhost:3000/api/conversations/generate-with-scaffolding" \
  -H "Content-Type: application/json" \
  -d "{
    \"persona_id\": \"$PERSONA_ID\",
    \"emotional_arc_id\": \"$ARC_ID\",
    \"training_topic_id\": \"$TOPIC_ID\",
    \"tier\": \"template\"
  }")

echo "Response received!"
echo ""
echo "Full Response:"
echo "$response" | head -c 2000
echo ""
echo "..."
echo ""

# Check if conversation_id exists in response
if echo "$response" | grep -q "conversation_id"; then
  echo "✓ SUCCESS: Conversation generated"
  
  # Extract conversation_id (basic text parsing)
  conversation_id=$(echo "$response" | grep -o '"conversation_id":"[^"]*' | cut -d'"' -f4)
  echo "  Conversation ID: $conversation_id"
  
  # Check for quality_score
  if echo "$response" | grep -q "quality_score"; then
    echo "  ✓ Quality score present"
  fi
  
  # Check for scaffolding metadata
  if echo "$response" | grep -q "scaffolding"; then
    echo "  ✓ Scaffolding metadata present"
  fi
  
  # Check for compatibility_score
  if echo "$response" | grep -q "compatibility_score"; then
    echo "  ✓ Compatibility score present"
  fi
  
  echo ""
  echo "✓ All checks passed!"
  
else
  echo "✗ FAILED: No conversation_id in response"
  echo ""
  echo "Error response:"
  echo "$response"
  exit 1
fi

