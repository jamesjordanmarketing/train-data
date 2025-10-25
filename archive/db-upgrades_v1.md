# Database Integration & Master Data Migration Specification
**Date**: 2025-09-21  
**Project**: Document Categorization System - Database Integration Complete Fix  
**Version**: 1.0  
**Urgency**: HIGH PRIORITY - System Architecture Issue  

## 🎯 **MISSION SUMMARY**

You are tasked with fixing a **critical architectural issue** in a Next.js document categorization application. The application has **working database integration** for user workflows, but the **UI is loading mock data instead of database data** for categories and tags. This creates a fundamental disconnect where users see ~50 options in the UI but only 7 exist in the database.

Your mission is to:
1. **Populate the database** with all missing categories and tags
2. **Update UI components** to load from database instead of mock files  
3. **Update API mapping** to handle all category/tag IDs
4. **Verify end-to-end workflow data storage**

---

## 🏗️ **PROJECT ARCHITECTURE OVERVIEW**

### **Technology Stack**:
- **Frontend**: Next.js 14, TypeScript, React Server Components
- **Database**: Supabase (PostgreSQL with UUID primary keys)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Deployment**: Vercel with live database integration ✅

### **Core Workflow**: 
3-Step document categorization process:
- **Step A**: Statement of Belonging (1-10 rating)
- **Step B**: Primary Category Selection 
- **Step C**: Secondary Tag Selection (multiple tag dimensions)

### **Database Status**:
- ✅ **Schema**: Correctly designed and deployed
- ✅ **Authentication**: Working with JWT tokens
- ✅ **API Integration**: Saves workflow data successfully
- ❌ **Master Data**: Missing 80% of categories and tags shown in UI

---

## 🚨 **CRITICAL ISSUE IDENTIFIED**

### **Problem**: UI vs Database Data Mismatch

**What Users See (UI)**:
- **Categories**: 10 complete categories
- **Tag Dimensions**: 7 dimensions with 43 total tags
- **Source**: `src/data/mock-data.ts`

**What's Actually in Database**:
- **Categories**: 2 categories only
- **Tag Dimensions**: 4 dimensions with 5 tags only  
- **Source**: `setup-database.sql`

**Root Cause**:
```typescript
// ❌ CURRENT (Wrong):
// src/components/server/StepBServer.tsx
async function getCategories() {
  return mockCategories  // From mock file
}

// ✅ SHOULD BE (Correct):
async function getCategories() {
  return await categoryService.getAll()  // From database
}
```

---

## 📊 **DATABASE SCHEMA REFERENCE**

### **Core Tables Structure**:

