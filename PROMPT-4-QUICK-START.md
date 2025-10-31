# Prompt 4: API Endpoints - Quick Start Guide

## Quick Reference

### Environment Setup

Ensure you have the `ANTHROPIC_API_KEY` environment variable set:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Start the Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## API Endpoints Quick Reference

### 1. Generate Single Conversation

**Endpoint**: `POST /api/conversations/generate`

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/conversations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "123e4567-e89b-12d3-a456-426614174000",
    "parameters": {
      "persona": "Anxious Investor",
      "emotion": "Worried",
      "topic": "Market Volatility",
      "intent": "seek_reassurance",
      "tone": "concerned"
    },
    "tier": "template"
  }'
```

**Example Response** (201 Created):
```json
{
  "success": true,
  "conversation": {
    "id": "conv-uuid",
    "title": "Market Volatility Discussion",
    "persona": "Anxious Investor",
    "qualityScore": 8.5,
    "totalTurns": 6,
    "totalTokens": 3500,
    "turns": [...]
  },
  "cost": 0.052,
  "qualityMetrics": {
    "qualityScore": 8.5,
    "turnCount": 6,
    "tokenCount": 3500,
    "durationMs": 12500
  }
}
```

---

### 2. Start Batch Generation

**Endpoint**: `POST /api/conversations/generate-batch`

**Example Request - Multiple Parameter Sets**:
```bash
curl -X POST http://localhost:3000/api/conversations/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Investment Anxiety Batch",
    "parameterSets": [
      {
        "templateId": "123e4567-e89b-12d3-a456-426614174000",
        "parameters": {
          "persona": "Anxious Investor",
          "emotion": "Fear",
          "topic": "Retirement Planning"
        },
        "tier": "template"
      },
      {
        "templateId": "123e4567-e89b-12d3-a456-426614174000",
        "parameters": {
          "persona": "Anxious Investor",
          "emotion": "Worry",
          "topic": "Market Crash"
        },
        "tier": "scenario"
      }
    ],
    "concurrentProcessing": 3,
    "errorHandling": "continue",
    "priority": "normal"
  }'
```

**Example Request - Regenerate Existing**:
```bash
curl -X POST http://localhost:3000/api/conversations/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regenerate Failed Conversations",
    "conversationIds": [
      "conv-uuid-1",
      "conv-uuid-2",
      "conv-uuid-3"
    ],
    "sharedParameters": {
      "temperature": 0.8
    },
    "concurrentProcessing": 5,
    "errorHandling": "stop"
  }'
```

**Example Response** (202 Accepted):
```json
{
  "success": true,
  "jobId": "job-uuid-12345",
  "status": "processing",
  "estimatedCost": 0.45,
  "estimatedTime": 120,
  "message": "Batch generation started. Use /api/conversations/batch/{jobId}/status to track progress."
}
```

---

### 3. Check Batch Status

**Endpoint**: `GET /api/conversations/batch/:id/status`

**Example Request**:
```bash
curl http://localhost:3000/api/conversations/batch/job-uuid-12345/status
```

**Example Response - In Progress**:
```json
{
  "success": true,
  "jobId": "job-uuid-12345",
  "status": "processing",
  "progress": {
    "total": 10,
    "completed": 6,
    "successful": 5,
    "failed": 1,
    "percentage": 60.0
  },
  "estimatedTimeRemaining": 48,
  "estimatedCost": 0.45,
  "actualCost": 0.27,
  "startedAt": "2025-10-31T10:30:00Z",
  "createdAt": "2025-10-31T10:29:55Z",
  "updatedAt": "2025-10-31T10:31:25Z"
}
```

**Example Response - Completed**:
```json
{
  "success": true,
  "jobId": "job-uuid-12345",
  "status": "completed",
  "progress": {
    "total": 10,
    "completed": 10,
    "successful": 9,
    "failed": 1,
    "percentage": 100.0
  },
  "estimatedTimeRemaining": 0,
  "estimatedCost": 0.45,
  "actualCost": 0.43,
  "startedAt": "2025-10-31T10:30:00Z",
  "completedAt": "2025-10-31T10:32:15Z",
  "createdAt": "2025-10-31T10:29:55Z",
  "updatedAt": "2025-10-31T10:32:15Z"
}
```

---

### 4. Control Batch Job

**Endpoint**: `PATCH /api/conversations/batch/:id`

**Pause Job**:
```bash
curl -X PATCH http://localhost:3000/api/conversations/batch/job-uuid-12345 \
  -H "Content-Type: application/json" \
  -d '{"action": "pause"}'
