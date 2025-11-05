# Testing Checklist: Import/Export & Variable Substitution

Complete testing checklist for validating the new features before deployment.

---

## ✅ Export Functionality

### JSON Export

- [ ] **Templates**
  - [ ] Export all templates successfully
  - [ ] Export specific templates by IDs
  - [ ] JSON structure includes `data`, `exportedAt`, `count`
  - [ ] File downloads with correct filename
  - [ ] Content-Type header is correct
  - [ ] Data is valid JSON
  - [ ] All template fields are present
  - [ ] Variables array is included

- [ ] **Scenarios**
  - [ ] Export all scenarios successfully
  - [ ] Export specific scenarios by IDs
  - [ ] Template references (templateId) are preserved
  - [ ] Tags array is included
  - [ ] All scenario fields are present

- [ ] **Edge Cases**
  - [ ] Export all edge cases successfully
  - [ ] Export specific edge cases by IDs
  - [ ] Scenario references (scenarioId) are preserved
  - [ ] All edge case fields are present

### CSV Export

- [ ] **Templates**
  - [ ] CSV headers are correct
  - [ ] All rows have correct number of columns
  - [ ] Special characters are properly escaped
  - [ ] Quotes in text are escaped as `""`
  - [ ] Commas in text don't break columns
  - [ ] File opens correctly in Excel
  - [ ] File opens correctly in Google Sheets

- [ ] **Scenarios**
  - [ ] CSV format is valid
  - [ ] Arrays (tags) are converted to comma-separated
  - [ ] Opens correctly in spreadsheet software

- [ ] **Edge Cases**
  - [ ] CSV format is valid
  - [ ] Boolean values are represented correctly
  - [ ] Opens correctly in spreadsheet software

### JSONL Export

- [ ] **All Entity Types**
  - [ ] One valid JSON object per line
  - [ ] No trailing commas or brackets
  - [ ] Each line is independently parseable
  - [ ] File can be read line-by-line
  - [ ] Content-Type is `application/x-ndjson`

### Export Edge Cases

- [ ] Empty database returns empty array
- [ ] Non-existent IDs are handled gracefully
- [ ] Large datasets (100+ items) export successfully
- [ ] Unicode characters are preserved
- [ ] Newlines in text are handled correctly
- [ ] Null/undefined values are handled
- [ ] Authentication is required (401 if not authenticated)
- [ ] Error responses have proper status codes

---

## ✅ Import Functionality

### JSON Import

- [ ] **Valid Data**
  - [ ] Import single template successfully
  - [ ] Import multiple templates (batch)
  - [ ] Import with all required fields
  - [ ] Import with optional fields
  - [ ] Variables are preserved correctly
  - [ ] Metadata (created_at, etc.) is handled

- [ ] **Validation**
  - [ ] Required fields are validated
  - [ ] Invalid JSON returns error
  - [ ] Missing fields are caught
  - [ ] Invalid field types are caught
  - [ ] Validation errors are descriptive

- [ ] **Duplicate Handling**
  - [ ] Duplicate names are detected
  - [ ] Overwrite=false skips duplicates
  - [ ] Overwrite=true updates existing
  - [ ] Duplicate IDs are handled
  - [ ] Error messages identify duplicates

### JSONL Import

- [ ] **Format Handling**
  - [ ] Each line parsed independently
  - [ ] Invalid lines are identified
  - [ ] Line numbers in error messages
  - [ ] Mixed valid/invalid lines handled
  - [ ] Empty lines are skipped

### Preview Mode (validateOnly: true)

- [ ] **Validation Preview**
  - [ ] Returns validation results without importing
  - [ ] Valid items are listed
  - [ ] Invalid items are listed with errors
  - [ ] Summary statistics are correct
  - [ ] Duplicate warnings are shown
  - [ ] No data is written to database

### Import Edge Cases

