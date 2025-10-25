// Test script to verify master data loading after migration
const { createClient } = require('@supabase/supabase-js');
const { projectId, publicAnonKey } = require('./src/utils/supabase/info.tsx');

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function testMasterDataLoading() {
  console.log('🔍 Testing Master Data Loading After Migration...');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Check categories count
    console.log('\n1. Checking categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, is_high_value')
      .order('sort_order');
      
    if (catError) {
      console.log(`❌ Error loading categories: ${catError.message}`);
    } else {
      console.log(`✅ Found ${categories.length} categories`);
      if (categories.length >= 10) {
        console.log('   ✅ Expected 10+ categories found!');
      } else {
        console.log(`   ⚠️  Only ${categories.length} categories - migration may be needed`);
      }
      
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (High Value: ${cat.is_high_value})`);
      });
    }
    
    // Test 2: Check tag dimensions count
    console.log('\n2. Checking tag dimensions...');
    const { data: dimensions, error: dimError } = await supabase
      .from('tag_dimensions')
      .select('id, name, multi_select, required')
      .order('sort_order');
      
    if (dimError) {
      console.log(`❌ Error loading tag dimensions: ${dimError.message}`);
    } else {
      console.log(`✅ Found ${dimensions.length} tag dimensions`);
      if (dimensions.length >= 7) {
        console.log('   ✅ Expected 7+ dimensions found!');
      } else {
        console.log(`   ⚠️  Only ${dimensions.length} dimensions - migration may be needed`);
      }
      
      dimensions.forEach((dim, index) => {
        console.log(`   ${index + 1}. ${dim.name} (Multi: ${dim.multi_select}, Required: ${dim.required})`);
      });
    }
    
    // Test 3: Check tags count and distribution
    console.log('\n3. Checking tags...');
    const { data: tags, error: tagError } = await supabase
      .from('tags')
      .select(`
        id, name, description,
        tag_dimensions!inner(name)
      `)
      .order('sort_order');
      
    if (tagError) {
      console.log(`❌ Error loading tags: ${tagError.message}`);
    } else {
      console.log(`✅ Found ${tags.length} tags`);
      if (tags.length >= 40) {
        console.log('   ✅ Expected 40+ tags found!');
      } else {
        console.log(`   ⚠️  Only ${tags.length} tags - migration may be needed`);
      }
      
      // Group by dimension
      const tagsByDimension = {};
      tags.forEach(tag => {
        const dimName = tag.tag_dimensions?.name || 'Unknown';
        if (!tagsByDimension[dimName]) {
          tagsByDimension[dimName] = [];
        }
        tagsByDimension[dimName].push(tag.name);
      });
      
      console.log('\n   Tags by dimension:');
      Object.entries(tagsByDimension).forEach(([dimension, tagList]) => {
        console.log(`   - ${dimension}: ${tagList.length} tags`);
        tagList.forEach((tag, idx) => {
          if (idx < 3) { // Show first 3 tags
            console.log(`     • ${tag}`);
          } else if (idx === 3 && tagList.length > 3) {
            console.log(`     • ... and ${tagList.length - 3} more`);
          }
        });
      });
    }
    
    // Test 4: Test the database service functions (simulate how UI components will use them)
    console.log('\n4. Testing database service functions...');
    
    try {
      // Simulate categoryService.getAll()
      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
        
      console.log(`✅ categoryService.getAll() simulation: ${allCategories?.length || 0} categories`);
      
      // Simulate tagService.getDimensions()
      const { data: allDimensions } = await supabase
        .from('tag_dimensions')
        .select(`
          *,
          tags (*)
        `)
        .order('sort_order', { ascending: true });
        
      console.log(`✅ tagService.getDimensions() simulation: ${allDimensions?.length || 0} dimensions`);
      
      if (allDimensions) {
        let totalTags = 0;
        allDimensions.forEach(dim => {
          totalTags += dim.tags?.length || 0;
        });
        console.log(`   Total nested tags: ${totalTags}`);
      }
      
    } catch (serviceError) {
      console.log(`❌ Database service simulation failed: ${serviceError.message}`);
    }
    
    // Test 5: Verify data structure matches UI expectations
    console.log('\n5. Verifying data structure compatibility...');
    
    const expectedCategories = [
      'Complete Systems & Methodologies',
      'Proprietary Strategies & Approaches',
      'Process Documentation & Workflows',
      'Customer Insights & Case Studies',
      'Market Research & Competitive Intelligence',
      'Sales Enablement & Customer-Facing Content',
      'Training Materials & Educational Content',
      'Knowledge Base & Reference Materials',
      'Communication Templates & Messaging',
      'Project Artifacts & Deliverables'
    ];
    
    const expectedDimensions = [
      'Authorship',
      'Content Format',
      'Disclosure Risk',
      'Intended Use',
      'Evidence Type',
      'Audience Level',
      'Gating Level'
    ];
    
    let categoryMatches = 0;
    let dimensionMatches = 0;
    
    if (categories) {
      expectedCategories.forEach(expected => {
        if (categories.find(cat => cat.name === expected)) {
          categoryMatches++;
        }
      });
    }
    
    if (dimensions) {
      expectedDimensions.forEach(expected => {
        if (dimensions.find(dim => dim.name === expected)) {
          dimensionMatches++;
        }
      });
    }
    
    console.log(`✅ Category name matches: ${categoryMatches}/${expectedCategories.length}`);
    console.log(`✅ Dimension name matches: ${dimensionMatches}/${expectedDimensions.length}`);
    
    if (categoryMatches === expectedCategories.length && dimensionMatches === expectedDimensions.length) {
      console.log('🎉 All expected data structures found!');
    } else {
      console.log('⚠️  Some expected data missing - run migration script');
    }
    
  } catch (error) {
    console.error('❌ Master data test failed:', error.message);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Master data test completed!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. If data is incomplete: Run migration-master-data.sql in Supabase SQL Editor');
  console.log('2. If data is complete: UI components should now load from database');
  console.log('3. Test the live application at https://categ-module.vercel.app/');
  console.log('4. Verify all categories and tags appear in Step B and Step C');
}

// Run the test
testMasterDataLoading().catch(console.error);
