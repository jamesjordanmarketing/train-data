import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Check if we're running server-side (Node.js) with service role key
const isServer = typeof window === 'undefined';
const serviceRoleKey = isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

// Use service role key if available (server-side), otherwise use anon key (client-side)
const supabaseKey = serviceRoleKey || publicAnonKey;

// Configure auth options for server vs client
const authOptions = serviceRoleKey
  ? {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  : {};

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey, authOptions);

// Note: Do not re-export server-only factories from this client module.
// API routes should import from '@/lib/supabase/server'.

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
          author_id: string;
          status: 'pending' | 'categorizing' | 'completed';
          file_path: string | null;
          file_size: number | null;
          metadata: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
          author_id: string;
          status?: 'pending' | 'categorizing' | 'completed';
          file_path?: string | null;
          file_size?: number | null;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
          author_id?: string;
          status?: 'pending' | 'categorizing' | 'completed';
          file_path?: string | null;
          file_size?: number | null;
          metadata?: Record<string, any> | null;
        };
      };
      workflow_sessions: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          step: 'A' | 'B' | 'C' | 'complete';
          belonging_rating: number | null;
          selected_category_id: string | null;
          selected_tags: Record<string, string[]>;
          custom_tags: any[];
          is_draft: boolean;
          completed_steps: string[];
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          step?: 'A' | 'B' | 'C' | 'complete';
          belonging_rating?: number | null;
          selected_category_id?: string | null;
          selected_tags?: Record<string, string[]>;
          custom_tags?: any[];
          is_draft?: boolean;
          completed_steps?: string[];
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          step?: 'A' | 'B' | 'C' | 'complete';
          belonging_rating?: number | null;
          selected_category_id?: string | null;
          selected_tags?: Record<string, string[]>;
          custom_tags?: any[];
          is_draft?: boolean;
          completed_steps?: string[];
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          examples: string[];
          is_high_value: boolean;
          impact_description: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          examples: string[];
          is_high_value?: boolean;
          impact_description: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          examples?: string[];
          is_high_value?: boolean;
          impact_description?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tag_dimensions: {
        Row: {
          id: string;
          name: string;
          description: string;
          multi_select: boolean;
          required: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          multi_select?: boolean;
          required?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          multi_select?: boolean;
          required?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          dimension_id: string;
          name: string;
          description: string;
          icon: string | null;
          risk_level: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dimension_id: string;
          name: string;
          description: string;
          icon?: string | null;
          risk_level?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dimension_id?: string;
          name?: string;
          description?: string;
          icon?: string | null;
          risk_level?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_categories: {
        Row: {
          id: string;
          document_id: string;
          category_id: string;
          workflow_session_id: string;
          belonging_rating: number;
          assigned_by: string;
          assigned_at: string;
          is_primary: boolean;
          confidence_score: number | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          category_id: string;
          workflow_session_id: string;
          belonging_rating: number;
          assigned_by: string;
          assigned_at?: string;
          is_primary?: boolean;
          confidence_score?: number | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          category_id?: string;
          workflow_session_id?: string;
          belonging_rating?: number;
          assigned_by?: string;
          assigned_at?: string;
          is_primary?: boolean;
          confidence_score?: number | null;
        };
      };
      document_tags: {
        Row: {
          id: string;
          document_id: string;
          tag_id: string;
          dimension_id: string;
          workflow_session_id: string;
          assigned_by: string;
          assigned_at: string;
          is_custom_tag: boolean;
          custom_tag_data: Record<string, any> | null;
          confidence_score: number | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          tag_id: string;
          dimension_id: string;
          workflow_session_id: string;
          assigned_by: string;
          assigned_at?: string;
          is_custom_tag?: boolean;
          custom_tag_data?: Record<string, any> | null;
          confidence_score?: number | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          tag_id?: string;
          dimension_id?: string;
          workflow_session_id?: string;
          assigned_by?: string;
          assigned_at?: string;
          is_custom_tag?: boolean;
          custom_tag_data?: Record<string, any> | null;
          confidence_score?: number | null;
        };
      };
      custom_tags: {
        Row: {
          id: string;
          dimension_id: string;
          name: string;
          description: string | null;
          created_by: string;
          organization_id: string | null;
          usage_count: number;
          created_at: string;
          updated_at: string;
          is_approved: boolean;
        };
        Insert: {
          id?: string;
          dimension_id: string;
          name: string;
          description?: string | null;
          created_by: string;
          organization_id?: string | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          dimension_id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          organization_id?: string | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
          is_approved?: boolean;
        };
      };
    };
  };
};