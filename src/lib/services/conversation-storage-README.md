# Conversation Storage Service

## Overview

The **Conversation Storage Service** manages the complete lifecycle of generated LoRA training conversations:
- **File Storage**: JSON files stored in Supabase Storage bucket `conversation-files`
- **Metadata**: Conversation metadata stored in PostgreSQL `conversations` table
- **Turns**: Individual conversation turns stored in `conversation_turns` table for querying
- **Workflow**: Status management (pending_review → approved/rejected → archived)

## Architecture

### Dual-Storage Pattern
- **Large Files**: Conversation JSON files stored in Supabase Storage (scalable, cost-effective)
- **Queryable Metadata**: Searchable fields in PostgreSQL (fast filtering, indexing)
- **Atomic Operations**: File upload + metadata insert in single transaction with rollback

### File Organization
```
conversation-files/
  {user_id}/
    {conversation_id}/
      conversation.json
```

## Usage

### Import Service

```typescript
import { conversationStorageService } from '@/lib/services/conversation-storage-service';
// or
import ConversationStorageService from '@/lib/services/conversation-storage-service';
const service = new ConversationStorageService();
```

### Create Conversation

```typescript
const conversation = await conversationStorageService.createConversation({
  conversation_id: 'conv-001',
  persona_id: 'uuid-persona',
  emotional_arc_id: 'uuid-arc',
  training_topic_id: 'uuid-topic',
  conversation_name: 'Business Strategy Session',
  file_content: conversationJSONData, // ConversationJSONFile object or JSON string
  created_by: userId
});

// Returns StorageConversation with:
// - id (database UUID)
// - conversation_id (unique identifier)
// - file_url (Supabase Storage URL)
// - quality_score, empathy_score, etc.
// - status ('pending_review')
// - created_at, updated_at
```

**What happens:**
1. Parses conversation JSON content
2. Uploads file to Supabase Storage: `{userId}/{conversationId}/conversation.json`
3. Extracts metadata (quality scores, emotions, turn count)
4. Inserts metadata into `conversations` table
5. Extracts and inserts turns into `conversation_turns` table
6. **Rollback**: If metadata insert fails, uploaded file is deleted

### Get Conversation

```typescript
// By conversation_id
const conversation = await conversationStorageService.getConversation('conv-001');

// By database ID
const conversation = await conversationStorageService.getConversationById('uuid');

// Returns StorageConversation or null
```

### List Conversations

```typescript
const result = await conversationStorageService.listConversations(
  // Filters (optional)
  {
    status: 'pending_review',
    tier: 'template',
    persona_id: 'uuid',
    emotional_arc_id: 'uuid',
    training_topic_id: 'uuid',
    created_by: userId,
    quality_min: 7.0,
    quality_max: 10.0
  },
  // Pagination (optional)
  {
    page: 1,
    limit: 25,
    sortBy: 'created_at',
    sortDirection: 'desc'
  }
);

// Returns: { conversations, total, page, limit, totalPages }
```

### Get Conversation Turns

```typescript
const turns = await conversationStorageService.getConversationTurns('conv-001');

// Returns array of StorageConversationTurn:
// [
//   {
//     id, conversation_id, turn_number, role, content,
//     detected_emotion, emotion_confidence, emotional_intensity,
//     primary_strategy, tone, word_count, sentence_count
//   }
// ]
```

### Update Conversation Status

```typescript
const updated = await conversationStorageService.updateConversationStatus(
  'conv-001',
  'approved', // or 'rejected', 'archived'
  reviewerId,
  'High quality conversation, approved for training'
);

// Automatically sets:
// - reviewed_by = reviewerId
// - reviewed_at = NOW()
// - review_notes = notes
// - updated_at = NOW()
```

### Download Conversation File

```typescript
// By file path
const fileContent = await conversationStorageService.downloadConversationFile(
  'user123/conv-001/conversation.json'
);

// By conversation_id
const fileContent = await conversationStorageService.downloadConversationFileById('conv-001');

// Returns ConversationJSONFile object:
// {
//   dataset_metadata: { ... },
//   consultant_profile: { ... },
//   training_pairs: [ ... ]
// }
```

### Update Conversation Metadata

```typescript
const updated = await conversationStorageService.updateConversation('conv-001', {
  conversation_name: 'Updated Name',
  quality_score: 9.5,
  category: 'business_strategy'
});
```

### Delete Conversation

```typescript
// Soft delete (default) - sets is_active = false
await conversationStorageService.deleteConversation('conv-001', false);

// Hard delete - removes file from storage + deletes database record
await conversationStorageService.deleteConversation('conv-001', true);
```

