/**
 * API Client Examples
 * TypeScript/JavaScript examples for consuming the Template Management API
 * from Next.js client components or external applications
 */

// ============================================================================
// SETUP: Type Definitions
// ============================================================================

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  structure: string;
  variables: TemplateVariable[];
  tone: string;
  complexityBaseline: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold: number;
  requiredElements: string[];
  averageRating?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[];
}

interface Scenario {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  variableValues: Record<string, any>;
  contextNotes?: string;
  targetComplexity: number;
  expectedOutcome?: string;
  generationStatus: 'draft' | 'queued' | 'generating' | 'completed' | 'failed';
  generatedConversation?: string;
  qualityScore?: number;
  generationMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface EdgeCase {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;
  triggerCondition: string;
  expectedBehavior: string;
  testStatus: 'pending' | 'tested' | 'passed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actualResult?: string;
  notes?: string;
  testMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  error: string;
  details?: any;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class TemplateManagementAPI {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseUrl: string = '', getAuthToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ApiException(error.error, response.status, error.details);
    }

    return response.json();
  }

  // ========================================================================
  // TEMPLATES
  // ========================================================================

  async getTemplates(params?: {
    category?: string;
    minRating?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiListResponse<Template>> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.minRating) query.set('minRating', params.minRating.toString());
    if (params?.search) query.set('q', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request<ApiListResponse<Template>>(
      `/api/templates${queryString ? `?${queryString}` : ''}`
    );
  }

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.request<ApiResponse<Template>>(`/api/templates/${id}`);
  }

