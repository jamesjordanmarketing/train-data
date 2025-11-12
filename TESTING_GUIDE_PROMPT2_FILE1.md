# Testing Guide: Single Generation Page

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Access the Generation Page
```
http://localhost:3000/conversations/generate
```

---

## Test Scenarios

### ✅ Scenario 1: Happy Path - Complete Generation Flow

**Goal:** Generate a conversation successfully from start to finish

**Steps:**
1. Navigate to `http://localhost:3000/conversations/generate`
2. **Step 1 - Select Template:**
   - Wait for templates to load (should see 3+ template cards)
   - Click on any template card (e.g., "Sales Discovery Call")
   - Verify: Card gets blue border and checkmark appears
   - Verify: Automatically advances to Step 2
   - Verify: Step indicator shows Step 2 highlighted

3. **Step 2 - Configure Parameters:**
   - Verify: Selected template name shows in gray box
   - Fill in form:
     - Persona: "Sales Manager"
     - Emotion: "Confident"
     - Topic: "Quarterly Revenue Goals"
   - Optional: Click "Advanced Options" and adjust temperature
   - Click "Generate Conversation" button
   - Verify: Button shows "Generating..." and becomes disabled
   - Verify: Automatically advances to Step 3

4. **Step 3 - Generation Progress:**
   - Verify: Progress bar appears at 10%
   - Verify: Animated spinner next to "Generating Conversation..."
   - Verify: Status changes from "Template resolved" → "Generating conversation" → "Quality scoring" → "Saving to database"
   - Verify: Step indicators show checkmarks for completed steps
   - Verify: Progress reaches 100%
   - Verify: Automatically advances to Step 4

5. **Step 4 - View Results:**
   - Verify: Green checkmark with "Conversation Generated Successfully!"
   - Verify: All conversation details display:
     - ID (UUID format)
     - Title
     - Turns (number)
     - Tokens (formatted with commas)
     - Quality Score (green if ≥8, yellow if ≥6, red if <6)
     - Status badge
     - Cost ($0.xxxx format)
     - Duration (x.x seconds)
   - Click "View Conversation" button
   - Verify: Redirects to `/conversations?id={conversationId}`

**Expected Result:** ✅ Pass - Full workflow completes successfully

---

### ✅ Scenario 2: Form Validation

**Goal:** Test inline form validation

**Steps:**
1. Navigate to `/conversations/generate`
2. Select any template (advances to Step 2)
3. **Test Empty Fields:**
   - Leave Persona field empty
   - Click in Topic field (trigger blur event)
   - Verify: No error yet (required validation on submit)
   - Try to click "Generate Conversation"
   - Verify: Button is disabled

4. **Test Character Limits:**
   - Persona: Type 2 characters → Verify error "at least 3 characters"
   - Persona: Type 101 characters → Verify error "less than 100 characters"
   - Emotion: Type 51 characters → Verify error "less than 50 characters"
   - Topic: Type 201 characters → Verify error "less than 200 characters"

5. **Test Character Counter:**
   - Persona: Type 85 characters → Verify counter shows "85/100" and "Approaching limit" in orange
   - Persona: Type 50 characters → Verify "Good length" in green

6. **Test Suggestion Badges:**
   - Click "Sales Manager" badge
   - Verify: Persona field populates with "Sales Manager"
   - Verify: Green "Good length" message appears

7. **Test Advanced Options:**
   - Click "Advanced Options"
   - Verify: Expands to show Temperature slider and Max Tokens field
   - Move temperature slider to 0.9
   - Verify: Value displays as "0.90"
   - Set Max Tokens to 50 (below minimum)
   - Verify: Error "at least 100"
   - Set Max Tokens to 10000 (above maximum)
   - Verify: Error "at most 8192"

**Expected Result:** ✅ Pass - All validations work correctly

---

### ✅ Scenario 3: Back Navigation

**Goal:** Test navigation between steps

**Steps:**
1. Navigate to `/conversations/generate`
2. Select a template → advances to Step 2
3. Fill in Persona: "Product Manager"
4. Click "Back to Template Selection"
5. Verify: Returns to Step 1 (template selection)
6. Select a different template
7. Verify: Advances to Step 2 with NEW template name
8. Verify: Previous form data is cleared (Persona field is empty)