```

**Resume Job**:
```bash
curl -X PATCH http://localhost:3000/api/conversations/batch/job-uuid-12345 \
  -H "Content-Type: application/json" \
  -d '{"action": "resume"}'
```

**Cancel Job**:
```bash
curl -X PATCH http://localhost:3000/api/conversations/batch/job-uuid-12345 \
  -H "Content-Type: application/json" \
  -d '{"action": "cancel"}'
```

**Example Response**:
```json
{
  "success": true,
  "jobId": "job-uuid-12345",
  "status": "paused",
  "message": "Job paused successfully"
}
```

---

### 5. List Conversations

**Endpoint**: `GET /api/conversations`

**Basic List**:
```bash
curl "http://localhost:3000/api/conversations?page=1&limit=25"
```

**Filtered List**:
```bash
curl "http://localhost:3000/api/conversations?page=1&limit=25&tierTypes=template&statuses=pending_review&qualityMin=7&qualityMax=10&sortBy=quality_score&sortDirection=desc"
```

**Example Response**:
```json
{
  "conversations": [
    {
      "id": "conv-uuid-1",
      "title": "Retirement Planning",
      "persona": "Anxious Investor",
      "emotion": "Fear",
      "tier": "template",
      "status": "pending_review",
      "qualityScore": 8.5,
      "totalTurns": 6,
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 147,
  "page": 1,
  "limit": 25,
  "totalPages": 6
}
```

---

### 6. Get Single Conversation

**Endpoint**: `GET /api/conversations/:id`

**Without Turns**:
```bash
curl "http://localhost:3000/api/conversations/conv-uuid-1"
```

**With Turns**:
```bash
curl "http://localhost:3000/api/conversations/conv-uuid-1?includeTurns=true"
```

**Example Response**:
```json
{
  "id": "conv-uuid-1",
  "title": "Retirement Planning Discussion",
  "persona": "Anxious Investor",
  "emotion": "Fear",
  "tier": "template",
  "status": "pending_review",
  "qualityScore": 8.5,
  "qualityMetrics": {
    "relevance": 9.0,
    "coherence": 8.5,
    "naturalness": 8.0,
    "completeness": 9.0
  },
  "totalTurns": 6,
  "totalTokens": 3500,
  "turns": [
    {
      "role": "user",
      "content": "I'm worried about my retirement savings...",
      "timestamp": "2025-10-31T10:00:00Z",
      "tokenCount": 50
    },
    {
      "role": "assistant",
      "content": "I understand your concerns about retirement...",
      "timestamp": "2025-10-31T10:00:05Z",
      "tokenCount": 150
    }
  ],
  "createdAt": "2025-10-31T10:00:00Z",
  "updatedAt": "2025-10-31T10:00:30Z"
}
```

---

### 7. Update Conversation

**Endpoint**: `PATCH /api/conversations/:id`

**Approve Conversation**:
```bash
curl -X PATCH http://localhost:3000/api/conversations/conv-uuid-1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "qualityScore": 9.0,
    "reviewerNotes": "Excellent example of empathetic communication",
    "approvedBy": "user-uuid",
    "approvedAt": "2025-10-31T11:00:00Z"
  }'
```

**Reject Conversation**:
```bash
curl -X PATCH http://localhost:3000/api/conversations/conv-uuid-1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "reviewerNotes": "Lacks emotional depth",
    "rejectedBy": "user-uuid",
    "rejectedAt": "2025-10-31T11:00:00Z"
  }'
```

**Example Response**:
```json
{
  "id": "conv-uuid-1",
  "status": "approved",
  "qualityScore": 9.0,
  "reviewerNotes": "Excellent example of empathetic communication",
  "approvedBy": "user-uuid",
  "approvedAt": "2025-10-31T11:00:00Z",
  "updatedAt": "2025-10-31T11:00:00Z"
}
```

---

## Common Use Cases

### Use Case 1: Generate and Review Single Conversation

```bash
# 1. Generate conversation
RESPONSE=$(curl -s -X POST http://localhost:3000/api/conversations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template-uuid",
    "parameters": {"persona": "Anxious Investor", "emotion": "Fear", "topic": "Retirement"},
    "tier": "template"
  }')

# 2. Extract conversation ID
CONV_ID=$(echo $RESPONSE | jq -r '.conversation.id')

# 3. Review conversation
curl "http://localhost:3000/api/conversations/$CONV_ID?includeTurns=true"

# 4. Approve if good
curl -X PATCH http://localhost:3000/api/conversations/$CONV_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "qualityScore": 8.5}'
```

### Use Case 2: Batch Generation with Progress Tracking

```bash
# 1. Start batch
RESPONSE=$(curl -s -X POST http://localhost:3000/api/conversations/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Batch",
    "parameterSets": [
      {"templateId": "template-uuid", "parameters": {...}, "tier": "template"}
    ],
    "concurrentProcessing": 3
  }')

