# On-Demand URL Generation: Developer Guide

**Last Updated**: November 18, 2025  
**Status**: ✅ ACTIVE PATTERN

---

## The Problem

Signed URLs from Supabase Storage expire after 1 hour. Storing these URLs in the database leads to:
- ❌ Expired URLs returned to clients
- ❌ "File not found" errors when URLs expire
- ❌ Need to refresh URLs periodically
- ❌ Complex caching and invalidation logic

## The Solution

**Never store signed URLs in the database. Always generate them fresh on-demand.**

- ✅ Store file paths only (permanent)
- ✅ Generate signed URLs when needed (temporary)
- ✅ URLs always valid for full 1-hour window
- ✅ Simple, reliable architecture

---

## Quick Reference

### ❌ WRONG Pattern

```typescript
// DON'T: Get URL from database (expired!)
const conversation = await service.getConversation(id);
const url = conversation.file_url; // ❌ Expired!
window.open(url); // ❌ Will fail!

// DON'T: Store URL in database
await supabase
  .from('conversations')
  .update({ 
    file_url: 'https://...?token=xyz' // ❌ Will expire!
  });
```

### ✅ CORRECT Pattern

```typescript
// DO: Generate URL on-demand
const conversation = await service.getConversation(id);
const url = await service.getPresignedDownloadUrl(conversation.file_path);
window.open(url); // ✅ Fresh URL, valid for 1 hour

// DO: Store only paths in database
await supabase
  .from('conversations')
  .update({ 
    file_path: 'user-id/conv-id/conversation.json' // ✅ Never expires
  });
```

---

## API Usage Examples

### Example 1: Simple URL Generation

```typescript
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';

// Initialize service
const service = new ConversationStorageService(supabase);

// Get conversation (returns file_path, NOT file_url)
const conversation = await service.getConversation(conversationId);

// Generate fresh signed URL (valid for 1 hour)
const signedUrl = await service.getPresignedDownloadUrl(conversation.file_path);

// Use immediately
return signedUrl;
```

### Example 2: Convenience Method (Recommended)

```typescript
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';

const service = new ConversationStorageService(supabase);

// One-liner: Get conversation + generate URL + extract metadata
const downloadInfo = await service.getDownloadUrlForConversation(conversationId);

// Returns:
// {
//   conversation_id: "abc-123",
//   download_url: "https://...?token=xyz", // Fresh URL
//   filename: "conversation.json",
//   file_size: 12345,
//   expires_at: "2025-11-18T15:30:00Z",
//   expires_in_seconds: 3600
// }

return downloadInfo;
```

### Example 3: API Route Implementation

```typescript
// app/api/conversations/[conversation_id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const service = new ConversationStorageService(supabase);
    
    // Generate fresh download URL
    const downloadInfo = await service.getDownloadUrlForConversation(
      params.conversation_id
    );
    
    return NextResponse.json(downloadInfo);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Example 4: Frontend Usage

```typescript
// components/DownloadButton.tsx
'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  conversationId: string;
}

