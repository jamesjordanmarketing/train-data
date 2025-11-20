# API Testing Guide - Prompt 3 Endpoints

## Quick Reference

### Base URL
- Local: `http://localhost:3000`
- Production: Your deployed URL

### Authentication
All endpoints require authentication. Include your Supabase auth token:

```
Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

---

## 📡 Endpoint 1: Download Raw JSON

### Request
```http
GET /api/conversations/[conversation_id]/download/raw
Authorization: Bearer YOUR_TOKEN
```

### Example (cURL)
```bash
curl -X GET \
  "http://localhost:3000/api/conversations/conv-123/download/raw" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200)
```json
{
  "conversation_id": "conv-123",
  "download_url": "https://xxxxx.supabase.co/storage/v1/object/sign/conversation-files/raw/user-id/conv-123.json?token=...",
  "filename": "conv-123-raw.json",
  "file_size": 2345,
  "expires_at": "2025-11-20T17:00:00Z",
  "expires_in_seconds": 3600
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Conversation not found or no raw response available"
}
```

**404 No Raw Response**
```json
{
  "error": "No raw response available for this conversation"
}
```

---

## 📡 Endpoint 2: Download Enriched JSON

### Request
```http
GET /api/conversations/[conversation_id]/download/enriched
Authorization: Bearer YOUR_TOKEN
```