**Expected Result:** ✅ Pass - Back navigation works, data resets correctly

---

### ✅ Scenario 4: Error Handling - Network Failure

**Goal:** Test error handling when API is unavailable

**Setup:**
```bash
# In terminal, stop the dev server
Ctrl+C
```

**Steps:**
1. Navigate to `/conversations/generate` (page should be cached)
2. Select a template
3. Fill in valid form data
4. Click "Generate Conversation"
5. Verify: Progress starts
6. Verify: Network error occurs
7. Verify: Red error alert displays:
   - "Generation Failed" title
   - Error message (e.g., "Failed to fetch")
   - "Try Again" button
8. Click "Try Again"
9. Verify: Returns to Step 2 (form with data preserved if possible)

**Cleanup:**
```bash
# Restart dev server
npm run dev
```

**Expected Result:** ✅ Pass - Error displays correctly with retry option

---

### ✅ Scenario 5: Error Handling - API Error

**Goal:** Test error handling when API returns an error

**Note:** This requires the API to return an error. Test with real API if available.

**Steps:**
1. Navigate to `/conversations/generate`
2. Select a template with known issues OR modify API to return error
3. Fill in form and submit
4. Verify: Error alert displays with API error message
5. Verify: "Try Again" button available

**Expected Result:** ✅ Pass - API errors handled gracefully

---

### ✅ Scenario 6: Generate Another Conversation

**Goal:** Test "Generate Another" workflow

**Steps:**
1. Complete a successful generation (Scenario 1)
2. On results screen, click "Generate Another"
3. Verify: Returns to Step 1 (template selection)
4. Verify: Step indicator shows Step 1 highlighted
5. Verify: Previous conversation data is cleared
6. Select a different template
7. Verify: Can generate another conversation successfully

**Expected Result:** ✅ Pass - Can generate multiple conversations in sequence

---

### ✅ Scenario 7: Navigation from Results

**Goal:** Test all navigation buttons on results screen

**Steps:**
1. Complete a successful generation
2. **Test "View Conversation":**
   - Click button
   - Verify: Redirects to `/conversations?id={conversationId}`
   - Navigate back

3. **Test "Go to Dashboard":**
   - Generate another conversation
   - On results screen, click "Go to Dashboard"
   - Verify: Redirects to `/conversations`

**Expected Result:** ✅ Pass - All navigation buttons work correctly

---

### ✅ Scenario 8: Responsive Design

**Goal:** Test mobile and tablet layouts

**Steps:**
1. Open Chrome DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. **Mobile (375px):**
   - Select iPhone SE or similar
   - Navigate through all steps
   - Verify: Template cards stack vertically
   - Verify: Step indicator remains readable
   - Verify: Form fields are full width
   - Verify: Action buttons stack vertically (not side-by-side)

4. **Tablet (768px):**
   - Select iPad or similar
   - Verify: Template cards show 2 columns
   - Verify: Everything remains readable and usable

**Expected Result:** ✅ Pass - Responsive on all screen sizes

---

### ✅ Scenario 9: Browser Back Button

**Goal:** Test browser navigation integration

**Steps:**
1. Navigate to `/conversations/generate`
2. Select template (Step 2)
3. Click browser back button
4. Verify: Returns to previous page OR Step 1
5. Navigate forward to Step 2 again
6. Fill form and generate
7. Click browser back button during generation
8. Verify: Stops generation (expected behavior may vary)

**Expected Result:** ✅ Pass - Browser navigation works reasonably

---

### ✅ Scenario 10: Loading States

**Goal:** Verify all loading states display correctly

**Steps:**
1. **Template Loading:**
   - Navigate to `/conversations/generate`
   - With slow network, verify: 3 skeleton cards display while loading
   - Verify: Skeleton cards have pulse animation

2. **Form Disabled During Generation:**
   - Generate a conversation
   - Verify: "Generate Conversation" button disabled during API call
   - Verify: Button text changes to "Generating..."

3. **Progress Indicators:**
   - Verify: Animated spinner on current step
   - Verify: Progress bar animates smoothly
   - Verify: Estimated time counts down

