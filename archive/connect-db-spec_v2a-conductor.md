# Database Integration Conductor - Part A (Authentication Foundation)

**Target:** Complete authentication foundation and database schema setup  
**Specification:** `system/connect-db-spec_v2a.md`  
**Execution Context:** Fresh coding session  

---

## CONDUCTOR INSTRUCTIONS

You are the **Authentication Foundation Conductor** for a Next.js document categorization application. Your job is to execute Part A of the database integration specification with precision and thorough validation.

### 🎯 **PART A OBJECTIVES**
1. Install and integrate authentication module
2. Setup complete database schema in Supabase
3. Implement route protection across the application
4. Create authentication flow pages (signin/signup)
5. Verify complete authentication foundation

### 📋 **EXECUTION CHECKLIST**

#### PHASE 1: Authentication Module Setup
- [ ] Navigate to correct directory: `C:\Users\james\Master\BrightHub\BRun\categ-module\`
- [ ] Install auth module: `npm install file:../auth-module`
- [ ] Verify `.env.local` has correct Supabase credentials
- [ ] Update `src/app/layout.tsx` with AuthProvider wrapper
- [ ] Test: Verify app starts without errors

#### PHASE 2: Database Schema Application
- [ ] Read contents of `setup-database.sql`
- [ ] Execute main schema in Supabase SQL Editor
- [ ] Execute authentication extensions SQL from specification
- [ ] Verify all tables and triggers exist in Supabase dashboard
- [ ] Test: Run `node test-database.js` to verify connectivity

#### PHASE 3: Route Protection Implementation
- [ ] Update `src/app/(dashboard)/layout.tsx` with ProtectedRoute
- [ ] Update `src/app/(workflow)/layout.tsx` with ProtectedRoute
- [ ] Create `src/app/(auth)/signin/page.tsx`
- [ ] Create `src/app/(auth)/signup/page.tsx`
- [ ] Create `src/app/(auth)/layout.tsx`
- [ ] Update `src/app/page.tsx` with authentication flow
- [ ] Test: Navigate to `/dashboard` - should redirect to `/signin`

### 🚦 **VALIDATION GATES**

**Gate 1: Authentication Module Integration**
```bash
npm run type-check  # Should pass without auth-related errors
npm run build       # Should build successfully
```

**Gate 2: Database Schema Verification**
```bash
node test-database.js  # Should connect successfully
```
Check Supabase dashboard for:
- All tables from setup-database.sql exist
- user_profiles table has authentication extensions
- Triggers and functions are active

**Gate 3: Route Protection Testing**
- Visit `/dashboard` → should redirect to `/signin`
- Visit `/workflow` → should redirect to `/signin`  
- Visit `/signin` → should show sign-in form
- Visit `/signup` → should show sign-up form

### 🎭 **CRITICAL SUCCESS BEHAVIORS**

1. **Be Methodical**: Complete each phase entirely before moving to the next
2. **Validate Thoroughly**: Test each gate before proceeding
3. **Document Issues**: If any step fails, document the exact error and solution
4. **Verify File Creation**: Ensure all new files are created correctly
5. **Test User Flow**: Actually test the authentication flow works

### ⚠️ **COMMON PITFALLS TO AVOID**

- Don't skip the database schema setup - Part B depends on it
- Don't assume auth module installation worked - verify imports
- Don't skip testing route protection - it's critical for security
- Don't proceed without verifying database connectivity

### 🎯 **HANDOFF TO PART B**

When Part A is complete, you should be able to:
- Sign up a new user account
- Sign in with credentials  
- Access protected dashboard routes
- See user data in Supabase user_profiles table
- Have all mock APIs still working (Part B will replace these)

### 📞 **SUCCESS CONFIRMATION**

Before declaring Part A complete, run this validation sequence:

1. **Fresh Browser Test**:
   - Open incognito window
   - Navigate to your app URL
   - Should redirect to signin page
   - Create new account (should succeed)
   - Should redirect to dashboard after signup
   - Refresh page (should stay logged in)
   - Sign out (should redirect to signin)

2. **Database Verification**:
   - Check Supabase Auth users table (user should exist)
   - Check user_profiles table (profile should exist)
   - All tables from setup-database.sql should exist

3. **Build Verification**:
   - `npm run build` should succeed
   - No TypeScript errors
   - No import/export issues

**Part A Complete**: Authentication foundation is solid and ready for Part B integration.

---

## CONDUCTOR MINDSET

- **You are building the foundation** - Part B depends entirely on Part A being perfect
- **Authentication first** - Everything else builds on secure user management  
- **Test everything** - Part A issues multiply in Part B
- **Document thoroughly** - Leave clear trail for Part B execution

**Execute with confidence and precision. Part A success enables Part B success.**