### Example (cURL)
```bash
curl -X GET \
  "http://localhost:3000/api/conversations/conv-123/download/enriched" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200)
```json
{
  "conversation_id": "conv-123",
  "download_url": "https://xxxxx.supabase.co/storage/v1/object/sign/conversation-files/user-id/conv-123/enriched.json?token=...",
  "filename": "enriched.json",
  "file_size": 12345,
  "enrichment_status": "completed",
  "expires_at": "2025-11-20T17:00:00Z",
  "expires_in_seconds": 3600
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Conversation Not Found**
```json
{
  "error": "Conversation not found"
}
```

**400 Enrichment Not Complete**
```json
{
  "error": "Enrichment not complete (status: not_started)",
  "enrichment_status": "not_started"
}
```

**404 File Not Found**
```json
{
  "error": "Enriched file path not found"
}
```

---

## 📡 Endpoint 3: Validation Report

### Request
```http
GET /api/conversations/[conversation_id]/validation-report
Authorization: Bearer YOUR_TOKEN
```

### Example (cURL)
```bash
curl -X GET \
  "http://localhost:3000/api/conversations/conv-123/validation-report" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200)
```json
{
  "conversation_id": "conv-123",
  "enrichment_status": "completed",
  "processing_status": "completed",
  "validation_report": {
    "isValid": true,
    "hasBlockers": false,
    "hasWarnings": true,
    "warnings": [
      {
        "field": "conversation.metadata.quality_tier",
        "code": "FIELD_MISSING_OPTIONAL",
        "message": "Optional field 'quality_tier' is missing",
        "severity": "warning",
        "suggestion": "Add quality_tier to metadata"
      }
    ],
    "blockers": [],
    "summary": "Validation passed with 1 warning(s)",
    "validatedAt": "2025-11-20T15:30:00Z"
  },
  "enrichment_error": null,
  "timeline": {
    "raw_stored_at": "2025-11-20T15:00:00.000Z",
    "enriched_at": "2025-11-20T15:30:00.000Z",
    "last_updated": "2025-11-20T15:35:00.000Z"
  },
  "pipeline_stages": {
    "stage_1_generation": {
      "name": "Claude Generation",
      "status": "completed",
      "completed_at": "2025-11-20T15:00:00.000Z"
    },
    "stage_2_validation": {
      "name": "Structural Validation",
      "status": "completed",
      "completed_at": "2025-11-20T15:15:00.000Z"
    },
    "stage_3_enrichment": {
      "name": "Data Enrichment",
      "status": "completed",
      "completed_at": "2025-11-20T15:30:00.000Z"
    },
    "stage_4_normalization": {
      "name": "JSON Normalization",
      "status": "completed",
      "completed_at": "2025-11-20T15:35:00.000Z"
    }
  }
}
```

### Example with Validation Errors
```json
{
  "conversation_id": "conv-456",
  "enrichment_status": "validation_failed",
  "processing_status": "failed",
  "validation_report": {
    "isValid": false,
    "hasBlockers": true,
    "hasWarnings": false,
    "warnings": [],
    "blockers": [
      {
        "field": "conversation.turns",
        "code": "FIELD_MISSING_REQUIRED",
        "message": "Required field 'turns' is missing or invalid",
        "severity": "blocker",
        "suggestion": "Ensure the conversation contains a valid 'turns' array"
      }
    ],
    "summary": "Validation failed with 1 blocker(s)",
    "validatedAt": "2025-11-20T15:30:00Z"
  },
  "enrichment_error": "Validation failed: Missing required field 'turns'",
  "timeline": {
    "raw_stored_at": "2025-11-20T15:00:00.000Z",
    "enriched_at": null,
    "last_updated": "2025-11-20T15:30:00.000Z"
  },
  "pipeline_stages": {
    "stage_1_generation": {
      "name": "Claude Generation",
      "status": "completed",
      "completed_at": "2025-11-20T15:00:00.000Z"
    },
    "stage_2_validation": {
      "name": "Structural Validation",
      "status": "failed",
      "completed_at": "2025-11-20T15:15:00.000Z"
    },
    "stage_3_enrichment": {
      "name": "Data Enrichment",
      "status": "pending",
      "completed_at": null
    },
    "stage_4_normalization": {
      "name": "JSON Normalization",
      "status": "pending",
      "completed_at": null
    }
  }
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Conversation not found"
}
```

---

## 🧪 Testing Workflow

### Step 1: Get Your Auth Token

If using Supabase Auth in your app:

```typescript
// In your frontend app
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

Or get it from browser DevTools:
1. Open your app
2. Open DevTools → Application → Local Storage
3. Find `supabase.auth.token` or similar
4. Copy the JWT token

### Step 2: Test Raw JSON Download

```bash
# Replace YOUR_TOKEN and conv-123
curl -v -X GET \
  "http://localhost:3000/api/conversations/conv-123/download/raw" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: JSON response with `download_url`

### Step 3: Download the File

Take the `download_url` from Step 2 and open it in browser or:

```bash
curl -X GET "SIGNED_URL_FROM_STEP_2" -o raw-conversation.json
```

Expected: JSON file downloaded

### Step 4: Test Enriched JSON Download

```bash
curl -v -X GET \
  "http://localhost:3000/api/conversations/conv-123/download/enriched" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: 
- If enrichment complete: JSON response with `download_url`
- If not complete: Error message with current status

### Step 5: Test Validation Report

```bash
curl -X GET \
  "http://localhost:3000/api/conversations/conv-123/validation-report" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.'  # Pretty print with jq
```

Expected: Complete validation report with pipeline stages

---

## 🛠️ Testing Tools

### Option 1: Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create new request
3. Set method to GET
4. Enter URL: `http://localhost:3000/api/conversations/conv-123/download/raw`
5. Add header: `Authorization: Bearer YOUR_TOKEN`
6. Click Send

### Option 2: Postman

1. Create new request
2. Set method to GET
3. Enter URL with conversation ID
4. Go to Headers tab
5. Add: `Authorization: Bearer YOUR_TOKEN`
6. Click Send

### Option 3: cURL (Command Line)

Use the examples above

### Option 4: JavaScript/TypeScript

```typescript
async function testDownloadRaw(conversationId: string, token: string) {
  const response = await fetch(
    `http://localhost:3000/api/conversations/${conversationId}/download/raw`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data);
  
  if (response.ok && data.download_url) {
    // Open download URL
    window.open(data.download_url, '_blank');
  }
}
```

---

## 📋 Test Checklist

### Raw JSON Download
- [ ] Returns 200 with signed URL for valid conversation
- [ ] Returns 401 without auth token
- [ ] Returns 404 for non-existent conversation
- [ ] Returns 404 when no raw response exists
- [ ] Signed URL successfully downloads JSON file
- [ ] Downloaded file is valid JSON
- [ ] Signed URL expires after 1 hour

### Enriched JSON Download
- [ ] Returns 200 with signed URL when enrichment complete
- [ ] Returns 400 with current status when enrichment not complete
- [ ] Returns 401 without auth token
- [ ] Returns 404 for non-existent conversation
- [ ] Returns 404 when enriched file path missing
- [ ] Signed URL successfully downloads JSON file
- [ ] Downloaded file contains enriched format
- [ ] Signed URL expires after 1 hour

### Validation Report
- [ ] Returns 200 with complete report
- [ ] Shows all 4 pipeline stages
- [ ] Includes validation report when available
- [ ] Shows enrichment errors when present
- [ ] Timeline shows correct timestamps
- [ ] Returns 401 without auth token
- [ ] Returns 404 for non-existent conversation
- [ ] Pipeline stages reflect actual conversation state

---

## 🚨 Common Issues

### "Unauthorized" (401)
- Check auth token is valid
- Ensure token hasn't expired
- Verify token is included in Authorization header

### "Conversation not found" (404)
- Verify conversation ID exists in database
- Check user has access to this conversation
- Ensure conversation_id is spelled correctly

### "Enrichment not complete" (400)
- Check enrichment_status in database
- Wait for enrichment pipeline to complete
- Or trigger enrichment manually (Prompt 4)

### Signed URL doesn't work
- URLs expire after 1 hour
- Check Supabase storage bucket permissions
- Verify file exists at the path
- Ensure storage bucket is named 'conversation-files'

---

## 📊 Expected Enrichment Status Values

- `not_started` - Initial state
- `validated` - Passed validation
- `validation_failed` - Failed validation (has blockers)
- `enrichment_in_progress` - Currently enriching
- `enriched` - Enrichment complete
- `normalization_failed` - Normalization had errors
- `completed` - Entire pipeline complete

Only `enriched` and `completed` allow downloading enriched JSON.

---

**Happy Testing!** 🚀

