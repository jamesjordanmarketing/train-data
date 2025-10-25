// Mock Supabase database structure and data for the Document Categorization System

export interface SupabaseDocument {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  status: 'pending' | 'categorizing' | 'completed';
  file_path?: string;
  file_size?: number;
  metadata?: Record<string, any>;
}

export interface SupabaseWorkflowSession {
  id: string;
  document_id: string;
  user_id: string;
  step: 'A' | 'B' | 'C' | 'complete';
  belonging_rating?: number;
  selected_category_id?: string;
  selected_tags: Record<string, string[]>;
  custom_tags: any[];
  is_draft: boolean;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  is_high_value: boolean;
  impact_description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseTagDimension {
  id: string;
  name: string;
  description: string;
  multi_select: boolean;
  required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseTag {
  id: string;
  dimension_id: string;
  name: string;
  description: string;
  icon?: string;
  risk_level?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProcessingJob {
  id: string;
  workflow_session_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_type: 'ai_training' | 'content_extraction' | 'categorization';
  progress_percentage: number;
  result_data?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  organization_id?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// Mock database tables structure
export const mockSupabaseTables = {
  documents: [
    {
      id: 'doc-1',
      title: 'Complete Customer Onboarding System Blueprint',
      content: '# Customer Onboarding System Blueprint\n\n## Overview\nThis comprehensive document...',
      summary: 'Comprehensive customer onboarding methodology with 7-step framework, proprietary tools, and proven ROI metrics across 500+ implementations.',
      created_at: '2024-12-10T09:00:00Z',
      updated_at: '2024-12-10T09:00:00Z',
      author_id: 'user-1',
      status: 'pending',
      file_size: 25600,
      metadata: {
        word_count: 1250,
        estimated_reading_time: '5 minutes',
        content_type: 'business_methodology'
      }
    },
    {
      id: 'doc-2',
      title: 'Sales Enablement: Competitive Battle Cards',
      content: '# Competitive Battle Cards - Q4 2024\n\n## Overview\nUpdated competitive intelligence...',
      summary: 'Sales enablement battle cards with competitive analysis, objection handling, and win/loss insights for Q4 2024.',
      created_at: '2024-12-08T14:30:00Z',
      updated_at: '2024-12-08T14:30:00Z',
      author_id: 'user-2',
      status: 'pending',
      file_size: 18200,
      metadata: {
        word_count: 890,
        estimated_reading_time: '4 minutes',
        content_type: 'sales_enablement'
      }
    },
    {
      id: 'doc-3',
      title: 'Third Party Research: Industry Trends Report',
      content: '# Industry Trends Report 2024\n*Published by Market Research Associates*...',
      summary: 'Third-party industry trends report covering market analysis, vendor landscape, and customer behavior insights for 2024.',
      created_at: '2024-12-05T11:15:00Z',
      updated_at: '2024-12-05T11:15:00Z',
      author_id: 'external-1',
      status: 'pending',
      file_size: 32100,
      metadata: {
        word_count: 1850,
        estimated_reading_time: '8 minutes',
        content_type: 'market_research'
      }
    }
  ] as SupabaseDocument[],

  categories: [
    {
      id: 'complete-systems',
      name: 'Complete Systems & Methodologies',
      description: 'End-to-end business systems, frameworks, or methodologies that provide comprehensive solutions',
      examples: ['Customer onboarding systems', 'Sales frameworks', 'Implementation methodologies'],
      is_high_value: true,
      impact_description: 'High training value - provides complete business context and methodology',
      sort_order: 1,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 'proprietary-strategies',
      name: 'Proprietary Strategies & Approaches',
      description: 'Unique business strategies, competitive advantages, or innovative approaches specific to your organization',
      examples: ['Competitive positioning strategies', 'Unique value propositions', 'Market differentiation approaches'],
      is_high_value: true,
      impact_description: 'High training value - captures unique competitive intelligence and strategic thinking',
      sort_order: 2,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    }
  ] as SupabaseCategory[],

  tag_dimensions: [
    {
      id: 'authorship',
      name: 'Authorship',
      description: 'Who created or contributed to this content',
      multi_select: false,
      required: true,
      sort_order: 1,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 'format',
      name: 'Content Format',
      description: 'The format and structure of the content',
      multi_select: true,
      required: false,
      sort_order: 2,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 'disclosure-risk',
      name: 'Disclosure Risk',
      description: 'Risk level if this content were to be publicly disclosed',
      multi_select: false,
      required: true,
      sort_order: 3,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    }
  ] as SupabaseTagDimension[],

  tags: [
    {
      id: 'brand',
      dimension_id: 'authorship',
      name: 'Brand/Company',
      description: 'Created by your organization or brand',
      sort_order: 1,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 'team',
      dimension_id: 'authorship',
      name: 'Team Member',
      description: 'Created by internal team members',
      sort_order: 2,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 'risk-1',
      dimension_id: 'disclosure-risk',
      name: 'Level 1 - Minimal Risk',
      description: 'Public-facing content with no confidential information',
      risk_level: 1,
      sort_order: 1,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    }
  ] as SupabaseTag[],

  workflow_sessions: [
    {
      id: 'session-1',
      document_id: 'doc-1',
      user_id: 'user-1',
      step: 'A',
      selected_tags: {},
      custom_tags: [],
      is_draft: true,
      completed_steps: [],
      created_at: '2024-12-10T10:00:00Z',
      updated_at: '2024-12-10T10:00:00Z'
    }
  ] as SupabaseWorkflowSession[],

  processing_jobs: [
    {
      id: 'job-1',
      workflow_session_id: 'session-1',
      status: 'pending',
      processing_type: 'ai_training',
      progress_percentage: 0,
      created_at: '2024-12-10T10:00:00Z',
      updated_at: '2024-12-10T10:00:00Z'
    }
  ] as SupabaseProcessingJob[],

  user_profiles: [
    {
      id: 'user-1',
      email: 'john.doe@company.com',
      full_name: 'John Doe',
      role: 'admin',
      organization_id: 'org-1',
      preferences: {
        auto_save_interval: 30,
        default_category_suggestions: true,
        show_processing_details: false
      },
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-12-10T09:00:00Z',
      last_login_at: '2024-12-10T08:30:00Z'
    },
    {
      id: 'user-2',
      email: 'jane.smith@company.com',
      full_name: 'Jane Smith',
      role: 'user',
      organization_id: 'org-1',
      preferences: {
        auto_save_interval: 60,
        default_category_suggestions: true,
        show_processing_details: true
      },
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-12-08T14:30:00Z',
      last_login_at: '2024-12-08T14:00:00Z'
    }
  ] as SupabaseUserProfile[]
};

// Mock Supabase client functions
export const mockSupabaseClient = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ 
          data: mockSupabaseTables[table as keyof typeof mockSupabaseTables]?.[0] || null, 
          error: null 
        }),
        then: (callback: any) => callback({ 
          data: mockSupabaseTables[table as keyof typeof mockSupabaseTables] || [], 
          error: null 
        })
      }),
      then: (callback: any) => callback({ 
        data: mockSupabaseTables[table as keyof typeof mockSupabaseTables] || [], 
        error: null 
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ 
          data: { id: `new-${Date.now()}`, ...data }, 
          error: null 
        })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { ...data, updated_at: new Date().toISOString() }, 
            error: null 
          })
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ 
        error: null 
      })
    })
  }),
  
  auth: {
    getUser: () => Promise.resolve({
      data: { 
        user: { 
          id: 'user-1', 
          email: 'john.doe@company.com' 
        } 
      },
      error: null
    }),
    signOut: () => Promise.resolve({ error: null })
  },

  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({
        data: { path: `${bucket}/${path}` },
        error: null
      }),
      download: (path: string) => Promise.resolve({
        data: new Blob(['mock file content']),
        error: null
      })
    })
  }
};

