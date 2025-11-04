# Chunks-Alpha Integration API Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [TypeScript Types](#typescript-types)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Rate Limits](#rate-limits)

---

## Overview

This document provides comprehensive API reference for the Chunks-Alpha integration endpoints. All endpoints are RESTful and return JSON responses.

### Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

### API Version

Current Version: **v1.0.0**

### Content Type

All requests and responses use `application/json`.

---

## Authentication

All API endpoints require authentication via JWT token in the Authorization header.

### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token

Tokens are issued upon successful login:

```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## API Endpoints

### 1. Link Conversation to Chunk

Links a specific chunk to a conversation, enabling dimension-driven parameter injection.

#### Endpoint

```http
POST /api/conversations/{conversationId}/link-chunk
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | string (UUID) | Yes | ID of the conversation to link |

#### Request Body

```typescript
{
  chunkId: string;  // UUID of the chunk to link
}
```

#### Response (Success)

**Status Code**: `200 OK`

```json
{
  "success": true
}
```

#### Response (Error)

**Status Code**: `400 Bad Request`

```json
{
  "error": "Chunk ID is required"
}
```

**Status Code**: `404 Not Found`

```json
{
  "error": "Chunk not found"
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

#### Example Request

```bash
curl -X POST \
  https://your-app.vercel.app/api/conversations/550e8400-e29b-41d4-a716-446655440000/link-chunk \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "chunkId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

#### Example Response

```json
{
  "success": true
}
```

#### Implementation Details

1. Validates chunk exists in chunks-alpha database
2. Fetches chunk content (truncated to 5000 chars)
3. Retrieves dimensions if available
4. Updates conversation record with:
   - `chunk_id`: Foreign key reference
   - `chunk_content_preview`: First 500 chars of content
   - `dimension_confidence`: Confidence score (0-1)
   - `semantic_dimensions`: JSONB of semantic data

#### Database Changes

```sql
UPDATE conversations 
SET 
  chunk_id = 'chunk-uuid',
  chunk_content_preview = 'chunk content...',
  dimension_confidence = 0.85,
  semantic_dimensions = '{"persona": ["technical-expert"], ...}',
  updated_at = NOW()
WHERE id = 'conversation-uuid';
```

---

### 2. Unlink Chunk from Conversation

Removes the chunk linkage from a conversation, reverting to default parameters.

#### Endpoint

```http
DELETE /api/conversations/{conversationId}/unlink-chunk
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | string (UUID) | Yes | ID of the conversation to unlink |

#### Request Body

None

#### Response (Success)

**Status Code**: `200 OK`

```json
{
  "success": true
}
```

#### Response (Error)

**Status Code**: `500 Internal Server Error`

```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

#### Example Request

```bash
curl -X DELETE \
  https://your-app.vercel.app/api/conversations/550e8400-e29b-41d4-a716-446655440000/unlink-chunk \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Example Response

```json
{
  "success": true
}
```

#### Implementation Details

1. Sets `chunk_id` to NULL
2. Clears `chunk_content_preview`
3. Removes `dimension_confidence`
4. Clears `semantic_dimensions`
5. Updates `updated_at` timestamp

#### Database Changes

```sql
UPDATE conversations 
SET 
  chunk_id = NULL,
  chunk_content_preview = NULL,
  dimension_confidence = NULL,
  semantic_dimensions = NULL,
  updated_at = NOW()
WHERE id = 'conversation-uuid';
```

---

### 3. Get Orphaned Conversations

Retrieves all conversations that are not linked to any chunk.

#### Endpoint

```http
GET /api/conversations/orphaned
```

#### Path Parameters

None

#### Query Parameters

None

#### Request Body

None

#### Response (Success)

**Status Code**: `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Conversation Title",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "status": "draft",
    "user_id": "user-uuid"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Another Conversation",
    "created_at": "2024-01-03T00:00:00Z",
    "updated_at": "2024-01-03T00:00:00Z",
    "status": "generated",
    "user_id": "user-uuid"
  }
]
```

#### Response (Error)

**Status Code**: `500 Internal Server Error`

```json
{
  "error": "Internal server error",
  "details": "Database query failed"
}
```

#### Example Request

```bash
curl -X GET \
  https://your-app.vercel.app/api/conversations/orphaned \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Example Response

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "API Authentication Guide",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "status": "draft",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
]
```

#### Implementation Details

Queries conversations with `chunk_id IS NULL`:

```sql
SELECT id, title, created_at, updated_at, status, user_id
FROM conversations
WHERE chunk_id IS NULL
  AND user_id = 'current-user-id'
