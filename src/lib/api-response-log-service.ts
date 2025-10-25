import { supabase } from './supabase';

export interface ApiResponseLog {
  id?: string;
  timestamp?: string;
  chunk_id: string;
  run_id: string | null;
  template_type: string;
  template_name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  prompt: string;
  chunk_text_preview: string | null;
  document_category: string | null;
  claude_response: any;
  parsed_successfully: boolean;
  extraction_error: string | null;
  dimensions_extracted: any;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  created_at?: string;
}

export const apiResponseLogService = {
  /**
   * Create a new API response log entry
   * Non-blocking - failures will not interrupt dimension generation
   */
  async createLog(log: Omit<ApiResponseLog, 'id' | 'timestamp' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .insert(log)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create API response log:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Unexpected error creating API response log:', error);
      return null;
    }
  },

  /**
   * Get all logs for a specific chunk
   */
  async getLogsByChunk(chunkId: string): Promise<ApiResponseLog[]> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .select('*')
        .eq('chunk_id', chunkId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch logs by chunk:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching logs by chunk:', error);
      return [];
    }
  },

  /**
   * Get all logs for a specific run
   */
  async getLogsByRun(runId: string): Promise<ApiResponseLog[]> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .select('*')
        .eq('run_id', runId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch logs by run:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching logs by run:', error);
      return [];
    }
  }
};

