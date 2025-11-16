# Conversation Dashboard - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly get the Conversation Management Dashboard up and running.

---

## Prerequisites

✅ **Completed Prompts**:
- Prompt 2: Database setup complete
- Prompt 3: ConversationStorageService implemented

✅ **Environment Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

✅ **Dependencies Installed**:
```bash
npm install
```

---

## 1. Verify Setup

Check that the required database table exists:

```bash
# Run this SQL in Supabase SQL Editor
SELECT COUNT(*) FROM conversation_storage;
```

If the table doesn't exist, run the setup script:
```bash
node scripts/setup-conversation-storage-db.js
```

---

## 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 3. Navigate to Dashboard

Open your browser and go to:
```
http://localhost:3000/conversations
```

You should see the Conversation Management Dashboard!

---

## 4. Test Basic Functionality

### View Conversations
- The table should load conversations from your database
- If empty, you'll see "No conversations found"

### Filter Conversations
- Use the status dropdown: `Pending Review`, `Approved`, `Rejected`, `Archived`
- Use the tier dropdown: `Template`, `Scenario`, `Edge Case`
- Use the quality dropdown: `8.0+`, `7.0+`, `6.0+`

### View Conversation Details
- Click "View" button on any conversation
- Modal opens with full details
- Click "Download JSON File" to get the conversation file

### Update Status
- Click "Approve" or "Reject" on pending conversations
- Status badge updates immediately
- Table refreshes to show new status

### Bulk Selection
- Check individual conversations
- "Export Selected" button appears
- Shows count of selected items

### Pagination
- Click "Next" to see more conversations
- Click "Previous" to go back
- Shows current range and total count

---

## 5. Test API Endpoints

Run the test script:
```bash
node scripts/test-conversation-dashboard.js
```

Expected output:
```
🚀 Starting Conversation Dashboard API Tests
📍 Testing against: http://localhost:3000
👤 Test user: test-user-dashboard

🧪 Testing GET /api/conversations...
✅ Listed conversations: { total: 10, count: 10, page: 1, limit: 25 }
✅ Listed filtered conversations: { filters: '...', count: 5 }
✅ Listed paginated conversations: { page: 2, limit: 10, count: 0 }

🧪 Testing PATCH /api/conversations/[id]/status...
✅ Approved conversation: { id: 'conv-123', status: 'approved', reviewed_by: 'test-user' }
✅ Rejected conversation: { id: 'conv-123', status: 'rejected', reviewed_by: 'test-user' }
✅ Retrieved conversation status: { id: 'conv-123', status: 'rejected', ... }
✅ Rejected invalid status as expected

🧪 Testing error handling...
✅ Handled non-existent conversation error: ...
✅ Handled missing status error: ...

==================================================
📊 Test Summary
==================================================
List Conversations: ✅ PASS
Update Status: ✅ PASS
Error Handling: ✅ PASS
==================================================

🎉 All tests passed!
```

---

## 6. Create Test Data (Optional)

If you need test conversations, use the storage service:

```javascript
// scripts/create-test-conversations.js
const { conversationStorageService } = require('../src/lib/services/conversation-storage-service');

async function createTestConversation() {
  const testConversation = {
    conversation_id: 'test-conv-001',
    persona_id: 'persona-1',
    emotional_arc_id: 'arc-1',
    file_content: {
      dataset_metadata: {
        dataset_name: "Test Dataset",
        version: "1.0.0",
        created_date: new Date().toISOString(),
        vertical: "test",
        consultant_persona: "test-persona",
        target_use: "testing",
        conversation_source: "test",
        quality_tier: "template",
        total_conversations: 1,
        total_turns: 5,
        notes: "Test conversation"
      },
      consultant_profile: {
        name: "Test Consultant",
        business: "Test Business",
        expertise: "Testing",
        years_experience: 5,
        core_philosophy: {},
        communication_style: {
          tone: "professional",
          techniques: [],
          avoid: []
        }
      },
      training_pairs: []
    },
    created_by: 'test-user'
  };

  const created = await conversationStorageService.createConversation(testConversation);
  console.log('Created test conversation:', created.conversation_id);
}

createTestConversation();
```