```sql
-- Categories (Primary categorization options)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    examples TEXT[] DEFAULT '{}',
    is_high_value BOOLEAN DEFAULT false,
    impact_description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tag Dimensions (Groupings of tags)
CREATE TABLE tag_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    multi_select BOOLEAN DEFAULT false,
    required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (Individual selectable options)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_id UUID REFERENCES tag_dimensions(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    risk_level INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Sessions (User selections storage)
CREATE TABLE workflow_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES user_profiles(id),
    step TEXT CHECK (step IN ('A', 'B', 'C', 'complete')) DEFAULT 'A',
    belonging_rating INTEGER CHECK (belonging_rating >= 1 AND belonging_rating <= 10),
    selected_category_id UUID REFERENCES categories(id),
    selected_tags JSONB DEFAULT '{}',  -- Format: {"dimension_id": ["tag_id1", "tag_id2"]}
    custom_tags JSONB DEFAULT '[]',
    is_draft BOOLEAN DEFAULT true,
    completed_steps TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

---

## 📋 **COMPLETE DATA MIGRATION REQUIREMENTS**

### **TASK 1: Populate Categories Table**

**Current Database Categories** (2 total):
```sql
-- Existing data (DO NOT duplicate):
('550e8400-e29b-41d4-a716-446655440001', 'Complete Systems & Methodologies'),
('550e8400-e29b-41d4-a716-446655440002', 'Proprietary Strategies & Approaches')
```

**Missing Categories to Add** (8 total):
Based on `src/data/mock-data.ts` → `primaryCategories` array:

1. **process-documentation** → "Process Documentation & Workflows"
2. **customer-insights** → "Customer Insights & Feedback"  
3. **market-research** → "Market Research & Analysis"
4. **sales-enablement** → "Sales Enablement Materials"
5. **training-materials** → "Training & Educational Materials"
6. **knowledge-base** → "Knowledge Base Articles"
7. **communication-templates** → "Communication Templates"
8. **project-artifacts** → "Project Artifacts & Deliverables"

### **TASK 2: Populate Tag Dimensions Table**

**Current Database Tag Dimensions** (4 total):
```sql
-- Existing data (DO NOT duplicate):
('550e8400-e29b-41d4-a716-446655440003', 'Authorship'),
('550e8400-e29b-41d4-a716-446655440004', 'Content Format'),
('550e8400-e29b-41d4-a716-446655440005', 'Disclosure Risk'),
('550e8400-e29b-41d4-a716-446655440006', 'Intended Use')
```

**Missing Tag Dimensions to Add** (3 total):
Based on `src/data/mock-data.ts` → `tagDimensions` array:

1. **evidence-type** → "Evidence Type" (multi_select: true, required: false)
2. **audience-level** → "Audience Level" (multi_select: true, required: false)  
3. **gating-level** → "Gating Level" (multi_select: false, required: false)

### **TASK 3: Populate Tags Table**

**Current Database Tags** (5 total):
```sql
-- Existing data (DO NOT duplicate):
('550e8400-e29b-41d4-a716-446655440007', 'Brand/Company', 'authorship'),
('550e8400-e29b-41d4-a716-446655440008', 'Team Member', 'authorship'),
('550e8400-e29b-41d4-a716-446655440009', 'Level 1 - Minimal Risk', 'disclosure-risk'),
('550e8400-e29b-41d4-a716-446655440010', 'Training', 'intended-use'),
('550e8400-e29b-41d4-a716-446655440011', 'Marketing', 'intended-use')
```

**Missing Tags to Add** (~38 total):
Extract from `src/data/mock-data.ts` → `tagDimensions` array → each dimension's `tags` array:

**Authorship Dimension** (3 missing):
- customer, mixed, third-party

**Format Dimension** (10 missing):  
- how-to, strategy, case-study, story, sales-page, email, transcript, slide, whitepaper, brief

**Disclosure Risk Dimension** (4 missing):
- risk-2, risk-3, risk-4, risk-5

**Intended Use Dimension** (4 missing):
- sales-enablement, delivery-ops, investor, legal

**Evidence Type Dimension** (6 new):
- metrics, quote, before-after, screenshot, data-table, reference

**Audience Level Dimension** (5 new):
- public, lead, customer, internal, executive

**Gating Level Dimension** (6 new):
- public, ungated-email, soft-gated, hard-gated, internal-only, nda-only

---

## 🔧 **CODE CHANGES REQUIRED**

### **TASK 4: Update UI Components to Use Database**

**File 1**: `src/components/server/StepBServer.tsx`
```typescript
// ❌ CURRENT:
async function getCategories() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Add enhanced analytics data to categories
  const categoriesWithAnalytics = mockCategories.map(category => ({
    ...category,
    usageAnalytics: {
      totalSelections: Math.floor(Math.random() * 1000) + 100,
      recentActivity: Math.floor(Math.random() * 50) + 5
    },
    valueDistribution: {
      highValue: Math.floor(Math.random() * 40) + 10,
      mediumValue: Math.floor(Math.random() * 35) + 15,
      standardValue: Math.floor(Math.random() * 30) + 20
    }
  }))
  
  return categoriesWithAnalytics
}

// ✅ SHOULD BE:
async function getCategories() {
  try {
    const categories = await categoryService.getAll()
    
    // Add enhanced analytics data to categories (keep this logic)
    const categoriesWithAnalytics = categories.map(category => ({
      ...category,
      usageAnalytics: {
        totalSelections: Math.floor(Math.random() * 1000) + 100,
        recentActivity: Math.floor(Math.random() * 50) + 5
      },
      valueDistribution: {
        highValue: Math.floor(Math.random() * 40) + 10,
        mediumValue: Math.floor(Math.random() * 35) + 15,
        standardValue: Math.floor(Math.random() * 30) + 20
      }
    }))
    
    return categoriesWithAnalytics
  } catch (error) {
    console.error('Error loading categories from database:', error)
    // Fallback to mock data in case of error
    return mockCategories
  }
}
```

**File 2**: `src/components/server/StepCServer.tsx`
```typescript
// ❌ CURRENT:
async function getTagDimensions() {
  return tagDimensions
}

