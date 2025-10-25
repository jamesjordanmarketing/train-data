import { supabase } from './supabase';
import { Chunk, ChunkDimensions, ChunkRun, PromptTemplate, ChunkExtractionJob, ChunkType } from '../types/chunks';

export const chunkService = {
  // Create a new chunk
  async createChunk(chunk: Omit<Chunk, 'id' | 'created_at' | 'updated_at'>): Promise<Chunk> {
    const { data, error } = await supabase
      .from('chunks')
      .insert(chunk)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all chunks for a document
  async getChunksByDocument(documentId: string): Promise<Chunk[]> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('char_start', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get single chunk by ID
  async getChunkById(chunkId: string): Promise<Chunk | null> {
    const { data, error } = await supabase
      .from('chunks')
      .select('*')
      .eq('id', chunkId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get chunk count for a document
  async getChunkCount(documentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId);
    
    if (error) throw error;
    return count || 0;
  },

  // Delete all chunks for a document (for regeneration)
  async deleteChunksByDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('chunks')
      .delete()
      .eq('document_id', documentId);
    
    if (error) throw error;
  },

  // Get document metadata by ID (for dimension generation)
  async getDocumentById(documentId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

export const chunkDimensionService = {
  // Create dimension record
  async createDimensions(dimensions: Omit<ChunkDimensions, 'id' | 'generated_at'>): Promise<ChunkDimensions> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .insert(dimensions)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get dimensions for a specific chunk and run
  async getDimensionsByChunkAndRun(chunkId: string, runId: string): Promise<ChunkDimensions | null> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('chunk_id', chunkId)
      .eq('run_id', runId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get all dimensions for a run
  async getDimensionsByRun(runId: string): Promise<ChunkDimensions[]> {
    const { data, error } = await supabase
      .from('chunk_dimensions')
      .select('*')
      .eq('run_id', runId)
      .order('generated_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

export const chunkRunService = {
  // Create a new run
  async createRun(run: Omit<ChunkRun, 'id' | 'run_id' | 'started_at'>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .insert({
        ...run,
        run_id: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all runs for a document
  async getRunsByDocument(documentId: string): Promise<ChunkRun[]> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .select('*')
      .eq('document_id', documentId)
      .order('started_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update run status and metrics
  async updateRun(runId: string, updates: Partial<ChunkRun>): Promise<ChunkRun> {
    const { data, error } = await supabase
      .from('chunk_runs')
      .update(updates)
      .eq('run_id', runId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const promptTemplateService = {
  // Get active templates for a chunk type
  async getActiveTemplates(chunkType?: ChunkType): Promise<PromptTemplate[]> {
    let query = supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true);
    
    if (chunkType) {
      // Match templates that either:
      // 1. Have NULL applicable_chunk_types (applies to all chunk types), OR
      // 2. Contain this specific chunk type in their array
      query = query.or(`applicable_chunk_types.is.null,applicable_chunk_types.cs.{${chunkType}}`);
    }
    
    const { data, error } = await query.order('template_type');
    
    if (error) throw error;
    return data || [];
  },

  // Get template by name
  async getTemplateByName(templateName: string): Promise<PromptTemplate | null> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get all active templates
  async getAllActiveTemplates(): Promise<PromptTemplate[]> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_type');
    
    if (error) throw error;
    return data || [];
  },

  // Get all templates (for testing)
  async getAllTemplates(): Promise<PromptTemplate[]> {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

export const chunkExtractionJobService = {
  // Create extraction job
  async createJob(documentId: string, userId: string | null): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .insert({
        document_id: documentId,
        created_by: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update job status
  async updateJob(jobId: string, updates: Partial<ChunkExtractionJob>): Promise<ChunkExtractionJob> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get job by document
  async getJobByDocument(documentId: string): Promise<ChunkExtractionJob | null> {
    const { data, error } = await supabase
      .from('chunk_extraction_jobs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Alias for getJobByDocument
  async getLatestJob(documentId: string): Promise<ChunkExtractionJob | null> {
    return this.getJobByDocument(documentId);
  }
};