- [ ] Empty file returns appropriate error
- [ ] Malformed JSON returns error
- [ ] Very large files are handled
- [ ] Special characters are preserved
- [ ] Nested objects are handled
- [ ] Arrays are handled
- [ ] Foreign key validation (template_id, scenario_id)
- [ ] Transaction rollback on error
- [ ] Partial imports not allowed

---

## ✅ Variable Substitution Engine

### Simple Variables

- [ ] `{{variable}}` → Replaced with value
- [ ] `{{variable}}` → Kept as placeholder if missing
- [ ] Multiple variables in one template
- [ ] Consecutive variables `{{a}}{{b}}`
- [ ] Variables with spaces `{{ variable }}`
- [ ] Empty variables `{{}}`
- [ ] Malformed variables `{{variable`

### Nested Variables

- [ ] `{{user.name}}` → Deep access works
- [ ] `{{a.b.c.d}}` → Multiple levels
- [ ] Missing nested property handled
- [ ] Null intermediate values handled
- [ ] Undefined intermediate values handled
- [ ] Array access if implemented

### Optional Variables

- [ ] `{{variable?}}` → Empty string if missing
- [ ] `{{variable?}}` → Value if present
- [ ] Nested optional `{{user.name?}}`
- [ ] Optional at end of template
- [ ] Optional at start of template
- [ ] Multiple optionals

### Default Values

- [ ] `{{variable:default}}` → Default if missing
- [ ] `{{variable:default}}` → Value if present
- [ ] Numeric defaults `{{count:0}}`
- [ ] String defaults `{{name:Guest}}`
- [ ] Defaults with spaces `{{msg:Hello World}}`
- [ ] Nested with defaults `{{user.name:Anonymous}}`

### Conditional Variables

- [ ] `{{#if variable}}` → Truthy check
- [ ] True value returns `[conditional-true]`
- [ ] False value returns `[conditional-false]`
- [ ] Undefined returns `[conditional-false]`
- [ ] Null returns `[conditional-false]`

### Type Handling

- [ ] Numbers converted to strings
- [ ] Booleans converted to strings
- [ ] Zero handled correctly (not treated as falsy)
- [ ] Empty string handled correctly
- [ ] Null handled correctly
- [ ] Undefined handled correctly
- [ ] Objects/Arrays converted appropriately

### Validation

- [ ] `validate()` detects missing variables
- [ ] Optional variables not reported as missing
- [ ] Default variables not reported as missing
- [ ] All missing variables listed
- [ ] Valid flag is correct
- [ ] Empty template validates

---

## ✅ Template Preview API

### API Functionality

- [ ] POST `/api/templates/preview` works
- [ ] Accepts template and variables
- [ ] Returns resolved template
- [ ] Returns validation result
- [ ] Handles invalid input
- [ ] Returns proper error messages
- [ ] Response time is reasonable (<500ms)

### Preview Results

- [ ] Resolved template is correct
- [ ] Missing variables are listed
- [ ] Valid flag is accurate
- [ ] All variable types work in preview
- [ ] Complex templates preview correctly

---

## ✅ UI Components

### ExportModal

- [ ] **Display**
  - [ ] Modal opens/closes correctly
  - [ ] Format options are visible
  - [ ] Radio buttons work
  - [ ] Checkbox works
  - [ ] Buttons are styled correctly
  - [ ] Loading state displays during export

- [ ] **Functionality**
  - [ ] JSON format triggers download
  - [ ] JSONL format triggers download
  - [ ] CSV format triggers download
  - [ ] Export all works
  - [ ] Export selected works
  - [ ] Filename includes timestamp
  - [ ] File extension matches format
  - [ ] Success toast appears
  - [ ] Error toast on failure
  - [ ] Modal closes on success

- [ ] **Props**
  - [ ] Open/close prop works
  - [ ] EntityType changes endpoint
  - [ ] SelectedIds filters correctly
  - [ ] Undefined selectedIds exports all

### ImportModal