Run it:
```bash
node scripts/create-test-conversations.js
```

---

## 7. Common Issues & Solutions

### Issue: "No conversations found"

**Solution 1**: Check database connection
```bash
# Verify Supabase connection
node -e "const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); client.from('conversation_storage').select('count').then(console.log);"
```

**Solution 2**: Create test data (see step 6 above)

**Solution 3**: Check API endpoint
```bash
curl http://localhost:3000/api/conversations
```

### Issue: Status update doesn't work

**Solution**: Check browser console for errors
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages
- Check Network tab for failed requests

### Issue: Page loads slowly

**Solution**: Check pagination limit
```javascript
// In page.tsx, line 30
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,  // Reduce from 25 to 10
  total: 0
});
```

---

## 8. API Endpoint Reference

### List Conversations
```bash
GET /api/conversations?page=1&limit=25&status=pending_review&tier=template&quality_min=7.0
```

### Create Conversation
```bash
POST /api/conversations
Content-Type: application/json

{
  "conversation_id": "conv-new",
  "file_content": {...},
  "created_by": "user-123"
}
```

### Update Status
```bash
PATCH /api/conversations/conv-123/status
Content-Type: application/json

{
  "status": "approved",
  "review_notes": "Looks good!"
}
```

### Get Status
```bash
GET /api/conversations/conv-123/status
```

---

## 9. Development Tips

### Hot Reload
- Changes to UI components auto-reload
- Changes to API routes require manual refresh

### TypeScript Types
```typescript
import type { StorageConversation } from '@/lib/types/conversations';

const conversation: StorageConversation = {...};
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/conversations');
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
  }
  const data = await response.json();
} catch (error) {
  console.error('Network Error:', error);
}
```

### Debugging
```typescript
// Add console.logs to track data flow
console.log('Loading conversations...', { filters, pagination });
console.log('Response:', data);
console.log('Conversations:', conversations);
```

---

## 10. Next Steps

Once the dashboard is working:

1. ✅ **Test all features** (see section 4)
2. ✅ **Run test suite** (see section 5)
3. ✅ **Review UI/UX** with stakeholders
4. 🔲 **Implement authentication** (replace x-user-id header)
5. 🔲 **Add export functionality** (implement "Export Selected")
6. 🔲 **Performance optimization** (caching, lazy loading)
7. 🔲 **Deploy to staging** environment

---

## 11. Helpful Commands

```bash
# Start dev server
npm run dev

# Run tests
node scripts/test-conversation-dashboard.js

# Check linter
npm run lint

# Build for production
npm run build

# Start production server
npm start

# View Supabase logs
# (In Supabase Dashboard > Logs)
```

---

## 12. Support & Resources

### Documentation:
- 📄 `PROMPT4_FILE1_V3_IMPLEMENTATION_SUMMARY.md` - Full implementation details
- 📄 `CONVERSATION_STORAGE_SERVICE_IMPLEMENTATION_SUMMARY.md` - Storage service docs
- 📄 `CONVERSATION_STORAGE_QUICK_START.md` - Storage setup guide

### Code Files:
- 🗂️ `src/app/api/conversations/route.ts` - List/Create API
- 🗂️ `src/app/api/conversations/[id]/status/route.ts` - Status API
- 🗂️ `src/app/(dashboard)/conversations/page.tsx` - Dashboard UI
- 🗂️ `src/lib/types/conversations.ts` - Type definitions
- 🗂️ `src/lib/services/conversation-storage-service.ts` - Storage service

### External Resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 You're Ready!

The Conversation Management Dashboard is now set up and ready to use. Navigate to `/conversations` and start managing your training data!

If you encounter any issues, check the troubleshooting section or review the full implementation summary.

---

*Last Updated: November 16, 2025*  
*Version: 1.0.0*  
*Status: Production Ready (pending auth integration)*

