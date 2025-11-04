import { supabase } from './supabase';
import { Document, CategorySelection, TagDimension } from '../stores/workflow-store';

// Document operations
export const documentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Category operations
export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Tag operations
export const tagService = {
  async getDimensions() {
    const { data, error } = await supabase
      .from('tag_dimensions')
      .select(`
        *,
        tags (*)
      `)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getTagsByDimension(dimensionId: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('dimension_id', dimensionId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// Workflow session operations
export const workflowService = {
  async createSession(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .insert({
        document_id: documentId,
        user_id: userId,
        step: 'A',
        selected_tags: {},
        custom_tags: [],
        is_draft: true,
        completed_steps: []
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSession(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async completeSession(sessionId: string, finalData: any) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .update({
        ...finalData,
        step: 'complete',
        is_draft: false,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's workflow sessions
  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .select(`
        *,
        documents (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Complete workflow and save all data to normalized tables
   * Note: This performs multiple database operations. While not a true transaction,
   * errors will be thrown if any step fails.
   */
  async completeWorkflow(params: {
    workflowSessionId: string;
    documentId: string;
    userId: string;
    categoryId: string;
    belongingRating: number;
    tags: Array<{ tagId: string; dimensionId: string }>;
    customTags?: Array<{ dimensionId: string; name: string; description?: string }>;
  }) {
    try {
      // Step 0: Clean up any existing normalized data for this document
      // This allows resubmission without duplicate key errors
      await supabase
        .from('document_categories')
        .delete()
        .eq('document_id', params.documentId);
      
      await supabase
        .from('document_tags')
        .delete()
        .eq('document_id', params.documentId);
      
      // Step 1: Assign category
      await documentCategoryService.assignCategory({
        documentId: params.documentId,
        categoryId: params.categoryId,
        belongingRating: params.belongingRating,
        workflowSessionId: params.workflowSessionId,
        assignedBy: params.userId,
        isPrimary: true
      });

      // Step 2: Find or create custom tags (with deduplication and usage tracking)
      const customTagIds: string[] = [];
      if (params.customTags && params.customTags.length > 0) {
        for (const customTag of params.customTags) {
          // Use findOrCreateCustomTag to handle deduplication and usage count
          const tag = await customTagService.findOrCreateCustomTag({
            dimensionId: customTag.dimensionId,
            name: customTag.name,
            description: customTag.description,
            createdBy: params.userId
          });
          customTagIds.push(tag.id);
        }
      }

      // Step 3: Prepare all tags (standard + custom)
      const allTags = [
        ...params.tags,
        ...customTagIds.map((tagId, index) => ({
          tagId,
          dimensionId: params.customTags![index].dimensionId,
          isCustomTag: true
        }))
      ];

      // Step 4: Assign all tags
      if (allTags.length > 0) {
        await documentTagService.assignTags({
          documentId: params.documentId,
          tags: allTags,
          workflowSessionId: params.workflowSessionId,
          assignedBy: params.userId
        });
      }

      // Step 5: Update workflow session
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_sessions')
        .update({
          step: 'complete',
          is_draft: false,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.workflowSessionId)
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Step 6: Update document status
      const { error: docError } = await supabase
        .from('documents')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.documentId);

      if (docError) throw docError;

      return workflowData;
    } catch (error) {
      // If any step fails, throw the error
      // Note: Supabase client doesn't support transactions, so partial data may exist
      console.error('Error completing workflow:', error);
      throw error;
    }
  },

  /**
   * Get complete workflow data with all related entities
   */
  async getWorkflowWithRelations(workflowSessionId: string) {
    // Get workflow session
    const { data: session, error: sessionError } = await supabase
      .from('workflow_sessions')
      .select('*')
      .eq('id', workflowSessionId)
      .single();

    if (sessionError) throw sessionError;

    // Get document category
    const category = await documentCategoryService.getDocumentCategory(session.document_id);

    // Get document tags
    const tags = await documentTagService.getDocumentTags(session.document_id);

    return {
      session,
      category,
      tags
    };
  }
};

// Analytics and reporting
export const analyticsService = {
  async getWorkflowStats() {
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('status');
    
    if (docError) throw docError;

    const { data: sessions, error: sessionError } = await supabase
      .from('workflow_sessions')
      .select('step, is_draft, completed_at');
    
    if (sessionError) throw sessionError;

    return {
      totalDocuments: documents.length,
      pendingDocuments: documents.filter(d => d.status === 'pending').length,
      inProgressDocuments: documents.filter(d => d.status === 'categorizing').length,
      completedDocuments: documents.filter(d => d.status === 'completed').length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => !s.is_draft).length,
      averageCompletionTime: this.calculateAverageCompletionTime(sessions.filter(s => s.completed_at))
    };
  },

  calculateAverageCompletionTime(completedSessions: any[]) {
    if (completedSessions.length === 0) return 0;
    
    const totalTime = completedSessions.reduce((acc, session) => {
      const start = new Date(session.created_at).getTime();
      const end = new Date(session.completed_at).getTime();
      return acc + (end - start);
    }, 0);
    
    return Math.round(totalTime / completedSessions.length / (1000 * 60)); // minutes
  }
};

// User authentication and profile
export const userService = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserPreferences(userId: string, preferences: Record<string, any>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// File upload and storage
export const fileService = {
  async uploadDocument(file: File, userId: string) {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    // Create document record
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        file_path: uploadData.path,
        file_size: file.size,
        author_id: userId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (documentError) throw documentError;
    return documentData;
  },

  async downloadDocument(path: string) {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path);
    
    if (error) throw error;
    return data;
  }
};

/**
 * Document Category Service
 * Manages category assignments for documents in the normalized database
 */
export const documentCategoryService = {
  /**
   * Assign a primary category to a document
   */
  async assignCategory(params: {
    documentId: string;
    categoryId: string;
    belongingRating: number;
    workflowSessionId: string;
    assignedBy: string;
    isPrimary?: boolean;
    confidenceScore?: number;
  }) {
    const { data, error } = await supabase
      .from('document_categories')
      .insert({
        document_id: params.documentId,
        category_id: params.categoryId,
        belonging_rating: params.belongingRating,
        workflow_session_id: params.workflowSessionId,
        assigned_by: params.assignedBy,
        is_primary: params.isPrimary ?? true,
        confidence_score: params.confidenceScore ?? null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an existing category assignment
   */
  async updateCategory(params: {
    documentId: string;
    categoryId?: string;
    belongingRating?: number;
  }) {
    const updateData: any = {};
    if (params.categoryId !== undefined) updateData.category_id = params.categoryId;
    if (params.belongingRating !== undefined) updateData.belonging_rating = params.belongingRating;

    const { data, error } = await supabase
      .from('document_categories')
      .update(updateData)
      .eq('document_id', params.documentId)
      .eq('is_primary', true)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get category assignment for a document with full category details
   */
  async getDocumentCategory(documentId: string) {
    const { data, error } = await supabase
      .from('document_categories')
      .select(`
        *,
        categories (*)
      `)
      .eq('document_id', documentId)
      .eq('is_primary', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

/**
 * Document Tag Service
 * Manages tag assignments for documents in the normalized database
 */
export const documentTagService = {
  /**
   * Assign multiple tags to a document
   */
  async assignTags(params: {
    documentId: string;
    tags: Array<{ tagId: string; dimensionId: string; isCustomTag?: boolean; customTagData?: any }>;
    workflowSessionId: string;
    assignedBy: string;
  }) {
    const tagRecords = params.tags.map(tag => ({
      document_id: params.documentId,
      tag_id: tag.tagId,
      dimension_id: tag.dimensionId,
      workflow_session_id: params.workflowSessionId,
      assigned_by: params.assignedBy,
      is_custom_tag: tag.isCustomTag ?? false,
      custom_tag_data: tag.customTagData ?? null
    }));

    const { data, error } = await supabase
      .from('document_tags')
      .insert(tagRecords)
      .select();
    
    if (error) throw error;
    return data;
  },

  /**
   * Replace all tags for a document (delete existing, insert new)
   */
  async replaceTags(params: {
    documentId: string;
    tags: Array<{ tagId: string; dimensionId: string; isCustomTag?: boolean; customTagData?: any }>;
    workflowSessionId: string;
    assignedBy: string;
  }) {
    // First delete existing tags
    const { error: deleteError } = await supabase
      .from('document_tags')
      .delete()
      .eq('document_id', params.documentId);
    
    if (deleteError) throw deleteError;

    // Then insert new tags
    return this.assignTags(params);
  },

  /**
   * Get all tags for a document with full tag and dimension details
   * Returns both raw array and grouped by dimension
   */
  async getDocumentTags(documentId: string) {
    const { data, error } = await supabase
      .from('document_tags')
      .select(`
        *,
        tags (*),
        tag_dimensions (*)
      `)
      .eq('document_id', documentId);
    
    if (error) throw error;

    // Group by dimension
    const byDimension: Record<string, any[]> = {};
    if (data) {
      data.forEach(tagAssignment => {
        const dimensionId = tagAssignment.dimension_id;
        if (!byDimension[dimensionId]) {
          byDimension[dimensionId] = [];
        }
        byDimension[dimensionId].push(tagAssignment);
      });
    }

    return {
      raw: data || [],
      byDimension
    };
  },

  /**
   * Remove specific tags from a document
   */
  async removeTags(documentId: string, tagIds: string[]) {
    const { data, error } = await supabase
      .from('document_tags')
      .delete()
      .eq('document_id', documentId)
      .in('tag_id', tagIds)
      .select();
    
    if (error) throw error;
    return data;
  }
};

/**
 * Custom Tag Service
 * Manages custom tags created by users
 */
export const customTagService = {
  /**
   * Create a new custom tag
   */
  async createCustomTag(params: {
    dimensionId: string;
    name: string;
    description?: string;
    createdBy: string;
    organizationId?: string;
  }) {
    const { data, error } = await supabase
      .from('custom_tags')
      .insert({
        dimension_id: params.dimensionId,
        name: params.name,
        description: params.description ?? null,
        created_by: params.createdBy,
        organization_id: params.organizationId ?? null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get custom tags with optional filters
   */
  async getCustomTags(params?: {
    organizationId?: string;
    dimensionId?: string;
  }) {
    let query = supabase
      .from('custom_tags')
      .select('*');

    if (params?.organizationId) {
      query = query.eq('organization_id', params.organizationId);
    }
    if (params?.dimensionId) {
      query = query.eq('dimension_id', params.dimensionId);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Increment the usage count for a custom tag
   */
  async incrementUsage(customTagId: string) {
    const { data, error } = await supabase
      .rpc('increment_custom_tag_usage', { tag_id: customTagId });
    
    if (error) throw error;
    return data;
  },

  /**
   * Find existing custom tag or create new one (deduplication)
   * This prevents duplicate custom tags and maintains accurate usage counts
   */
  async findOrCreateCustomTag(params: {
    dimensionId: string;
    name: string;
    description?: string;
    createdBy: string;
    organizationId?: string;
  }) {
    // First, check if a custom tag with this name already exists in this dimension
    const { data: existingTag, error: findError } = await supabase
      .from('custom_tags')
      .select('*')
      .eq('dimension_id', params.dimensionId)
      .ilike('name', params.name.trim())  // Case-insensitive match, trimmed
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      throw findError;
    }
    
    if (existingTag) {
      // Tag already exists - increment usage count and return it
      console.log(`Reusing existing custom tag: ${existingTag.name} (ID: ${existingTag.id})`);
      
      // Increment usage count
      await this.incrementUsage(existingTag.id);
      
      return existingTag;
    }
    
    // Tag doesn't exist - create new one
    console.log(`Creating new custom tag: ${params.name}`);
    const newTag = await this.createCustomTag(params);
    
    // Set initial usage count to 1
    await this.incrementUsage(newTag.id);
    
    return newTag;
  }
};

// Initialize database with mock data (for development)
export const initializeDatabase = async () => {
  try {
    // Check if categories exist
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (!existingCategories || existingCategories.length === 0) {
      console.log('Initializing database with mock data...');
      
      // Note: In a real environment, this would be handled by migrations
      // For this MVP, we're using the mock data from our local files
      console.log('Database initialization complete (using local mock data)');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

/**
 * Conversation-to-Chunk Association Service
 * Manages relationships between conversations and source chunks from chunks-alpha module
 */
export const conversationChunkService = {
  /**
   * Get all conversations linked to a specific chunk
   * @param chunkId - The chunk ID to query
   * @returns Array of conversations associated with the chunk
   */
  async getConversationsByChunk(chunkId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('parent_chunk_id', chunkId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get orphaned conversations (no chunk link)
   * Excludes draft and archived conversations
   * @returns Array of conversations without chunk associations
   */
  async getOrphanedConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .is('parent_chunk_id', null)
      .not('status', 'in', '(draft,archived)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Link a conversation to a source chunk
   * Updates conversation with chunk association, cached context, and dimension metadata
   * @param conversationId - The conversation ID to update
   * @param chunkId - The chunk ID to link to
   * @param chunkContext - Optional cached chunk content for performance
   * @param dimensionSource - Optional dimension metadata from semantic analysis
   */
  async linkConversationToChunk(
    conversationId: string,
    chunkId: string,
    chunkContext?: string,
    dimensionSource?: {
      chunkId: string;
      dimensions: Record<string, number>;
      confidence: number;
      extractedAt: string;
      semanticDimensions?: {
        persona?: string[];
        emotion?: string[];
        complexity?: number;
        domain?: string[];
      };
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({
        parent_chunk_id: chunkId,
        chunk_context: chunkContext || null,
        dimension_source: dimensionSource || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
    
    if (error) throw error;
  },

  /**
   * Remove chunk association from a conversation
   * Clears chunk ID, cached context, and dimension metadata
   * @param conversationId - The conversation ID to update
   */
  async unlinkConversationFromChunk(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({
        parent_chunk_id: null,
        chunk_context: null,
        dimension_source: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
    
    if (error) throw error;
  }
};

// Chunk-related services
export { 
  chunkService, 
  chunkDimensionService, 
  chunkRunService, 
  promptTemplateService, 
  chunkExtractionJobService 
} from './chunk-service';

// API response logging
export { apiResponseLogService } from './api-response-log-service';