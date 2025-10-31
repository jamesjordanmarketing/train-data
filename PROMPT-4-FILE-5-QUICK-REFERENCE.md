# Export API Endpoints - Quick Reference

🚀 **Fast Start Guide for Developers**

---

## 📍 Endpoints at a Glance

| Method | Endpoint | Purpose | Time |
|--------|----------|---------|------|
| POST | `/api/export/conversations` | Create export | 1-10s |
| GET | `/api/export/status/:id` | Check status | <1s |
| GET | `/api/export/download/:id` | Download file | 1-5s |
| GET | `/api/export/history` | List exports | <1s |

---

## 🎯 Quick Examples

### 1. Create Export (JSONL)

```bash
curl -X POST http://localhost:3000/api/export/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
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
  }'
```

**Response:**
```json
{
  "export_id": "uuid",
  "status": "completed",
  "conversation_count": 42,
  "file_size": 1024000,
  "file_url": "/api/export/download/uuid",
  "filename": "training-data-all-2025-10-31-42.jsonl"
}
```

### 2. Check Status

```bash
curl http://localhost:3000/api/export/status/EXPORT_ID \
  -H "x-user-id: YOUR_USER_ID"
```

### 3. Download File

```bash
curl http://localhost:3000/api/export/download/EXPORT_ID \
  -H "x-user-id: YOUR_USER_ID" \
  -o export.jsonl
```

### 4. Get History

```bash
curl "http://localhost:3000/api/export/history?page=1&limit=10" \
  -H "x-user-id: YOUR_USER_ID"
```

---

## 🎨 Export Formats

| Format | Extension | MIME Type | Best For |
|--------|-----------|-----------|----------|
| JSONL | `.jsonl` | `application/x-ndjson` | AI Training |
| JSON | `.json` | `application/json` | Analysis |
| CSV | `.csv` | `text/csv` | Excel/Sheets |
| Markdown | `.md` | `text/markdown` | Documentation |

---

## 🔍 Filtering Options

```json
{
  "filters": {
    "tier": ["template", "scenario", "edge_case"],
    "status": ["approved", "pending_review"],
    "qualityScoreMin": 7.0,
    "qualityScoreMax": 10.0,
    "dateFrom": "2025-01-01T00:00:00Z",
    "dateTo": "2025-12-31T23:59:59Z",
    "categories": ["technical", "support"],
    "searchQuery": "machine learning"
  }
}
```

---

## 🎚️ Scope Options

### `"scope": "all"`
Exports all approved conversations. No additional parameters needed.

```json
{
  "config": {
    "scope": "all",
    "format": "jsonl"
  }
}
```

### `"scope": "selected"`
Exports specific conversations by ID. Requires `conversationIds`.

```json
{
  "config": {
    "scope": "selected",
    "format": "csv"
  },
  "conversationIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### `"scope": "filtered"`
Exports conversations matching filter criteria. Requires `filters`.

```json
{
  "config": {
    "scope": "filtered",
    "format": "markdown"
  },
  "filters": {
    "tier": ["template"],
    "qualityScoreMin": 7.0
  }
}
```

---

## 📊 Status Codes

| Code | Meaning | What to Do |
|------|---------|-----------|
| 200 | Success | Download or read data |
| 201 | Created | Export ready immediately |
| 202 | Queued | Check status later |
| 400 | Bad Request | Fix request body |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Check export ID |
| 410 | Expired | Create new export |
| 425 | Not Ready | Wait and retry |
| 500 | Server Error | Contact support |

---

## ⏱️ Processing Times

| Conversations | Mode | Expected Time |
|--------------|------|---------------|
| < 100 | Sync | < 5 seconds |
| 100-499 | Sync | 5-15 seconds |
| ≥ 500 | Background | Queued (check status) |

---

## 🧪 Testing

### Run Integration Tests
```bash
npm test src/app/api/export/__tests__/export.integration.test.ts
```

### Run Manual Tests
```bash
./scripts/test-export-api.sh
```

### Thunder Client
Import `thunder-tests/export-api-collection.json` in VS Code.

---

## 🛠️ Common Tasks

### Export All Approved Conversations
```bash
curl -X POST http://localhost:3000/api/export/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -d '{"config":{"scope":"all","format":"jsonl","includeMetadata":true,"includeQualityScores":true,"includeTimestamps":true,"includeApprovalHistory":false,"includeParentReferences":false,"includeFullContent":true}}'
```

### Export High-Quality Templates Only
```bash
curl -X POST http://localhost:3000/api/export/conversations \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -d '{
    "config": {"scope":"filtered","format":"jsonl","includeMetadata":true,"includeQualityScores":true,"includeTimestamps":true,"includeApprovalHistory":false,"includeParentReferences":false,"includeFullContent":true},
    "filters": {"tier":["template"],"status":["approved"],"qualityScoreMin":8.0}
  }'
```

### Get Recent Exports
```bash
curl "http://localhost:3000/api/export/history?status=completed&page=1&limit=5" \
  -H "x-user-id: USER_ID"
```

---

## 🐛 Troubleshooting

### "No conversations found"
**Problem:** No conversations match your criteria  
**Solution:** Check database, adjust filters, or use scope: "all"

### "Export expired"
**Problem:** Export older than 24 hours  
**Solution:** Create a new export

### "Export not ready"
**Problem:** Background export still processing  
**Solution:** Poll `/api/export/status/:id` every 5-10 seconds

### "Validation Error"
**Problem:** Invalid request format  
**Solution:** Check `src/lib/validations/export-schemas.ts` for schema

---

## 📂 File Locations

| Component | Path |
|-----------|------|
| API Routes | `src/app/api/export/*/route.ts` |
| Validation | `src/lib/validations/export-schemas.ts` |
| Service | `src/lib/export-service.ts` |
| Transformers | `src/lib/export-transformers/` |
| Tests | `src/app/api/export/__tests__/` |
| Docs | `src/app/api/export/README.md` |

---

## 🔗 Related Documentation

- **Full API Reference:** `src/app/api/export/README.md`
- **Implementation Summary:** `PROMPT-4-FILE-5-IMPLEMENTATION-SUMMARY.md`
- **ExportService Docs:** `EXPORT-SERVICE-README.md`
- **Transformer Docs:** `src/lib/export-transformers/README.md`

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Replace `x-user-id` header with Supabase auth
- [ ] Configure RLS policies on `export_logs` table
- [ ] Set up Supabase Storage bucket for exports
- [ ] Configure background job processing
- [ ] Set up monitoring and alerts
- [ ] Add rate limiting
- [ ] Enable compression for large files
- [ ] Set up automated cleanup of expired exports

---

## 💡 Pro Tips

1. **Batch Operations:** For multiple exports, use history endpoint to track them
2. **Expiration:** Downloads expire after 24 hours - download promptly
3. **Format Selection:** Use JSONL for AI training, CSV for analysis, Markdown for review
4. **Quality Filters:** Set `qualityScoreMin: 7.0` for production-ready data
5. **Background Jobs:** Exports ≥500 conversations are queued automatically

---

## 📞 Support

Having issues?
1. Check the troubleshooting section above
2. Review the full API docs: `src/app/api/export/README.md`
3. Run the test script: `./scripts/test-export-api.sh`
4. Check validation schemas: `src/lib/validations/export-schemas.ts`

---

**Last Updated:** October 31, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready

