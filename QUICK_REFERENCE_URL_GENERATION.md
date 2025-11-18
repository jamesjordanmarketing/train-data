# Quick Reference: On-Demand URL Generation

> **TL;DR**: Never use `file_url` from database. Always generate fresh URLs on-demand.

---

## ⚡ Quick Start

### Basic Pattern

```typescript
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';

const service = new ConversationStorageService(supabase);

// ✅ CORRECT: Generate URL on-demand
const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
const url = downloadInfo.download_url; // Fresh URL, valid 1 hour
```

---

## 🔧 Methods

### `getDownloadUrlForConversation(conversationId)`
**Returns**: Full download info with fresh URL

```typescript
const info = await service.getDownloadUrlForConversation(conversationId);
// { download_url, filename, file_size, expires_at, expires_in_seconds }
```

### `getRawResponseDownloadUrl(conversationId)`
**Returns**: Download info for raw response file

```typescript
const info = await service.getRawResponseDownloadUrl(conversationId);
// { download_url, filename, file_size, expires_at, expires_in_seconds }
```

### `getPresignedDownloadUrl(filePath)`
**Returns**: Just the signed URL

```typescript
const conversation = await service.getConversation(conversationId);
const url = await service.getPresignedDownloadUrl(conversation.file_path);
```

---

## 📋 API Route Template

```typescript
// app/api/conversations/[conversation_id]/download/route.ts
export async function GET(req, { params }) {
  const service = new ConversationStorageService(supabase);
  const downloadInfo = await service.getDownloadUrlForConversation(
    params.conversation_id
  );
  return NextResponse.json(downloadInfo);
}
```

---

## 💻 Frontend Template

```typescript
// components/DownloadButton.tsx
async function handleDownload() {
  const response = await fetch(`/api/conversations/${id}/download`);
  const { download_url } = await response.json();
  window.open(download_url, '_blank');
}
```

---

## ❌ Don't Do This

```typescript
// ❌ WRONG: Getting URL from database (expired!)
const conversation = await service.getConversation(id);
const url = conversation.file_url;

// ❌ WRONG: Storing URL in database
await supabase.from('conversations').update({ 
  file_url: 'https://...' 
});
```

---

## ✅ Do This

```typescript
// ✅ CORRECT: Generate URL on-demand
const downloadInfo = await service.getDownloadUrlForConversation(id);
const url = downloadInfo.download_url;

// ✅ CORRECT: Store only paths
await supabase.from('conversations').update({ 
  file_path: 'user-id/conv-id/conversation.json' 
});
```

---

## 🧪 Testing

```bash
# Run test script
ts-node src/scripts/test-url-generation.ts <conversation_id>
```

---

## 📚 Full Docs

- **Developer Guide**: `docs/ON_DEMAND_URL_GENERATION_GUIDE.md`
- **Implementation Details**: `PROMPT3_FILE1_V2_IMPLEMENTATION_SUMMARY.md`
- **Service Code**: `src/lib/services/conversation-storage-service.ts`

---

## 🎯 Remember

1. **Paths are permanent** → Store in database
2. **URLs are temporary** → Generate on-demand
3. **URLs expire in 1 hour** → Don't cache them
4. **Use convenience methods** → Less boilerplate

---

**Pattern**: 🗄️ Database → Store paths | 🔗 On-Demand → Generate URLs | ⏱️ Valid → 1 hour