// ✅ SHOULD BE:
async function getTagDimensions() {
  try {
    const dimensions = await tagService.getDimensions()
    return dimensions
  } catch (error) {
    console.error('Error loading tag dimensions from database:', error)
    // Fallback to mock data in case of error
    return tagDimensions
  }
}
```

### **TASK 5: Update API Route UUID Mapping**

**File**: `src/app/api/workflow/route.ts`

**Current UUID Mappings** (2 categories):
```typescript
const categoryMappings = {
  'complete-systems': '550e8400-e29b-41d4-a716-446655440001',
  'proprietary-strategies': '550e8400-e29b-41d4-a716-446655440002',
  'process-documentation': '550e8400-e29b-41d4-a716-446655440001', // Default fallback
}
```

**Required UUID Mappings** (10 categories):
You need to add mappings for all 8 missing categories. Generate sequential UUIDs starting from `550e8400-e29b-41d4-a716-446655440013` for the missing categories.

---

## 🗂️ **FILE STRUCTURE REFERENCE**

### **Key Files You'll Work With**:

1. **Database Schema**: `setup-database.sql` (reference only)
2. **Mock Data Source**: `src/data/mock-data.ts` (data extraction source)
3. **Database Services**: `src/lib/database.ts` (utility functions)
4. **UI Components**: 
   - `src/components/server/StepBServer.tsx` (categories)
   - `src/components/server/StepCServer.tsx` (tag dimensions)
5. **API Route**: `src/app/api/workflow/route.ts` (UUID mappings)
6. **Supabase Client**: `src/lib/supabase.ts` (database connection)

### **Testing Files**:
- **Database Test Script**: `test-database.js`
- **Live Application**: https://categ-module.vercel.app/

---

## 🚀 **STEP-BY-STEP IMPLEMENTATION PLAN**

### **Phase 1: Data Migration (Database Changes)**

**Step 1.1**: Create Database Migration Script
- Create `migration-master-data.sql` with all INSERT statements
- Use sequential UUIDs: `550e8400-e29b-41d4-a716-446655440013` onward
- Extract complete data structure from `src/data/mock-data.ts`

**Step 1.2**: Execute Migration
- Run migration script in Supabase SQL Editor
- Verify data insertion with SELECT queries
- Confirm no duplicate entries

**Step 1.3**: Validate Migration
- Check total counts: 10 categories, 7 tag dimensions, ~43 tags
- Verify foreign key relationships (tags → tag_dimensions)
- Test a sample query with joins

### **Phase 2: Code Changes (Frontend Integration)**

**Step 2.1**: Update Database Service Functions
- Ensure `categoryService.getAll()` works correctly  
- Ensure `tagService.getDimensions()` includes nested tags
- Add error handling and logging

**Step 2.2**: Update Server Components  
- Modify `StepBServer.tsx` to use database service
- Modify `StepCServer.tsx` to use database service
- Keep analytics generation logic for UI enhancement

**Step 2.3**: Update API Route Mappings
- Add UUID mappings for all 8 missing categories
- Update category validation logic
- Test API route with new category IDs

### **Phase 3: Testing & Verification**

**Step 3.1**: Database Testing
- Run `node test-database.js` to verify database operations
- Confirm categories and tags load correctly
- Test workflow session creation with new data

**Step 3.2**: UI Testing  
- Test Step B: All 10 categories should appear
- Test Step C: All 7 tag dimensions with complete tags should appear
- Verify no UI errors or missing data

**Step 3.3**: End-to-End Testing
- Complete full workflow: A → B → C → Submit
- Verify data saves to `workflow_sessions` table with correct UUIDs
- Check JSON structure in `selected_tags` field

---

## ✅ **SUCCESS CRITERIA**

### **Database Verification**:
```sql
-- Should return 10 rows
SELECT COUNT(*) FROM categories;

-- Should return 7 rows  
SELECT COUNT(*) FROM tag_dimensions;

-- Should return ~43 rows
SELECT COUNT(*) FROM tags;