ORDER BY created_at DESC;
```

---

### 4. Get Conversation by Chunk

Retrieves all conversations linked to a specific chunk.

#### Endpoint

```http
GET /api/conversations/by-chunk/{chunkId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chunkId | string (UUID) | Yes | ID of the chunk |

#### Request Body

None

#### Response (Success)

**Status Code**: `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Conversation Title",
    "chunk_id": "chunk-uuid",
    "dimension_confidence": 0.85,
    "created_at": "2024-01-01T00:00:00Z",
    "status": "generated"
  }
]
```

#### Response (Error)

**Status Code**: `500 Internal Server Error`

```json
{
  "error": "Internal server error",
  "details": "Database query failed"
}
```

#### Example Request

```bash
curl -X GET \
  https://your-app.vercel.app/api/conversations/by-chunk/123e4567-e89b-12d3-a456-426614174000 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## TypeScript Types

### Core Types

```typescript
/**
 * Chunk reference with basic metadata
 */
export interface ChunkReference {
  id: string;
  title: string;
  content: string;
  documentId: string;
  documentTitle?: string;
  sectionHeading?: string;
  pageStart?: number;
  pageEnd?: number;
}

/**
 * Chunk with dimension analysis
 */
export interface ChunkWithDimensions extends ChunkReference {
  dimensions?: DimensionSource;
}

/**
 * Dimension source data
 */
export interface DimensionSource {
  confidence: number;  // 0-1 scale
  generatedAt: string;  // ISO 8601 timestamp
  semanticDimensions: SemanticDimensions;
  dimensions?: Record<string, number>;  // Raw dimension scores
}

/**
 * Semantic dimension categories
 */
export interface SemanticDimensions {
  domain?: string[];
  audience?: string;
  intent?: string;
  persona?: string[];
  emotion?: string[];
  complexity?: number;  // 0-1 scale
  tone?: string;
}

/**
 * Filter options for chunk queries
 */
export interface ChunkQueryOptions {
  limit?: number;
  offset?: number;
  minQuality?: number;  // Minimum confidence score (0-10 scale)
  category?: string;
  sortBy?: 'relevance' | 'page' | 'created_at';
  includeContent?: boolean;
}

/**
 * API response for link operation
 */
export interface LinkChunkResponse {
  success: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  details?: string;
}

/**
 * Orphaned conversation record
 */
export interface OrphanedConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'generated' | 'reviewed' | 'archived';
  user_id: string;
}
```

### Service Types

```typescript
/**
 * Chunks service configuration
 */
export interface ChunksServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
  useCache?: boolean;
}

/**
 * Cache metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Dimension statistics
 */
export interface DimensionStats {
  hasContent: boolean;
  hasTask: boolean;
  hasCER: boolean;
  hasScenario: boolean;
  confidence: number;
  generatedAt: string;
}
```

### Request/Response Types

```typescript
/**
 * Link chunk request body
 */
export interface LinkChunkRequest {
  chunkId: string;
}

/**
 * Link chunk response
 */
export interface LinkChunkResponse {
  success: boolean;
}

/**
 * Unlink chunk response
 */
export interface UnlinkChunkResponse {
  success: boolean;
}

/**
 * Orphaned conversations response
 */