**Expected Result:** ✅ Pass - All loading states work correctly

---

## Network Debugging

### Check API Calls

Open Chrome DevTools → Network tab:

1. **Templates API Call:**
   - URL: `/api/templates`
   - Method: GET
   - Status: 200
   - Response: Array of template objects

2. **Generation API Call:**
   - URL: `/api/conversations/generate`
   - Method: POST
   - Status: 200
   - Request Body:
     ```json
     {
       "templateId": "uuid",
       "parameters": {
         "persona": "Sales Manager",
         "emotion": "Confident",
         "topic": "Quarterly Goals"
       },
       "tier": "template",
       "temperature": 0.7,
       "maxTokens": 2000
     }
     ```
   - Response:
     ```json
     {
       "conversation": {
         "id": "uuid",
         "title": "...",
         "totalTurns": 8,
         "totalTokens": 1234,
         "qualityScore": 8.5,
         "status": "generated"
       },
       "cost": 0.0123,
       "qualityMetrics": {
         "durationMs": 15234
       }
     }
     ```

---

## Console Debugging

### Check for Errors

Open Chrome DevTools → Console tab:

- ✅ No red errors should appear during normal flow
- ✅ No warnings about missing props or types
- ⚠️ May see development warnings (React strict mode) - these are normal

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| 404 on page load | "Page not found" | Verify file at `src/app/(dashboard)/conversations/generate/page.tsx` |
| Templates don't load | Empty or skeleton forever | Check `/api/templates` endpoint in Network tab |
| Generate button disabled | Can't submit form | Check form validation errors (red text under fields) |
| Generation fails | Error alert appears | Check `/api/conversations/generate` response in Network tab |
| Progress stuck | Progress bar doesn't move | Check for JavaScript errors in Console |
| Navigation doesn't work | Buttons don't redirect | Check `useRouter` from `next/navigation` imported correctly |

---

## Performance Checks

### Load Time Expectations

- **Page load:** < 1 second
- **Template API:** < 500ms
- **Generation API:** 15-60 seconds (depending on model)
- **Navigation between steps:** Instant (< 100ms)

### Memory Leaks

1. Open Chrome DevTools → Performance tab
2. Record while navigating through all steps
3. Verify: No significant memory growth
4. Verify: No excessive re-renders

---

## Accessibility Testing

### Keyboard Navigation

1. Press Tab to navigate through page
2. Verify: All interactive elements are reachable
3. Verify: Focus indicators visible (blue outline)
4. Press Enter on template card → selects template
5. Press Enter on buttons → activates them

### Screen Reader Testing

Using NVDA or JAWS:
1. Verify: Page title announced
2. Verify: Form labels read correctly
3. Verify: Error messages announced
4. Verify: Button states announced (disabled/enabled)
5. Verify: Progress updates announced

---

## Test Results Template

```markdown
## Test Results - [Date]

**Tester:** [Your Name]
**Browser:** Chrome 118 / Firefox 119 / Safari 17
**OS:** Windows 11 / macOS Sonoma / Ubuntu 22.04

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Happy Path | ✅ Pass | - |
| 2. Form Validation | ✅ Pass | - |
| 3. Back Navigation | ✅ Pass | - |
| 4. Network Error | ✅ Pass | - |
| 5. API Error | ⏭️ Skipped | No test API available |
| 6. Generate Another | ✅ Pass | - |
| 7. Navigation Buttons | ✅ Pass | - |
| 8. Responsive Design | ✅ Pass | - |
| 9. Browser Back | ✅ Pass | - |
| 10. Loading States | ✅ Pass | - |

**Overall:** ✅ Pass - Ready for production

**Issues Found:**
- None

**Recommendations:**
- Consider adding WebSocket for real-time progress updates
- Consider adding conversation preview before generation
```

---

## Next Steps After Testing

1. ✅ All tests pass → Mark Prompt 2 File 1 as complete
2. ❌ Some tests fail → Document issues and fix
3. 📋 Create issues for future enhancements
4. 🚀 Proceed to next prompt (Prompt 2 File 2, etc.)

---

**Happy Testing! 🎉**