-- Should show proper relationships
SELECT td.name as dimension, COUNT(t.id) as tag_count 
FROM tag_dimensions td 
LEFT JOIN tags t ON td.id = t.dimension_id 
GROUP BY td.name;
```

### **UI Verification**:
- Step B shows all 10 categories from database
- Step C shows all 7 tag dimensions with complete tag lists
- No console errors about missing data
- Analytics data displays correctly

### **API Verification**:
- All 10 category IDs map correctly in workflow API
- Workflow submissions save without UUID errors
- `selected_tags` JSON contains correct dimension and tag IDs

### **End-to-End Verification**:
- Complete workflow creates record in `workflow_sessions`
- All three data points stored correctly:
  - `belonging_rating`: Integer 1-10
  - `selected_category_id`: Valid category UUID
  - `selected_tags`: Valid JSON with dimension/tag relationships

---

## 🔗 **IMPORTANT CONTEXT**

### **Supabase Configuration**:
- **URL**: `https://hqhtbxlgzysfbekexwku.supabase.co`
- **Database**: PostgreSQL with RLS enabled
- **Authentication**: Working JWT token system
- **Environment Variables**: Already configured in Vercel

### **Development URLs**:
- **Live Application**: https://categ-module.vercel.app/
- **Supabase Dashboard**: https://supabase.com/dashboard

### **Previous Work Completed**:
- ✅ Database schema creation and deployment
- ✅ Authentication system with RLS policies  
- ✅ API routes with JWT token handling
- ✅ UUID validation and conversion system
- ✅ Environment variable configuration
- ✅ Basic workflow data storage (primary categories working)

### **Current System Status**:
- **Database Integration**: ✅ Working
- **User Authentication**: ✅ Working  
- **Basic Workflow Storage**: ✅ Working
- **Master Data Population**: ❌ Incomplete (your task)
- **UI-Database Integration**: ❌ Disconnected (your task)

---

## ⚠️ **CRITICAL WARNINGS**

1. **DO NOT** modify existing database records with UUIDs `550e8400-e29b-41d4-a716-446655440001` through `550e8400-e29b-41d4-a716-446655440011`

2. **DO NOT** change the database schema structure - only add data

3. **PRESERVE** all existing functionality while adding new features

4. **TEST** thoroughly before considering the task complete

5. **VERIFY** that the live application at https://categ-module.vercel.app/ works correctly after your changes

---

## 🎯 **YOUR DELIVERABLES**

1. **Migration Script**: `migration-master-data.sql` with all INSERT statements
2. **Updated UI Components**: Modified `StepBServer.tsx` and `StepCServer.tsx`  
3. **Updated API Mappings**: Enhanced `workflow/route.ts` with complete UUID mappings
4. **Test Results**: Verification that all success criteria are met
5. **Documentation**: Brief summary of changes made and verification steps completed

**Execute this specification completely to resolve the critical UI vs database disconnection issue.**

## Human Operator Installation Instructions

### **STEP 1: Execute Database Migration**
1. Open browser → Go to https://supabase.com/dashboard
2. Login to your account
3. Select your project → Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy entire contents of `migration-master-data.sql`
6. Paste into SQL Editor
7. Click "Run" button
8. Verify success message: "Master data migration completed successfully!"

### **STEP 2: Verify Migration Success**
```bash
# Run verification test
node test-master-data.js
```
**Expected Output:**
- ✅ Found 10 categories
- ✅ Found 7 tag dimensions  
- ✅ Found ~43 tags
- ✅ Category name matches: 10/10
- ✅ Dimension name matches: 7/7

### **STEP 3: Test Code Changes Locally**
```bash
# Start development server
npm run dev

# In new terminal, test database connection
node test-database.js
```

### **STEP 4: Verify Live Application**
1. Open https://categ-module.vercel.app/
2. Sign in with existing account
3. Start new workflow
4. **Step B**: Verify all 10 categories appear
5. **Step C**: Verify all 7 tag dimensions with complete tag lists
6. Complete full workflow (A → B → C → Submit)

### **STEP 5: Verify Database Storage**
1. Go back to Supabase Dashboard → SQL Editor
2. Run verification query:
```sql
SELECT COUNT(*) FROM workflow_sessions WHERE step = 'complete';
```
3. Should show completed workflow sessions

### **STEP 6: Deploy to Production**
```bash
# Commit and push changes (auto-deploys via Vercel)
git add .
git commit -m "Fix: UI now loads from database instead of mock data"
git push origin main
```

### **Troubleshooting:**
- **Migration fails**: Check for duplicate UUIDs, re-run script
- **UI shows mock data**: Check console for database errors, verify Supabase connection
- **Categories not mapping**: Check `workflow/route.ts` UUID mappings
- **Test failures**: Run `node test-master-data.js` to identify missing data