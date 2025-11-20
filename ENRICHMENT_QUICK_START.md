git # Enrichment Service Quick Start Guide

**Purpose:** Get the Conversation Enrichment Service running in under 5 minutes  
**Last Updated:** November 20, 2025

---

## Prerequisites

✅ Node.js 18+ installed  
✅ Supabase project set up  
✅ Environment variables configured

---

## Step 1: Verify Environment Variables

Check that you have these set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**Quick test:**
```bash
# This should print your Supabase URL
echo $NEXT_PUBLIC_SUPABASE_URL
```

If empty, create `.env.local` with the above variables.

---

## Step 2: Install Dependencies

```bash
npm install
```

Required packages (should already be installed):
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variable loading
- `tsx` - TypeScript execution

---

## Step 3: Apply Database Migration

Ensure the enrichment tracking migration is applied:

```bash
# Check if migration exists
ls supabase/migrations/20251120_add_enrichment_tracking.sql

# If using Supabase CLI:
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

The migration adds these columns to `conversations`:
- `enrichment_status`
- `validation_report`
- `enriched_file_path`
- `enriched_file_size`
- `enriched_at`
- `enrichment_version`
- `enrichment_error`

---

## Step 4: Setup Test Conversation

Run the setup script to create a test conversation in the database:

```bash
npx tsx setup-test-conversation.ts
```

**Expected output:**
```
=== Setting Up Test Conversation ===

1. Checking if test conversation exists...
2. Creating/updating conversation record...
   ✅ Conversation created/updated: test-conv-001
3. Checking for scaffolding data...
   ✅ Found persona: Marcus Thompson
   ✅ Found emotional arc: shame_to_relief
   ✅ Found training topic: debt_management
   ✅ Found template: emotional_disclosure
4. Creating raw response file in storage...
   ✅ Raw response file created at raw/test-user-001/test-conv-001.json

✅ Setup Complete!

Test conversation details:
  Conversation ID: test-conv-001
  User ID: test-user-001
  Quality Score: 3.5
  Turn Count: 4

You can now run: npx tsx test-enrichment.ts
```

---

## Step 5: Run Enrichment Test

Execute the enrichment test script:

```bash
npx tsx test-enrichment.ts
```

**Expected output:**
```
=== TEST: Enrichment Service ===

[Enrichment] Starting enrichment for conversation test-conv-001
[Enrichment] Fetching database metadata for test-conv-001
[Enrichment] ✅ Database metadata fetched
[Enrichment] ✅ Enrichment complete: 4 training pairs created

✅ Enrichment Results:
Dataset Name: fp_conversation_test-conv-001
Version: 1.0.0
Quality Tier: production
Total Turns: 4

Consultant: Elena Morales, CFP
Business: Pathways Financial Planning

Training Pairs: 4

First Training Pair:
  ID: fp_conversation_turn1
  Turn: 1
  Current User Input: I don't even know where to start... I'm so embarra...
  Valence: negative
  Difficulty: intermediate_conversation_turn_1
  Quality Score: 4
  Quality Breakdown:
    Empathy: 3.8
    Clarity: 3.6
    Appropriateness: 3.5
    Brand Voice: 3.7

=== TEST: Storage Integration ===
[Storage] ✅ Enriched file stored at test-user-001/test-conv-001/enriched.json
✅ Enriched conversation stored:
  Path: test-user-001/test-conv-001/enriched.json
  Size: 4523 bytes
```

---

## Step 6: Verify Results

### Check Supabase Storage

1. Go to Supabase Dashboard > Storage > `conversation-files` bucket
2. Navigate to `test-user-001/test-conv-001/`
3. You should see `enriched.json`
4. Download and inspect the file

### Check Database Record

```sql
SELECT 
  conversation_id,
  enrichment_status,
  enriched_file_path,
  enriched_file_size,
  enriched_at
FROM conversations
WHERE conversation_id = 'test-conv-001';
```

**Expected result:**
```
conversation_id  | test-conv-001
enrichment_status| enriched
enriched_file_path| test-user-001/test-conv-001/enriched.json
enriched_file_size| 4523
enriched_at      | 2025-11-20T12:34:56.789Z
```

---

## Troubleshooting

### Error: "Missing environment variables"

**Fix:** Create `.env.local` with your Supabase credentials.

```bash
# Copy from .env.example if available
cp .env.example .env.local

# Or create manually
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

### Error: "Failed to fetch conversation: Not found"

**Fix:** Run the setup script first:

```bash
npx tsx setup-test-conversation.ts
```

### Error: "column 'enrichment_status' does not exist"

**Fix:** Apply the migration:

```bash
supabase db push
# OR manually run: supabase/migrations/20251120_add_enrichment_tracking.sql
```

### Error: "tsx: command not found"