// Database schema for reference
export const supabaseSchema = {
  tables: {
    documents: {
      columns: [
        'id (uuid, primary key)',
        'title (text, not null)',
        'content (text)',
        'summary (text)',
        'created_at (timestamptz, default now())',
        'updated_at (timestamptz, default now())',
        'author_id (uuid, references user_profiles.id)',
        'status (text, check in pending|categorizing|completed)',
        'file_path (text)',
        'file_size (integer)',
        'metadata (jsonb)'
      ],
      indexes: [
        'idx_documents_author_id',
        'idx_documents_status',
        'idx_documents_created_at'
      ]
    },
    workflow_sessions: {
      columns: [
        'id (uuid, primary key)',
        'document_id (uuid, references documents.id)',
        'user_id (uuid, references user_profiles.id)',
        'step (text, check in A|B|C|complete)',
        'belonging_rating (integer, check >= 1 and <= 5)',
        'selected_category_id (uuid, references categories.id)',
        'selected_tags (jsonb, default {})',
        'custom_tags (jsonb, default [])',
        'is_draft (boolean, default true)',
        'completed_steps (text[], default [])',
        'created_at (timestamptz, default now())',
        'updated_at (timestamptz, default now())',
        'completed_at (timestamptz)'
      ],
      indexes: [
        'idx_workflow_sessions_document_id',
        'idx_workflow_sessions_user_id',
        'idx_workflow_sessions_status'
      ]
    }
  },
  
  rls_policies: [
    'Users can only access their own workflow sessions',
    'Users can view all documents in their organization',
    'Only admins can create/modify categories and tags',
    'Processing jobs are only visible to document owners'
  ],
  
  functions: [
    'create_workflow_session(document_id uuid, user_id uuid)',
    'update_workflow_progress(session_id uuid, step text, data jsonb)',
    'complete_workflow(session_id uuid)',
    'generate_categorization_report(session_id uuid)'
  ]
};