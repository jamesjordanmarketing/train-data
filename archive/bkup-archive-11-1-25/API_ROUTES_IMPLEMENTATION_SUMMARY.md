# API Routes Implementation Summary

## ✅ Implementation Complete

All RESTful API endpoints for the Template Management System have been successfully implemented with proper validation, error handling, and authentication.

---

## 📁 Files Created

### Validation Utilities
- `src/lib/utils/validation.ts` - UUID validation, pagination helpers, query parameter parsers

### Zod Validation Schemas
- `src/lib/validation/templates.ts` - Template request validation schemas
- `src/lib/validation/scenarios.ts` - Scenario request validation schemas
- `src/lib/validation/edge-cases.ts` - Edge case request validation schemas

### API Routes

#### Templates (4 files)
1. `src/app/api/templates/route.ts` - GET (list), POST (create)
2. `src/app/api/templates/[id]/route.ts` - GET, PATCH, DELETE
3. `src/app/api/templates/[id]/duplicate/route.ts` - POST (duplicate)
4. `src/app/api/templates/[id]/scenarios/route.ts` - GET (scenarios for template)

#### Scenarios (4 files)
1. `src/app/api/scenarios/route.ts` - GET (list), POST (create)
2. `src/app/api/scenarios/[id]/route.ts` - GET, PATCH, DELETE
3. `src/app/api/scenarios/[id]/edge-cases/route.ts` - GET (edge cases for scenario)
4. `src/app/api/scenarios/bulk/route.ts` - POST (bulk create)

#### Edge Cases (2 files)
1. `src/app/api/edge-cases/route.ts` - GET (list), POST (create)
2. `src/app/api/edge-cases/[id]/route.ts` - GET, PATCH, DELETE

**Total: 14 files created**

---

## 🔑 Key Features Implemented

### 1. Authentication
- ✅ All endpoints require authentication via Supabase Auth
- ✅ Returns 401 Unauthorized if not authenticated

### 2. Request Validation
- ✅ Zod schemas validate all incoming data
- ✅ Returns 400 Bad Request with detailed validation errors
- ✅ UUID format validation for all ID parameters

### 3. Error Handling
- ✅ Structured JSON error responses
- ✅ Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- ✅ Server-side error logging
- ✅ Foreign key constraint error handling

### 4. Query Parameters
- ✅ Filtering (category, status, quality scores)
- ✅ Pagination (page, limit)
- ✅ Sorting (sortBy, order)
- ✅ Search (q parameter)

### 5. Response Format
- ✅ Success: `{ data: T, message?: string }`
- ✅ Lists: `{ data: T[], pagination: {...} }`
- ✅ Errors: `{ error: string, details?: string[] }`

---

## 🧪 Testing Checklist

### Templates API

#### GET /api/templates
```bash
# Basic list
curl http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl "http://localhost:3000/api/templates?category=Financial&minRating=4" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination and sorting
curl "http://localhost:3000/api/templates?page=1&limit=10&sortBy=name&order=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With search
curl "http://localhost:3000/api/templates?q=customer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/templates
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Customer Service Template",
    "description": "Template for customer service scenarios",
    "category": "Support",
    "structure": "User: {greeting}\nAgent: {response}\nUser: {followup}",
    "variables": [
      {
        "name": "greeting",
        "type": "text",
        "defaultValue": "Hello"
      }
    ],
    "tone": "professional",
    "complexityBaseline": 5
  }'
```

#### GET /api/templates/[id]
```bash
curl http://localhost:3000/api/templates/YOUR_TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PATCH /api/templates/[id]
```bash
curl -X PATCH http://localhost:3000/api/templates/YOUR_TEMPLATE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Template Name",
    "complexityBaseline": 7
  }'
```

#### DELETE /api/templates/[id]
```bash
# Should fail if template has scenarios
curl -X DELETE http://localhost:3000/api/templates/YOUR_TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/templates/[id]/duplicate
```bash
curl -X POST http://localhost:3000/api/templates/YOUR_TEMPLATE_ID/duplicate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "newName": "Copy of Original Template",
    "includeScenarios": false
  }'
```