  async createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'averageRating'>): Promise<ApiResponse<Template>> {
    return this.request<ApiResponse<Template>>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<ApiResponse<Template>> {
    return this.request<ApiResponse<Template>>(`/api/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: string, newName?: string, includeScenarios: boolean = false): Promise<ApiResponse<Template>> {
    return this.request<ApiResponse<Template>>(`/api/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName, includeScenarios }),
    });
  }

  async getTemplateScenarios(templateId: string): Promise<{ data: Scenario[]; count: number }> {
    return this.request<{ data: Scenario[]; count: number }>(`/api/templates/${templateId}/scenarios`);
  }

  // ========================================================================
  // SCENARIOS
  // ========================================================================

  async getScenarios(params?: {
    templateId?: string;
    generationStatus?: string;
    minQualityScore?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiListResponse<Scenario>> {
    const query = new URLSearchParams();
    if (params?.templateId) query.set('templateId', params.templateId);
    if (params?.generationStatus) query.set('generationStatus', params.generationStatus);
    if (params?.minQualityScore) query.set('minQualityScore', params.minQualityScore.toString());
    if (params?.search) query.set('q', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request<ApiListResponse<Scenario>>(
      `/api/scenarios${queryString ? `?${queryString}` : ''}`
    );
  }

  async getScenario(id: string): Promise<ApiResponse<Scenario>> {
    return this.request<ApiResponse<Scenario>>(`/api/scenarios/${id}`);
  }

  async createScenario(data: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Scenario>> {
    return this.request<ApiResponse<Scenario>>('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScenario(id: string, data: Partial<Scenario>): Promise<ApiResponse<Scenario>> {
    return this.request<ApiResponse<Scenario>>(`/api/scenarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteScenario(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/scenarios/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateScenarios(scenarios: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ data: Scenario[]; message: string; count: number }> {
    return this.request<{ data: Scenario[]; message: string; count: number }>('/api/scenarios/bulk', {
      method: 'POST',
      body: JSON.stringify({ scenarios }),
    });
  }

  async getScenarioEdgeCases(scenarioId: string): Promise<{ data: EdgeCase[]; count: number }> {
    return this.request<{ data: EdgeCase[]; count: number }>(`/api/scenarios/${scenarioId}/edge-cases`);
  }

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  async getEdgeCases(params?: {
    scenarioId?: string;
    testStatus?: string;
    severity?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiListResponse<EdgeCase>> {
    const query = new URLSearchParams();
    if (params?.scenarioId) query.set('scenarioId', params.scenarioId);
    if (params?.testStatus) query.set('testStatus', params.testStatus);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.search) query.set('q', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.order) query.set('order', params.order);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request<ApiListResponse<EdgeCase>>(
      `/api/edge-cases${queryString ? `?${queryString}` : ''}`
    );
  }

  async getEdgeCase(id: string): Promise<ApiResponse<EdgeCase>> {
    return this.request<ApiResponse<EdgeCase>>(`/api/edge-cases/${id}`);
  }

  async createEdgeCase(data: Omit<EdgeCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EdgeCase>> {
    return this.request<ApiResponse<EdgeCase>>('/api/edge-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEdgeCase(id: string, data: Partial<EdgeCase>): Promise<ApiResponse<EdgeCase>> {
    return this.request<ApiResponse<EdgeCase>>(`/api/edge-cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEdgeCase(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/edge-cases/${id}`, {
      method: 'DELETE',
    });
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }

  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// ============================================================================
// USAGE EXAMPLES IN NEXT.JS CLIENT COMPONENTS
// ============================================================================

// Example 1: Initialize API client with Supabase auth
/*
'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const api = new TemplateManagementAPI('', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
});
*/

// Example 2: Fetch and display templates
/*
async function loadTemplates() {
  try {
    const response = await api.getTemplates({
      category: 'Financial',
      sortBy: 'name',
      order: 'asc',
      page: 1,
      limit: 10,
    });

    console.log(`Found ${response.pagination.total} templates`);
    console.log(`Page ${response.pagination.page} of ${response.pagination.totalPages}`);
    
    response.data.forEach((template) => {
      console.log(`- ${template.name} (${template.category})`);
    });
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.isAuthError()) {
        console.error('Please log in');
      } else if (error.isValidationError()) {
        console.error('Invalid parameters:', error.details);
      } else {
        console.error('API Error:', error.message);
      }
    }
  }
}
*/

// Example 3: Create a new template
/*
async function createNewTemplate() {
  try {
    const response = await api.createTemplate({
      name: 'Customer Support Template',
      category: 'Support',
      structure: 'User: {greeting}\nAgent: {response}',
      variables: [
        {
          name: 'greeting',
          type: 'text',
          defaultValue: 'Hello',
        },
      ],
      tone: 'professional',
      complexityBaseline: 5,
      qualityThreshold: 6.0,
      requiredElements: ['greeting', 'closing'],
    });

    console.log('Created template:', response.data.id);
    console.log(response.message);
  } catch (error) {
    if (error instanceof ApiException && error.isValidationError()) {
      console.error('Validation errors:', error.details);
    }
  }
}
*/

// Example 4: Update scenario generation status
/*
async function updateScenarioStatus(scenarioId: string) {
  try {
    await api.updateScenario(scenarioId, {
      generationStatus: 'completed',
      qualityScore: 8.5,
      generatedConversation: 'User: Hello\nAgent: Hi! How can I help?',
    });
    
    console.log('Scenario updated successfully');
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.isNotFoundError()) {
        console.error('Scenario not found');
      }
    }
  }
}
*/

// Example 5: Bulk create scenarios
/*
async function createMultipleScenarios(templateId: string) {
  try {
    const response = await api.bulkCreateScenarios([
      {
        templateId,
        name: 'Happy Path',
        variableValues: { greeting: 'Hi' },
        targetComplexity: 5,
        generationStatus: 'draft',
      },
      {
        templateId,
        name: 'Angry Customer',
        variableValues: { greeting: 'I need help NOW!' },
        targetComplexity: 8,
        generationStatus: 'draft',
      },
    ]);

    console.log(response.message);
    console.log(`Created ${response.count} scenarios`);
  } catch (error) {
    console.error('Failed to create scenarios:', error);
  }
}
*/

// Example 6: Get template with its scenarios
/*
async function getTemplateWithScenarios(templateId: string) {
  try {
    const [templateResponse, scenariosResponse] = await Promise.all([
      api.getTemplate(templateId),
      api.getTemplateScenarios(templateId),
    ]);

    console.log('Template:', templateResponse.data.name);
    console.log(`Has ${scenariosResponse.count} scenarios`);
    
    scenariosResponse.data.forEach((scenario) => {
      console.log(`  - ${scenario.name} (${scenario.generationStatus})`);
    });
  } catch (error) {
    console.error('Failed to load template:', error);
  }
}
*/

// Example 7: Search templates with debouncing (React example)
/*
import { useState, useEffect } from 'react';

function TemplateSearch() {
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) return;
      
      setLoading(true);
      try {
        const response = await api.getTemplates({ search: query });
        setTemplates(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search templates..."
      />
      {loading && <p>Loading...</p>}
      {templates.map((t) => (
        <div key={t.id}>{t.name}</div>
      ))}
    </div>
  );
}
*/

// Example 8: Pagination with React
/*
function TemplateList() {
  const [page, setPage] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, [page]);

  async function loadTemplates() {
    try {
      const response = await api.getTemplates({ page, limit: 25 });
      setTemplates(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  return (
    <div>
      {templates.map((t) => (
        <div key={t.id}>{t.name}</div>
      ))}
      
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      
      <span>Page {page} of {pagination?.totalPages}</span>
      
      <button
        disabled={page === pagination?.totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
*/

export { TemplateManagementAPI, ApiException };
export type {
  Template,
  TemplateVariable,
  Scenario,
  EdgeCase,
  ApiResponse,
  ApiListResponse,
  ApiError,
};