- [ ] **Display**
  - [ ] Modal opens/closes correctly
  - [ ] File input is accessible
  - [ ] Upload button displays filename
  - [ ] Clear button works
  - [ ] Overwrite checkbox works
  - [ ] Validation results display correctly
  - [ ] Import results display correctly
  - [ ] Icons display correctly

- [ ] **File Upload**
  - [ ] File selection works
  - [ ] JSON files are accepted
  - [ ] JSONL files are accepted
  - [ ] Invalid files rejected
  - [ ] Large files handled
  - [ ] File clears correctly

- [ ] **Validation Step**
  - [ ] Validate button works
  - [ ] Loading state during validation
  - [ ] Valid count is correct
  - [ ] Invalid count is correct
  - [ ] Invalid items are listed
  - [ ] Error messages are shown
  - [ ] Duplicate warnings appear

- [ ] **Import Step**
  - [ ] Import button enabled when valid
  - [ ] Import button disabled when invalid
  - [ ] Loading state during import
  - [ ] Success count is correct
  - [ ] Failed count is correct
  - [ ] Error list is shown
  - [ ] Success toast appears
  - [ ] onImportComplete callback fires
  - [ ] Modal auto-closes on success

- [ ] **Edge Cases**
  - [ ] No file selected shows appropriate state
  - [ ] Empty file handled
  - [ ] Reset clears all state
  - [ ] Multiple import attempts work
  - [ ] Cancel during validation works

### TemplatePreviewPanel

- [ ] **Display**
  - [ ] Panel renders correctly
  - [ ] Title is visible
  - [ ] Preview area is styled
  - [ ] Validation alerts appear
  - [ ] Success alert is green
  - [ ] Error alert is red

- [ ] **Functionality**
  - [ ] Preview updates on template change
  - [ ] Preview updates on variable change
  - [ ] Debouncing works (300ms)
  - [ ] Loading state displays
  - [ ] Missing variables are listed
  - [ ] Success message when valid
  - [ ] Preview text is monospace
  - [ ] Whitespace is preserved

- [ ] **Performance**
  - [ ] Rapid typing doesn't cause issues
  - [ ] Debounce prevents too many API calls
  - [ ] Large templates handled
  - [ ] Complex variables handled

---

## ✅ Integration Testing

### Round-trip Testing

- [ ] **Templates**
  - [ ] Export → Import preserves all data
  - [ ] JSON round-trip works
  - [ ] JSONL round-trip works
  - [ ] CSV import (if supported) works
  - [ ] Variables are preserved
  - [ ] Metadata is preserved (or regenerated)

- [ ] **Scenarios**
  - [ ] Round-trip preserves data
  - [ ] Template references remain valid
  - [ ] Tags are preserved

- [ ] **Edge Cases**
  - [ ] Round-trip preserves data
  - [ ] Scenario references remain valid
  - [ ] Boolean values preserved

### Cross-browser Testing

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] File downloads work in all browsers
- [ ] Modal displays correctly in all browsers

### Mobile Responsiveness

- [ ] Modals are responsive
- [ ] File upload works on mobile
- [ ] Buttons are touch-friendly
- [ ] Text is readable
- [ ] Preview panel adapts to screen size

---

## ✅ Performance Testing

### Export Performance

- [ ] 10 items: <500ms
- [ ] 100 items: <2s
- [ ] 1000 items: <10s (or streaming)
- [ ] Memory usage is reasonable
- [ ] Large text fields don't cause issues

### Import Performance

- [ ] 10 items: <1s
- [ ] 100 items: <5s
- [ ] 1000 items: <30s (or batched)
- [ ] Validation is fast
- [ ] UI remains responsive

### Preview Performance

- [ ] Simple template: <100ms
- [ ] Complex template: <300ms
- [ ] Large template: <500ms
- [ ] Debouncing works effectively
- [ ] No UI lag during typing

---

## ✅ Security Testing

### Authentication