#### GET /api/templates/[id]/scenarios
```bash
curl http://localhost:3000/api/templates/YOUR_TEMPLATE_ID/scenarios \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Scenarios API

#### GET /api/scenarios
```bash
# Basic list
curl http://localhost:3000/api/scenarios \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl "http://localhost:3000/api/scenarios?templateId=YOUR_TEMPLATE_ID&generationStatus=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With quality filter
curl "http://localhost:3000/api/scenarios?minQualityScore=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/scenarios
```bash
curl -X POST http://localhost:3000/api/scenarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": "YOUR_TEMPLATE_ID",
    "name": "Happy Path Scenario",
    "description": "Standard customer interaction",
    "variableValues": {
      "greeting": "Hi there!",
      "response": "How can I help?"
    },
    "targetComplexity": 5,
    "generationStatus": "draft"
  }'
```

#### GET /api/scenarios/[id]
```bash
curl http://localhost:3000/api/scenarios/YOUR_SCENARIO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PATCH /api/scenarios/[id]
```bash
curl -X PATCH http://localhost:3000/api/scenarios/YOUR_SCENARIO_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "generationStatus": "completed",
    "qualityScore": 8.5,
    "generatedConversation": "User: Hi\nAgent: Hello!"
  }'
```

#### DELETE /api/scenarios/[id]
```bash
curl -X DELETE http://localhost:3000/api/scenarios/YOUR_SCENARIO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/scenarios/bulk
```bash
curl -X POST http://localhost:3000/api/scenarios/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scenarios": [
      {
        "templateId": "YOUR_TEMPLATE_ID",
        "name": "Scenario 1",
        "variableValues": {},
        "targetComplexity": 5
      },
      {
        "templateId": "YOUR_TEMPLATE_ID",
        "name": "Scenario 2",
        "variableValues": {},
        "targetComplexity": 6
      }
    ]
  }'
```

#### GET /api/scenarios/[id]/edge-cases
```bash
curl http://localhost:3000/api/scenarios/YOUR_SCENARIO_ID/edge-cases \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Edge Cases API

#### GET /api/edge-cases
```bash
# Basic list
curl http://localhost:3000/api/edge-cases \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl "http://localhost:3000/api/edge-cases?scenarioId=YOUR_SCENARIO_ID&testStatus=passed&severity=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST /api/edge-cases
```bash
curl -X POST http://localhost:3000/api/edge-cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scenarioId": "YOUR_SCENARIO_ID",
    "name": "Empty Input Test",
    "description": "Test handling of empty user input",
    "triggerCondition": "User provides empty message",
    "expectedBehavior": "System should prompt for valid input",
    "testStatus": "pending",
    "severity": "medium"
  }'
```

#### GET /api/edge-cases/[id]
```bash
curl http://localhost:3000/api/edge-cases/YOUR_EDGE_CASE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PATCH /api/edge-cases/[id]
```bash
curl -X PATCH http://localhost:3000/api/edge-cases/YOUR_EDGE_CASE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "testStatus": "passed",
    "actualResult": "System correctly prompted for input"
  }'
```

#### DELETE /api/edge-cases/[id]
```bash
curl -X DELETE http://localhost:3000/api/edge-cases/YOUR_EDGE_CASE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Query Parameters Reference

### Pagination
- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 25, max: 100)

### Sorting
- `sortBy` - Field to sort by (varies by endpoint)
- `order` - Sort direction: `asc` or `desc` (default: desc)

### Templates
- `category` - Filter by category
- `minRating` - Minimum average rating (0-10)
- `q` - Search in name/description

### Scenarios
- `templateId` - Filter by template UUID
- `generationStatus` - Filter by status: draft, queued, generating, completed, failed
- `minQualityScore` - Minimum quality score (0-10)
- `q` - Search in name/description

### Edge Cases
- `scenarioId` - Filter by scenario UUID
- `testStatus` - Filter by status: pending, tested, passed, failed
- `severity` - Filter by severity: low, medium, high, critical
- `q` - Search in name/description

---

## 🔒 Error Response Examples