export function DownloadButton({ conversationId }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  
  async function handleDownload() {
    setLoading(true);
    try {
      // Call API endpoint to get fresh download URL
      const response = await fetch(
        `/api/conversations/${conversationId}/download`
      );
      
      if (!response.ok) throw new Error('Failed to get download URL');
      
      const downloadInfo = await response.json();
      
      // Open URL in new tab (valid for 1 hour)
      window.open(downloadInfo.download_url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download conversation');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Generating URL...' : 'Download'}
    </button>
  );
}
```

### Example 5: Raw Response Downloads

```typescript
const service = new ConversationStorageService(supabase);

// Get download URL for raw Claude API response
const rawDownloadInfo = await service.getRawResponseDownloadUrl(conversationId);

// Returns same structure as getDownloadUrlForConversation
// {
//   conversation_id: "abc-123",
//   download_url: "https://...?token=xyz",
//   filename: "abc-123.json",
//   file_size: 54321,
//   expires_at: "2025-11-18T15:30:00Z",
//   expires_in_seconds: 3600
// }
```

---

## Service Methods Reference

### `getConversation(conversationId: string)`

**Returns**: Conversation with `file_path` (NOT `file_url`)

```typescript
const conversation = await service.getConversation(conversationId);
// conversation.file_path: "user-id/conv-id/conversation.json"
// conversation.file_url: undefined (deprecated field)
```

### `getPresignedDownloadUrl(filePath: string)`

**Returns**: Fresh signed URL (valid for 1 hour)

```typescript
const url = await service.getPresignedDownloadUrl(conversation.file_path);
// url: "https://...storage.../sign/...?token=xyz"
// Valid for 3600 seconds (1 hour)
```

### `getDownloadUrlForConversation(conversationId: string)`

**Returns**: `ConversationDownloadResponse` with URL and metadata

```typescript
const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
// {
//   conversation_id: string,
//   download_url: string,       // Fresh URL
//   filename: string,
//   file_size: number | null,
//   expires_at: string,         // ISO timestamp
//   expires_in_seconds: 3600
// }
```

### `getRawResponseDownloadUrl(conversationId: string)`

**Returns**: Same as `getDownloadUrlForConversation` but for raw response file

```typescript
const rawDownloadInfo = await service.getRawResponseDownloadUrl(conversationId);
```

---

## Type Definitions

### `ConversationDownloadResponse`

```typescript
interface ConversationDownloadResponse {
  conversation_id: string;
  download_url: string;       // Signed URL, valid for 1 hour
  filename: string;           // Extracted from path
  file_size: number | null;   // File size in bytes
  expires_at: string;         // ISO timestamp when URL expires
  expires_in_seconds: number; // Always 3600 (1 hour)
}
```

### `StorageConversation`

```typescript
interface StorageConversation {
  id: string;
  conversation_id: string;
  
  // File storage - PATHS ONLY
  file_path: string | null;           // ✅ Permanent path
  raw_response_path: string | null;   // ✅ Permanent path
  file_size: number | null;
  
  // NOTE: file_url and raw_response_url are REMOVED from this type
  // They are deprecated and should never be used
  
  // ... other fields
}
```

---

## Common Patterns

### Pattern 1: Download Button

```typescript
// When user clicks "Download" button:
async function handleDownload(conversationId: string) {
  // Step 1: Get fresh download URL
  const response = await fetch(`/api/conversations/${conversationId}/download`);
  const downloadInfo = await response.json();
  
  // Step 2: Open URL immediately (valid for 1 hour)
  window.open(downloadInfo.download_url, '_blank');
}
```

### Pattern 2: Batch Download

```typescript
async function downloadMultipleConversations(conversationIds: string[]) {
  const downloadInfos = await Promise.all(
    conversationIds.map(id => 
      service.getDownloadUrlForConversation(id)
    )
  );
  
  // All URLs valid for 1 hour
  downloadInfos.forEach(info => {
    window.open(info.download_url, '_blank');
  });
}
```

### Pattern 3: Email Download Link

```typescript
async function emailDownloadLink(conversationId: string, userEmail: string) {
  // Generate fresh URL
  const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
  
  // Send email with URL
  await sendEmail({
    to: userEmail,
    subject: 'Your Conversation Download',
    body: `
      Download your conversation here:
      ${downloadInfo.download_url}
      
      This link expires at ${downloadInfo.expires_at} (in 1 hour).
    `
  });
}
```

### Pattern 4: Pre-signed Upload URLs

```typescript
// For uploads, you might also want on-demand URL generation
async function getUploadUrl(userId: string, conversationId: string) {
  const filePath = `${userId}/${conversationId}/conversation.json`;
  
  const { data, error } = await supabase.storage
    .from('conversation-files')
    .createSignedUploadUrl(filePath);
  
  if (error) throw error;
  
  return {
    upload_url: data.signedUrl,
    file_path: filePath,  // Store this in database
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
  };
}
```

---

## Migration Guide

### Step 1: Update Service Calls

**Before**:
```typescript
const conversation = await service.getConversation(id);
const url = conversation.file_url; // ❌
```

**After**:
```typescript
const downloadInfo = await service.getDownloadUrlForConversation(id);
const url = downloadInfo.download_url; // ✅
```

### Step 2: Update API Routes

**Before**:
```typescript
const conversation = await service.getConversation(id);
return NextResponse.json({ url: conversation.file_url });
```

**After**:
```typescript
const downloadInfo = await service.getDownloadUrlForConversation(id);
return NextResponse.json(downloadInfo);
```

### Step 3: Update Frontend Components

**Before**:
```typescript
const response = await fetch(`/api/conversations/${id}`);
const { file_url } = await response.json();
window.open(file_url);
```

**After**:
```typescript
const response = await fetch(`/api/conversations/${id}/download`);
const { download_url } = await response.json();
window.open(download_url);
```

---

## Safety Features

### Type Guard: `assertIsPath()`

Prevents accidental storage of signed URLs:

```typescript
// This will throw in development if you try to store a URL
this.assertIsPath(filePath, 'file_path');

// Example error:
// ❌ CRITICAL ERROR: Attempting to store signed URL in file_path!
// Signed URLs expire and must NOT be stored in the database.
```

### Development Validation

In development mode, the service will throw errors if you:
- Try to store a signed URL in the database
- Try to access deprecated `file_url` fields

This helps catch mistakes early before they reach production.

---

## Performance Considerations

### URL Generation Latency

- Each URL generation requires a Supabase API call
- Typical latency: 10-50ms
- For single downloads, this is negligible
- For batch downloads, consider parallel generation

### Example: Parallel Generation

```typescript
// Sequential (slow)
for (const id of conversationIds) {
  const url = await service.getDownloadUrlForConversation(id);
  urls.push(url);
}

// Parallel (fast)
const urls = await Promise.all(
  conversationIds.map(id => 
    service.getDownloadUrlForConversation(id)
  )
);
```

---

## Troubleshooting

### Issue: "URL has expired"

**Cause**: User tried to use a URL after 1 hour

**Solution**: Generate a new URL

```typescript
// URLs expire after 1 hour
// Always generate fresh URL when user needs to download
const downloadInfo = await service.getDownloadUrlForConversation(id);
```

### Issue: "File path is required"

**Cause**: Conversation has no `file_path` in database

**Solution**: Ensure file was uploaded and path was stored

```typescript
// Check if file_path exists
const conversation = await service.getConversation(id);
if (!conversation.file_path) {
  throw new Error('No file path for conversation');
}
```

### Issue: "Failed to generate presigned URL"

**Cause**: File doesn't exist in storage or permissions issue

**Solution**: Verify file exists and Supabase credentials are correct

```typescript
// Verify file exists
const { data, error } = await supabase.storage
  .from('conversation-files')
  .list(path);
```

---

## Best Practices

### ✅ DO:
- Generate URLs on-demand when user needs to download
- Store only file paths in the database
- Use convenience methods (`getDownloadUrlForConversation`)
- Return complete `ConversationDownloadResponse` from APIs
- Document expiration time to users

### ❌ DON'T:
- Store signed URLs in the database
- Cache URLs for more than 1 hour
- Use deprecated `file_url` fields
- Assume URLs will work indefinitely
- Generate URLs "just in case" (only when needed)

---

## Testing

### Manual Test

```bash
# Run the test script
ts-node src/scripts/test-url-generation.ts <conversation_id>
```

### What the Test Verifies

- ✅ `getConversation()` returns `file_path` (not `file_url`)
- ✅ `getPresignedDownloadUrl()` generates fresh URLs
- ✅ Each URL is unique (different tokens)
- ✅ `getDownloadUrlForConversation()` works correctly
- ✅ URLs expire in 1 hour (3600 seconds)
- ✅ URLs are accessible and return valid JSON

---

## Further Reading

- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/signed-urls)
- [ConversationStorageService Source](../src/lib/services/conversation-storage-service.ts)
- [Implementation Summary](../PROMPT3_FILE1_V2_IMPLEMENTATION_SUMMARY.md)
- [URL Deprecation Quick Start](../QUICK_START_URL_DEPRECATION.md)

---

## Support

If you encounter issues or have questions:

1. Check this guide first
2. Run the test script to verify your setup
3. Check the implementation summary for technical details
4. Review the service source code comments

**Remember**: Always generate URLs on-demand, never store them! 🚀