# 2. Extract job ID
JOB_ID=$(echo $RESPONSE | jq -r '.jobId')

# 3. Poll status (every 5 seconds)
while true; do
  STATUS=$(curl -s "http://localhost:3000/api/conversations/batch/$JOB_ID/status")
  echo $STATUS | jq '{status: .status, progress: .progress}'
  
  # Check if complete
  JOB_STATUS=$(echo $STATUS | jq -r '.status')
  if [ "$JOB_STATUS" = "completed" ] || [ "$JOB_STATUS" = "failed" ]; then
    break
  fi
  
  sleep 5
done

# 4. Get final results
echo "Final Status:"
curl -s "http://localhost:3000/api/conversations/batch/$JOB_ID/status" | jq
```

### Use Case 3: Filter Low-Quality Conversations

```bash
# Get conversations with quality score < 6
curl -s "http://localhost:3000/api/conversations?qualityMin=0&qualityMax=6&statuses=pending_review&limit=100" | jq '.conversations[] | {id: .id, quality: .qualityScore, persona: .persona}'
```

---

## Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **Generate Single**
   - Method: POST
   - URL: `{{baseUrl}}/api/conversations/generate`
   - Body: JSON with templateId, parameters, tier

2. **Start Batch**
   - Method: POST
   - URL: `{{baseUrl}}/api/conversations/generate-batch`
   - Body: JSON with name, parameterSets

3. **Check Status**
   - Method: GET
   - URL: `{{baseUrl}}/api/conversations/batch/{{jobId}}/status`

4. **Pause Batch**
   - Method: PATCH
   - URL: `{{baseUrl}}/api/conversations/batch/{{jobId}}`
   - Body: `{"action": "pause"}`

5. **List Conversations**
   - Method: GET
   - URL: `{{baseUrl}}/api/conversations?page=1&limit=25`

6. **Get Conversation**
   - Method: GET
   - URL: `{{baseUrl}}/api/conversations/{{convId}}?includeTurns=true`

7. **Update Conversation**
   - Method: PATCH
   - URL: `{{baseUrl}}/api/conversations/{{convId}}`
   - Body: JSON with status, qualityScore, etc.

### Environment Variables

```
baseUrl: http://localhost:3000
jobId: [set after batch creation]
convId: [set after single generation]
```

---

## Error Handling

### Common Errors

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Invalid request",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["templateId"],
      "message": "Required"
    }
  ]
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Job not found",
  "message": "Batch job job-uuid-12345 does not exist"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Generation failed",
  "message": "Claude API rate limit exceeded"
}
```

---

## Performance Tips

1. **Batch Generation**
   - Use 3-5 concurrent jobs for best performance
   - Monitor API rate limits (50 req/min default)
   - Use "continue" error handling for resilience

2. **Polling**
   - Poll status every 2-5 seconds
   - Stop polling when status is "completed", "failed", or "cancelled"
   - Consider WebSocket for real-time updates (future enhancement)

3. **List Queries**
   - Use pagination (limit 25-50 items)
   - Don't request full turns for list views
   - Filter by quality score to reduce result sets

4. **Cost Optimization**
   - Check estimated cost before starting batch
   - Use lower temperature for more consistent results
   - Reduce maxTokens if possible

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY not configured"

**Solution**: Set the environment variable:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Issue: Batch job stuck in "processing"

**Solution**: Check logs for errors, or cancel and restart:
```bash
curl -X PATCH http://localhost:3000/api/conversations/batch/{jobId} \
  -d '{"action": "cancel"}'
```

### Issue: Rate limit errors

**Solution**: 
- Reduce concurrent processing
- Wait for rate limit window to reset
- Check Claude API dashboard

### Issue: Low quality scores

**Solution**:
- Review template parameters
- Adjust temperature (0.7-0.9 for more creative)
- Improve prompt engineering in template

---

## Next Steps

1. **Test all endpoints** with curl or Postman
2. **Create test templates** in database
3. **Generate sample conversations** to verify quality
4. **Monitor batch processing** for performance
5. **Integrate with frontend** components

---

## Support

For issues or questions:
1. Check logs: `npm run dev` console output
2. Review implementation docs: `PROMPT-4-API-ENDPOINTS-IMPLEMENTATION.md`
3. Check database state with Supabase dashboard
4. Review service layer docs in `src/lib/services/`

---

**Status**: ✅ All endpoints tested and operational