**Fix:** Install tsx globally or use npx:

```bash
npm install -g tsx
# OR use npx (which comes with npm)
npx tsx test-enrichment.ts
```

### Error: "Storage upload failed"

**Fix:** Check storage bucket exists and is accessible:

1. Go to Supabase Dashboard > Storage
2. Ensure `conversation-files` bucket exists
3. Check bucket permissions allow service role access

### Warning: "No personas found in database"

**Effect:** Enrichment will still work, but client_background will use defaults.

**Fix (optional):** Load seed data:

```bash
# If seed data files exist
node scripts/load-seed-data.js

# Or create manually via Supabase Dashboard
```

---

## Usage in Production

### Basic Usage

```typescript
import { getEnrichmentService } from './src/lib/services/conversation-enrichment-service';
import { getConversationStorageService } from './src/lib/services/conversation-storage-service';

// 1. Get services
const enrichmentService = getEnrichmentService();
const storageService = getConversationStorageService();

// 2. Enrich conversation
const conversationId = 'abc-123-def-456';
const minimalJson = {
  conversation_metadata: {
    client_persona: "Client Name - Archetype",
    session_context: "Context description",
    conversation_phase: "phase_name",
    expected_outcome: "Expected outcome"
  },
  turns: [
    // ... turns array
  ]
};

const enriched = await enrichmentService.enrichConversation(
  conversationId,
  minimalJson
);

// 3. Store enriched data
const result = await storageService.storeEnrichedConversation(
  conversationId,
  userId,
  enriched
);

console.log(`Stored at: ${result.enrichedPath}`);
```

### With Error Handling

```typescript
try {
  const enriched = await enrichmentService.enrichConversation(
    conversationId,
    minimalJson
  );
  
  const result = await storageService.storeEnrichedConversation(
    conversationId,
    userId,
    enriched
  );
  
  if (result.success) {
    console.log('✅ Enrichment complete');
  } else {
    console.error('❌ Storage failed:', result.error);
  }
} catch (error) {
  console.error('❌ Enrichment failed:', error);
  // Handle error (e.g., update enrichment_status to 'failed')
}
```

---

## API Integration Example

```typescript
// In your Next.js API route: /api/conversations/[id]/enrich
import { NextRequest, NextResponse } from 'next/server';
import { getEnrichmentService } from '@/lib/services/conversation-enrichment-service';
import { getConversationStorageService } from '@/lib/services/conversation-storage-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { minimalJson } = await request.json();
    const conversationId = params.id;
    const userId = request.headers.get('x-user-id') || 'system';
    
    // Enrich
    const enrichmentService = getEnrichmentService();
    const enriched = await enrichmentService.enrichConversation(
      conversationId,
      minimalJson
    );
    
    // Store
    const storageService = getConversationStorageService();
    const result = await storageService.storeEnrichedConversation(
      conversationId,
      userId,
      enriched
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Enrichment complete',
      enrichedPath: result.enrichedPath,
      enrichedSize: result.enrichedSize,
      trainingPairsCount: enriched.training_pairs.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enrichment failed' },
      { status: 500 }
    );
  }
}
```

---

## Next Steps

After verifying the enrichment service works:

1. **Integrate with Validation Service:**
   - Run validation before enrichment
   - Only enrich if validation passes

2. **Add to Pipeline:**
   - Hook into conversation generation flow
   - Auto-enrich after Claude generates conversations

3. **Batch Processing:**
   - Enrich multiple conversations in parallel
   - Add progress tracking

4. **Monitoring:**
   - Track enrichment success/failure rates
   - Monitor enrichment duration
   - Alert on failures

5. **Normalization Service (Prompt 3):**
   - Implement normalization after enrichment
   - Standardize formats
   - Validate data quality

---

## File Locations

- **Service:** `src/lib/services/conversation-enrichment-service.ts`
- **Types:** `src/lib/types/conversations.ts`
- **Storage:** `src/lib/services/conversation-storage-service.ts`
- **Test:** `test-enrichment.ts`
- **Setup:** `setup-test-conversation.ts`
- **Migration:** `supabase/migrations/20251120_add_enrichment_tracking.sql`

---

## Support

For issues or questions:
1. Check [ENRICHMENT_IMPLEMENTATION_SUMMARY.md](./ENRICHMENT_IMPLEMENTATION_SUMMARY.md) for detailed documentation
2. Review test output for error messages
3. Check Supabase Dashboard for database/storage issues
4. Refer to source prompt: `pmc/product/_mapping/unique/cat-to-conv-P01/06-cat-to-conv-file-filling-execution-prompts-E01_v2.md`

---

**Status:** ✅ Ready for Testing  
**Estimated Setup Time:** 5 minutes  
**Estimated Test Time:** 2 minutes

