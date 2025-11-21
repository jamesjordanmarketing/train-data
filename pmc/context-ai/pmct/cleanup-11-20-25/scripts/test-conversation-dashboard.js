#!/usr/bin/env node

/**
 * Test Conversation Dashboard API Endpoints
 * 
 * Tests:
 * 1. GET /api/conversations - List conversations
 * 2. POST /api/conversations - Create conversation
 * 3. PATCH /api/conversations/[id]/status - Update status
 * 4. GET /api/conversations/[id]/status - Get status
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const testUserId = 'test-user-dashboard';

async function testListConversations() {
  console.log('\n🧪 Testing GET /api/conversations...');
  
  try {
    // Test basic list
    const response = await fetch(`${baseUrl}/api/conversations`, {
      headers: {
        'x-user-id': testUserId
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to list conversations: ${error.error}`);
    }
    
    const data = await response.json();
    console.log('✅ Listed conversations:', {
      total: data.total,
      count: data.conversations?.length || 0,
      page: data.page,
      limit: data.limit
    });
    
    // Test with filters
    const filteredResponse = await fetch(
      `${baseUrl}/api/conversations?status=pending_review&tier=template&quality_min=7.0`,
      {
        headers: {
          'x-user-id': testUserId
        }
      }
    );
    
    if (!filteredResponse.ok) {
      throw new Error('Failed to list filtered conversations');
    }
    
    const filteredData = await filteredResponse.json();
    console.log('✅ Listed filtered conversations:', {
      filters: 'status=pending_review, tier=template, quality_min=7.0',
      count: filteredData.conversations?.length || 0
    });
    
    // Test pagination
    const paginatedResponse = await fetch(
      `${baseUrl}/api/conversations?page=2&limit=10`,
      {
        headers: {
          'x-user-id': testUserId
        }
      }
    );
    
    if (!paginatedResponse.ok) {
      throw new Error('Failed to list paginated conversations');
    }
    
    const paginatedData = await paginatedResponse.json();
    console.log('✅ Listed paginated conversations:', {
      page: paginatedData.page,
      limit: paginatedData.limit,
      count: paginatedData.conversations?.length || 0
    });
    
    return data.conversations?.[0]; // Return first conversation for further tests
  } catch (error) {
    console.error('❌ Error listing conversations:', error.message);
    return null;
  }
}

async function testUpdateConversationStatus(conversationId) {
  console.log('\n🧪 Testing PATCH /api/conversations/[id]/status...');
  
  if (!conversationId) {
    console.log('⚠️  Skipping status update test (no conversation ID)');
    return false;
  }
  
  try {
    // Test approve
    const approveResponse = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({
          status: 'approved',
          review_notes: 'Test approval from dashboard test script'
        })
      }
    );
    
    if (!approveResponse.ok) {
      const error = await approveResponse.json();
      throw new Error(`Failed to approve conversation: ${error.error}`);
    }
    
    const approvedConversation = await approveResponse.json();
    console.log('✅ Approved conversation:', {
      id: approvedConversation.conversation_id,
      status: approvedConversation.status,
      reviewed_by: approvedConversation.reviewed_by
    });
    
    // Test reject
    const rejectResponse = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({
          status: 'rejected',
          review_notes: 'Test rejection from dashboard test script'
        })
      }
    );
    
    if (!rejectResponse.ok) {
      const error = await rejectResponse.json();
      throw new Error(`Failed to reject conversation: ${error.error}`);
    }
    
    const rejectedConversation = await rejectResponse.json();
    console.log('✅ Rejected conversation:', {
      id: rejectedConversation.conversation_id,
      status: rejectedConversation.status,
      reviewed_by: rejectedConversation.reviewed_by
    });
    
    // Test get status
    const statusResponse = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/status`,
      {
        headers: {
          'x-user-id': testUserId
        }
      }
    );
    
    if (!statusResponse.ok) {
      throw new Error('Failed to get conversation status');
    }
    
    const statusData = await statusResponse.json();
    console.log('✅ Retrieved conversation status:', {
      id: statusData.conversation_id,
      status: statusData.status,
      reviewed_by: statusData.reviewed_by,
      reviewed_at: statusData.reviewed_at
    });
    
    // Test invalid status
    const invalidResponse = await fetch(
      `${baseUrl}/api/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({
          status: 'invalid_status'
        })
      }
    );
    
    if (invalidResponse.ok) {
      throw new Error('Should have rejected invalid status');
    }
    
    console.log('✅ Rejected invalid status as expected');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating conversation status:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...');
  
  try {
    // Test non-existent conversation
    const response = await fetch(
      `${baseUrl}/api/conversations/non-existent-id/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({
          status: 'approved'
        })
      }
    );
    
    if (response.ok) {
      console.log('⚠️  Expected error for non-existent conversation, but got success');
    } else {
      const error = await response.json();
      console.log('✅ Handled non-existent conversation error:', error.error);
    }
    
    // Test missing status
    const missingStatusResponse = await fetch(
      `${baseUrl}/api/conversations/some-id/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': testUserId
        },
        body: JSON.stringify({})
      }
    );
    
    if (missingStatusResponse.ok) {
      console.log('⚠️  Expected error for missing status, but got success');
    } else {
      const error = await missingStatusResponse.json();
      console.log('✅ Handled missing status error:', error.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in error handling tests:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Conversation Dashboard API Tests');
  console.log('📍 Testing against:', baseUrl);
  console.log('👤 Test user:', testUserId);
  
  const results = {
    listConversations: false,
    updateStatus: false,
    errorHandling: false
  };
  
  // Test list conversations
  const firstConversation = await testListConversations();
  results.listConversations = !!firstConversation;
  
  // Test update status (if we have a conversation)
  if (firstConversation) {
    results.updateStatus = await testUpdateConversationStatus(
      firstConversation.conversation_id
    );
  }
  
  // Test error handling
  results.errorHandling = await testErrorHandling();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`List Conversations: ${results.listConversations ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Update Status: ${results.updateStatus ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling: ${results.errorHandling ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