- [ ] Unauthenticated requests return 401
- [ ] User can only access their data
- [ ] Admin can access all data (if applicable)

### Input Validation

- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] Path traversal prevented
- [ ] File upload validation
- [ ] File size limits enforced
- [ ] Rate limiting works (if implemented)

### Data Sanitization

- [ ] HTML in imports is escaped
- [ ] Scripts in imports are sanitized
- [ ] Special characters handled safely
- [ ] Unicode handled correctly

---

## ✅ Error Handling

### API Errors

- [ ] Network errors show toast
- [ ] 400 errors show validation messages
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission error
- [ ] 404 errors show not found
- [ ] 500 errors show generic error
- [ ] Timeout errors handled

### UI Errors

- [ ] Parse errors show message
- [ ] Validation errors are clear
- [ ] User can recover from errors
- [ ] Error states are clearable
- [ ] Console errors are logged

---

## ✅ Accessibility

### Keyboard Navigation

- [ ] Tab through modal elements
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] File input is keyboard accessible
- [ ] Radio buttons keyboard accessible

### Screen Readers

- [ ] Labels are descriptive
- [ ] Buttons have aria-labels
- [ ] Alerts are announced
- [ ] Status messages are announced
- [ ] Error messages are clear

### Visual

- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Icons have alt text
- [ ] Loading states are clear

---

## ✅ Documentation

- [ ] README updated with new features
- [ ] API documentation complete
- [ ] Component props documented
- [ ] Examples are accurate
- [ ] Troubleshooting section complete
- [ ] Code comments are clear

---

## 📋 Test Data Sets

### Minimal Valid Template

```json
{
  "name": "Test Template",
  "structure": "Hello {{name}}!",
  "category": "technical",
  "tone": "professional",
  "complexityBaseline": 5,
  "qualityThreshold": 0.8,
  "variables": [
    {
      "name": "name",
      "description": "User name",
      "required": true
    }
  ]
}
```

### Complex Template

```json
{
  "name": "Complex Template",
  "structure": "{{greeting:Hi}} {{user.firstName}}{{user.lastName?}}! {{#if premium}}VIP{{/if}}",
  "category": "technical",
  "tone": "professional",
  "complexityBaseline": 8,
  "qualityThreshold": 0.9,
  "variables": [
    {
      "name": "greeting",
      "description": "Greeting message",
      "required": false
    },
    {
      "name": "user",
      "description": "User object",
      "required": true
    }
  ]
}
```

### Invalid Template (Missing Required Field)

```json
{
  "name": "Invalid Template",
  "structure": "Test"
}
```

### Invalid Template (Variable Mismatch)

```json
{
  "name": "Mismatch Template",
  "structure": "Hello {{name}} and {{age}}!",
  "variables": [
    {
      "name": "name",
      "required": true
    }
  ]
}
```

---

## 🚀 Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Security review done
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Error handling comprehensive
- [ ] Logging implemented
- [ ] Monitoring configured (if applicable)

---

## 📊 Test Results Template

```
Test Date: __________
Tester: __________
Environment: __________

Export Tests: ___/40 passed
Import Tests: ___/35 passed
Substitution Tests: ___/30 passed
Preview Tests: ___/10 passed
UI Tests: ___/50 passed
Integration Tests: ___/15 passed
Performance Tests: ___/10 passed
Security Tests: ___/10 passed

Total: ___/200 passed

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

Notes:
_______________________________
_______________________________
_______________________________
```

---

## 🐛 Issue Reporting Template

```
**Issue Title**: Brief description

**Priority**: Critical / Major / Minor

**Component**: Export / Import / Substitution / Preview / UI

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Screenshots/Logs**:
Attach relevant files

**Environment**:
- Browser: 
- OS: 
- Screen size: 

**Additional Context**:
Any other relevant information
```

---

**Testing Status**: 🔄 In Progress / ✅ Complete  
**Last Updated**: __________  
**Next Review**: __________