### Count Conversations

```typescript
// Count all active conversations
const total = await conversationStorageService.countConversations();

// Count with filters
const approved = await conversationStorageService.countConversations({
  status: 'approved',
  tier: 'template'
});
```

## Types

### StorageConversation

```typescript
interface StorageConversation {
  id: string;
  conversation_id: string;
  
  // Scaffolding references
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;
  
  // Metadata
  conversation_name: string | null;
  turn_count: number;
  tier: 'template' | 'scenario' | 'edge_case';
  
  // Quality scores
  quality_score: number | null; // 0-10
  empathy_score: number | null;
  clarity_score: number | null;
  appropriateness_score: number | null;
  brand_voice_alignment: number | null;
  
  // Status
  status: 'pending_review' | 'approved' | 'rejected' | 'archived';
  processing_status: 'queued' | 'processing' | 'completed' | 'failed';
  
  // File storage
  file_url: string | null;
  file_size: number | null;
  file_path: string | null;
  
  // Emotional progression
  starting_emotion: string | null;
  ending_emotion: string | null;
  
  // Audit
  created_by: string | null;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  
  // ... more fields
}
```

### ConversationJSONFile

```typescript
interface ConversationJSONFile {
  dataset_metadata: {
    dataset_name: string;
    version: string;
    quality_tier: string;
    total_turns: number;
    // ...
  };
  consultant_profile: {
    name: string;
    expertise: string;
    // ...
  };
  training_pairs: Array<{
    id: string;
    turn_number: number;
    target_response: string;
    emotional_context: any;
    response_strategy: any;
    training_metadata: any;
    // ...
  }>;
}
```

## Integration with SAOL

The service uses **Supabase Agent Ops Library (SAOL)** for database operations when available:

- `agentImportTool()` - Insert conversation metadata
- `agentQuery()` - Query conversations with filters
- `agentCount()` - Count conversations
- `agentDelete()` - Delete conversations

**Fallback**: If SAOL is not available (client-side), the service falls back to direct Supabase client operations.

## Error Handling

### Atomic Rollback

If conversation creation fails after file upload, the service automatically deletes the uploaded file:

```typescript
try {
  // Upload file ✓
  // Insert metadata ✗ (fails)
  // → File is automatically deleted (rollback)
} catch (error) {
  // File has been cleaned up
  throw error;
}
```

### Common Errors

- **File upload failed**: Check Supabase Storage bucket exists and RLS policies allow upload
- **Metadata insert failed**: Check database schema and foreign key references
- **Conversation not found**: Returns `null` for get operations, throws for update/delete

## Testing

Run validation tests:

```bash
# Prerequisite: Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Run tests
node scripts/test-conversation-storage.js
```

Tests validate:
1. Create conversation (atomic file + metadata)
2. Get conversation
3. Get conversation turns
4. List conversations with filters
5. Download conversation file
6. Update conversation status
7. Count conversations
8. Soft delete
9. Hard delete

## Database Schema

### conversations table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(100) UNIQUE NOT NULL,
  persona_id UUID REFERENCES personas(id),
  emotional_arc_id UUID REFERENCES emotional_arcs(id),
  training_topic_id UUID REFERENCES training_topics(id),
  template_id UUID REFERENCES prompt_templates(id),
  conversation_name VARCHAR(255),
  turn_count INTEGER NOT NULL,
  tier VARCHAR(50) DEFAULT 'template',
  quality_score NUMERIC(3,1),
  status VARCHAR(50) DEFAULT 'pending_review',
  file_url TEXT,
  file_path TEXT,
  storage_bucket VARCHAR(100) DEFAULT 'conversation-files',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### conversation_turns table

```sql
CREATE TABLE conversation_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  detected_emotion VARCHAR(100),
  primary_strategy VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Next Steps

After implementing the service:

1. **UI Integration** - Connect `/conversations` page to service
2. **API Routes** - Create Next.js API routes wrapping service methods
3. **Export Integration** - Add bulk export functionality for approved conversations
4. **Background Jobs** - Implement file cleanup for expired/rejected conversations
5. **Metrics** - Add monitoring for storage usage and query performance

## Related Documentation

- **SAOL Quick Start**: `supa-agent-ops/saol-agent-quick-start-guide_v1.md`
- **Database Setup**: `scripts/setup-conversation-storage-db.js`
- **Storage Setup**: `scripts/setup-conversation-storage-bucket.js`
- **Type Definitions**: `src/lib/types/conversations.ts`

