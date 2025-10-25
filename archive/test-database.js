// Test script to verify if document choices are being saved to Supabase
const { createClient } = require('@supabase/supabase-js');

// Import Supabase configuration
const { projectId, publicAnonKey } = require('./src/utils/supabase/info.tsx');

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection and Data Saving...');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Check if tables exist
    console.log('\n1. Checking if required tables exist...');
    
    const tables = ['documents', 'workflow_sessions', 'categories', 'tags', 'tag_dimensions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': EXISTS (${data.length} sample records)`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    // Test 2: Check existing workflow sessions
    console.log('\n2. Checking existing workflow sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('workflow_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (sessionsError) {
      console.log(`❌ Error fetching workflow sessions: ${sessionsError.message}`);
    } else {
      console.log(`✅ Found ${sessions.length} workflow sessions`);
      if (sessions.length > 0) {
        console.log('   Recent sessions:');
        sessions.forEach((session, index) => {
          console.log(`   ${index + 1}. ID: ${session.id}, Step: ${session.step}, Draft: ${session.is_draft}, Created: ${new Date(session.created_at).toLocaleString()}`);
        });
      }
    }
    
    // Test 3: Test creating a new workflow session (simulating app behavior)
    console.log('\n3. Testing workflow session creation...');
    
    // First, get a document to work with
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
      
    if (docsError || !documents || documents.length === 0) {
      console.log('❌ No documents found. Creating a test document first...');
      
      const { data: newDoc, error: createDocError } = await supabase
        .from('documents')
        .insert({
          title: 'Test Document for Workflow',
          content: 'This is a test document to verify workflow session creation.',
          summary: 'Test document summary',
          status: 'pending'
        })
        .select()
        .single();
        
      if (createDocError) {
        console.log(`❌ Failed to create test document: ${createDocError.message}`);
        return;
      } else {
        console.log(`✅ Created test document: ${newDoc.id}`);
        documents[0] = newDoc;
      }
    }
    
    const testDocument = documents[0];
    console.log(`   Using document: ${testDocument.title} (ID: ${testDocument.id})`);
    
    // Create a test workflow session
    const testWorkflowData = {
      document_id: testDocument.id,
      step: 'A',
      belonging_rating: 8,
      is_draft: true,
      completed_steps: ['A'],
      selected_tags: {
        'authorship': ['team_member'],
        'content_format': ['document'],
        'disclosure_risk': ['level_1'],
        'intended_use': ['training']
      },
      custom_tags: ['test-tag', 'verification']
    };
    
    const { data: newSession, error: createError } = await supabase
      .from('workflow_sessions')
      .insert(testWorkflowData)
      .select()
      .single();
      
    if (createError) {
      console.log(`❌ Failed to create workflow session: ${createError.message}`);
      console.log('   This suggests the app is NOT saving to the database.');
    } else {
      console.log(`✅ Successfully created workflow session: ${newSession.id}`);
      console.log('   Data saved:', JSON.stringify(newSession, null, 2));
      
      // Test 4: Update the workflow session (simulating step progression)
      console.log('\n4. Testing workflow session update...');
      
      const { data: updatedSession, error: updateError } = await supabase
        .from('workflow_sessions')
        .update({
          step: 'B',
          belonging_rating: 9,
          completed_steps: ['A', 'B']
        })
        .eq('id', newSession.id)
        .select()
        .single();
        
      if (updateError) {
        console.log(`❌ Failed to update workflow session: ${updateError.message}`);
      } else {
        console.log(`✅ Successfully updated workflow session`);
        console.log('   Updated data:', JSON.stringify(updatedSession, null, 2));
      }
      
      // Test 5: Mark as completed
      console.log('\n5. Testing workflow completion...');
      
      const { data: completedSession, error: completeError } = await supabase
        .from('workflow_sessions')
        .update({
          step: 'complete',
          is_draft: false,
          completed_at: new Date().toISOString(),
          completed_steps: ['A', 'B', 'C']
        })
        .eq('id', newSession.id)
        .select()
        .single();
        
      if (completeError) {
        console.log(`❌ Failed to complete workflow session: ${completeError.message}`);
      } else {
        console.log(`✅ Successfully completed workflow session`);
        console.log('   Final data:', JSON.stringify(completedSession, null, 2));
      }
      
      // Clean up test data
      console.log('\n6. Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('workflow_sessions')
        .delete()
        .eq('id', newSession.id);
        
      if (deleteError) {
        console.log(`❌ Failed to delete test session: ${deleteError.message}`);
      } else {
        console.log(`✅ Test session cleaned up successfully`);
      }
    }
    
    // Test 6: Check if the app's API endpoints are working
    console.log('\n7. Testing API endpoints...');
    
    try {
      const fetch = require('node-fetch');
      
      // Test the workflow API endpoint
      const apiResponse = await fetch('http://localhost:3000/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'save_draft',
          documentId: testDocument.id,
          step: 'A',
          belongingRating: 8,
          selectedTags: {
            'authorship': ['team_member']
          }
        })
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('✅ API endpoint is responding');
        console.log('   Response:', JSON.stringify(apiData, null, 2));
        
        if (apiData.success && apiData.workflowId) {
          console.log('   ⚠️  API returns success but may be using mock data');
        }
      } else {
        console.log(`❌ API endpoint error: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (apiError) {
      console.log(`❌ API test failed: ${apiError.message}`);
      console.log('   Make sure the development server is running (npm run dev)');
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Database test completed!');
  console.log('\n📋 SUMMARY:');
  console.log('• If tables don\'t exist: Run the setup-database.sql script in Supabase');
  console.log('• If API returns mock data: The app needs to be updated to use real Supabase calls');
  console.log('• If workflow sessions are being created: The app IS saving to the database');
  console.log('• Check the Supabase dashboard to see real-time data changes');
}

// Run the test
testDatabaseConnection().catch(console.error);