export type OrphanedConversationsResponse = OrphanedConversation[];

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}
```

---

## Error Handling

### Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Missing or invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User doesn't have permission for this resource |
| 404 | Not Found | Requested chunk or conversation not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |
| 503 | Service Unavailable | Database or external service unavailable |

### Error Response Format

```typescript
{
  error: string;      // Human-readable error message
  details?: string;   // Optional technical details
  code?: string;      // Optional error code
  field?: string;     // Optional field that caused the error
}
```

### Common Error Scenarios

#### 1. Chunk Not Found

```json
{
  "error": "Chunk not found",
  "details": "Chunk with ID '123e4567-e89b-12d3-a456-426614174000' does not exist",
  "code": "CHUNK_NOT_FOUND"
}
```

#### 2. Missing Required Field

```json
{
  "error": "Chunk ID is required",
  "field": "chunkId",
  "code": "VALIDATION_ERROR"
}
```

#### 3. Database Connection Error

```json
{
  "error": "Internal server error",
  "details": "Database connection failed: timeout after 5000ms",
  "code": "DB_CONNECTION_ERROR"
}
```

#### 4. Unauthorized Access

```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired authentication token",
  "code": "AUTH_FAILED"
}
```

### Error Handling Best Practices

**Client-Side Example**:

```typescript
async function linkChunk(conversationId: string, chunkId: string) {
  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/link-chunk`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chunkId }),
      }
    );

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      
      // Handle specific error codes
      switch (response.status) {
        case 400:
          throw new Error(`Validation error: ${error.details}`);
        case 404:
          throw new Error('Chunk not found. Please select a different chunk.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(error.error || 'An unknown error occurred');
      }
    }

    const data: LinkChunkResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to link chunk:', error);
    throw error;
  }
}
```

---

## Code Examples

### Complete Integration Example

```typescript
import { chunksService, ChunkWithDimensions, DimensionSource } from '@/lib/chunks-integration';

/**
 * Complete workflow for linking a chunk to a conversation
 */
async function completeChunkLinkingWorkflow(
  conversationId: string,
  searchQuery: string
) {
  try {
    // 1. Search for relevant chunks
    const chunks: ChunkWithDimensions[] = await chunksService.searchChunks(
      searchQuery,
      {
        limit: 20,
        minQuality: 8,  // High quality only
        includeContent: true,
      }
    );

    if (chunks.length === 0) {
      throw new Error('No high-quality chunks found for this search');
    }

    // 2. Select the best chunk (highest confidence)
    const bestChunk = chunks.reduce((prev, current) => {
      const prevConfidence = prev.dimensions?.confidence || 0;
      const currentConfidence = current.dimensions?.confidence || 0;
      return currentConfidence > prevConfidence ? current : prev;
    });

    console.log(`Selected chunk: ${bestChunk.title}`);
    console.log(`Confidence: ${bestChunk.dimensions?.confidence}`);

    // 3. Link chunk to conversation
    const response = await fetch(
      `/api/conversations/${conversationId}/link-chunk`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chunkId: bestChunk.id }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    // 4. Verify linkage
    const linkedConversation = await fetchConversation(conversationId);
    console.log('Linked successfully!');
    console.log('Dimension confidence:', linkedConversation.dimension_confidence);

    return {
      success: true,
      chunk: bestChunk,
      conversation: linkedConversation,
    };
  } catch (error) {
    console.error('Chunk linking workflow failed:', error);
    throw error;
  }
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface UseChunkLinkingReturn {
  linkChunk: (conversationId: string, chunkId: string) => Promise<void>;
  unlinkChunk: (conversationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * React hook for chunk linking operations
 */
export function useChunkLinking(): UseChunkLinkingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkChunk = useCallback(async (
    conversationId: string,
    chunkId: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/link-chunk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chunkId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Success - could trigger a refetch here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link chunk');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlinkChunk = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/unlink-chunk`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink chunk');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { linkChunk, unlinkChunk, isLoading, error };
}
```

### Dimension Parser Example

```typescript
import { dimensionParser, DimensionSource } from '@/lib/chunks-integration';

/**
 * Example: Extract and use dimension data
 */
function extractDimensionParameters(dimensions: DimensionSource) {
  // Validate dimensions
  if (!dimensionParser.isValid(dimensions)) {
    throw new Error('Invalid dimension data');
  }

  // Check confidence
  if (!dimensionParser.isHighConfidence(dimensions)) {
    console.warn('Low confidence dimensions - results may vary');
  }

  // Extract key parameters
  const persona = dimensionParser.getPrimaryPersona(dimensions);
  const emotion = dimensionParser.getPrimaryEmotion(dimensions);
  const isComplex = dimensionParser.isComplexContent(dimensions);

  // Build generation parameters
  const parameters = {
    persona: persona,
    emotion: emotion,
    complexity: isComplex ? 'high' : 'moderate',
    tone: dimensions.semanticDimensions.tone || 'neutral',
    audience: dimensions.semanticDimensions.audience || 'general',
  };

  // Log summary
  console.log(dimensionParser.getSummary(dimensions));

  return parameters;
}
```

---

## Rate Limits

### Default Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| Link Chunk | 50 requests | 1 minute |
| Unlink Chunk | 50 requests | 1 minute |
| Get Orphaned | 100 requests | 1 minute |
| By Chunk | 100 requests | 1 minute |

### Rate Limit Headers

Response headers include rate limit information:

```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

### Exceeding Rate Limits

**Response when rate limit exceeded**:

```json
{
  "error": "Too many requests",
  "details": "Rate limit of 50 requests per minute exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30
}
```

**Status Code**: `429 Too Many Requests`

### Best Practices

1. **Implement exponential backoff** when retrying failed requests
2. **Cache responses** where appropriate
3. **Batch operations** when possible
4. **Monitor rate limit headers** and adjust request frequency

**Example: Exponential Backoff**

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
) {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('X-RateLimit-Reset') || '1');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000 * Math.pow(2, i)));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
```

---

## Webhooks (Future Enhancement)

### Chunk Dimension Update

**Event**: `chunk.dimension.updated`

**Payload**:
```json
{
  "event": "chunk.dimension.updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "chunkId": "chunk-uuid",
    "runId": "run-uuid",
    "confidence": 0.92,
    "affectedConversations": ["conv-uuid-1", "conv-uuid-2"]
  }
}
```

---

## Support

### API Status

Check API status at: `https://your-app.vercel.app/api/health`

### Contact

- **Technical Support**: api-support@example.com
- **Documentation Issues**: docs@example.com
- **Bug Reports**: GitHub Issues

### Changelog

**v1.0.0** (2024-01-15)
- Initial API release
- Link, unlink, and orphaned endpoints
- Basic rate limiting

---

## License

Copyright © 2024 Your Organization. All rights reserved.

This API documentation is proprietary and confidential.