### 400 Bad Request (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Template name is required"
    },
    {
      "field": "complexityBaseline",
      "message": "Complexity must be at least 1"
    }
  ]
}
```

### 400 Bad Request (Invalid UUID)
```json
{
  "error": "Invalid template ID format"
}
```

### 400 Bad Request (Foreign Key)
```json
{
  "error": "Invalid template ID",
  "details": "The specified template does not exist"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Template not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create template",
  "details": "Database connection error"
}
```

---

## 🎯 Success Response Examples

### Single Resource
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Customer Service Template",
    "category": "Support",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Template created successfully"
}
```

### List with Pagination
```json
{
  "data": [
    { "id": "...", "name": "Template 1" },
    { "id": "...", "name": "Template 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 42,
    "totalPages": 2
  }
}
```

### Nested Resource List
```json
{
  "data": [
    { "id": "...", "name": "Scenario 1" },
    { "id": "...", "name": "Scenario 2" }
  ],
  "count": 2
}
```

### Bulk Create
```json
{
  "data": [
    { "id": "...", "name": "Scenario 1" },
    { "id": "...", "name": "Scenario 2" }
  ],
  "message": "Successfully created 2 scenario(s)",
  "count": 2
}
```

### Delete Success
```json
{
  "message": "Template deleted successfully"
}
```

---

## 🚀 Next Steps

1. **Test with Postman/Thunder Client:**
   - Import the curl commands above
   - Replace `YOUR_TOKEN` with a valid Supabase auth token
   - Replace UUID placeholders with actual IDs

2. **Test Authentication:**
   - Try accessing endpoints without Authorization header (should return 401)
   - Use expired tokens (should return 401)

3. **Test Validation:**
   - Send invalid data (missing required fields, wrong types)
   - Send invalid UUIDs
   - Send data exceeding max lengths

4. **Test Business Logic:**
   - Try deleting a template with scenarios (should fail)
   - Test foreign key constraints (invalid template_id, scenario_id)
   - Test duplicate template functionality

5. **Test Query Parameters:**
   - Test each filter individually
   - Combine multiple filters
   - Test pagination edge cases (page 0, limit 1000)
   - Test sorting in both directions

6. **Performance Testing:**
   - Create 100+ templates and test pagination
   - Bulk create 50 scenarios at once
   - Test concurrent requests

---

## 📝 Notes

- All endpoints use Supabase Row Level Security (RLS) policies
- Service layer methods are called from API routes (separation of concerns)
- Zod provides runtime type safety and validation
- Error messages are user-friendly but don't expose sensitive information
- All responses use consistent JSON structure
- UUID validation prevents SQL injection attempts

---

## 🛠️ Development Tips

### Getting Auth Token for Testing
```typescript
// In your Next.js frontend or test script
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Testing in Next.js Client Components
```typescript
const response = await fetch('/api/templates', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const result = await response.json();
```

### Handling Errors in Frontend
```typescript
try {
  const response = await fetch('/api/templates', { method: 'POST', body: JSON.stringify(data) });
  
  if (!response.ok) {
    const error = await response.json();
    
    if (error.details && Array.isArray(error.details)) {
      // Handle validation errors
      error.details.forEach(({ field, message }) => {
        console.error(`${field}: ${message}`);
      });
    } else {
      // Handle other errors
      console.error(error.error);
    }
    return;
  }
  
  const result = await response.json();
  console.log('Success:', result.message);
} catch (err) {
  console.error('Network error:', err);
}
```

---

## ✅ Implementation Checklist

- [x] Validation utilities with UUID checking
- [x] Zod schemas for all entities
- [x] Templates CRUD endpoints
- [x] Template duplicate endpoint
- [x] Scenarios CRUD endpoints
- [x] Scenarios bulk create endpoint
- [x] Edge Cases CRUD endpoints
- [x] Nested resource endpoints (templates/[id]/scenarios, scenarios/[id]/edge-cases)
- [x] Authentication on all endpoints
- [x] Request validation with Zod
- [x] Proper HTTP status codes
- [x] Structured error responses
- [x] Query parameter support (filters, pagination, sorting, search)
- [x] No linter errors

**Status: ✅ COMPLETE - Ready for testing**

