import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Dimension key mapping for frontend → database UUID conversion
 * Maps frontend string keys to database dimension UUIDs
 */
const dimensionKeyMap: Record<string, string> = {
  'authorship': '550e8400-e29b-41d4-a716-446655440003',
  'format': '550e8400-e29b-41d4-a716-446655440004',
  'disclosure-risk': '550e8400-e29b-41d4-a716-446655440005',
  'intended-use': '550e8400-e29b-41d4-a716-446655440006',
  'evidence-type': '550e8400-e29b-41d4-a716-446655440021',
  'audience-level': '550e8400-e29b-41d4-a716-446655440022',
  'gating-level': '550e8400-e29b-41d4-a716-446655440023'
};

export interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  authorId: string;
  status: 'pending' | 'categorizing' | 'completed';
}

export interface CategorySelection {
  id: string;
  name: string;
  description: string;
  examples: string[];
  isHighValue: boolean;
  impact: string;
  detailedDescription?: string;
  processingStrategy?: string;
  businessValueClassification?: string;
  usageAnalytics?: {
    totalSelections: number;
    recentActivity: number;
  };
  valueDistribution?: {
    highValue: number;
    mediumValue: number;
    standardValue: number;
  };
}

export interface TagDimension {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  multiSelect: boolean;
  required: boolean;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  icon?: string;
  riskLevel?: number;
}

export interface WorkflowState {
  // Current workflow state
  currentStep: 'A' | 'B' | 'C' | 'complete';
  currentDocument: Document | null;
  
  // Step A: Statement of Belonging
  belongingRating: number | null;
  
  // Step B: Primary Category Selection
  selectedCategory: CategorySelection | null;
  
  // Step C: Secondary Tags
  selectedTags: Record<string, string[]>;
  customTags: Tag[];
  
  // Progress and validation
  completedSteps: string[];
  validationErrors: Record<string, string>;
  isDraft: boolean;
  lastSaved: string | null;
  
  // Actions
  setCurrentDocument: (document: Document) => void;
  setCurrentStep: (step: 'A' | 'B' | 'C' | 'complete') => void;
  setBelongingRating: (rating: number) => void;
  setSelectedCategory: (category: CategorySelection) => void;
  setSelectedTags: (dimensionId: string, tags: string[]) => void;
  addCustomTag: (dimensionId: string, tag: Tag) => void;
  markStepComplete: (step: string) => void;
  validateStep: (step: string) => boolean;
  saveDraft: () => Promise<void>;
  resetWorkflow: () => void;
  submitWorkflow: () => Promise<string | void>;
  loadExistingWorkflow: (documentId: string) => Promise<void>;
  
  // Transformation helpers for normalized database
  getTagsForSubmission: () => Array<{ tagId: string; dimensionId: string }>;
  loadTagsFromNormalized: (tags: Array<{ tag_id: string; dimension_id: string }>) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'A',
      currentDocument: null,
      belongingRating: null,
      selectedCategory: null,
      selectedTags: {},
      customTags: [],
      completedSteps: [],
      validationErrors: {},
      isDraft: false,
      lastSaved: null,

      // Actions
      setCurrentDocument: (document) => {
        set({ currentDocument: document, currentStep: 'A' });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setBelongingRating: (rating) => {
        set({ belongingRating: rating, isDraft: true });
        // Call async saveDraft but don't await to avoid blocking
        get().saveDraft().catch(error => console.error('Auto-save failed:', error));
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category, isDraft: true });
        // Call async saveDraft but don't await to avoid blocking
        get().saveDraft().catch(error => console.error('Auto-save failed:', error));
      },

      setSelectedTags: (dimensionId, tags) => {
        const selectedTags = { ...get().selectedTags };
        selectedTags[dimensionId] = tags;
        set({ selectedTags, isDraft: true });
        // Call async saveDraft but don't await to avoid blocking
        get().saveDraft().catch(error => console.error('Auto-save failed:', error));
      },

      addCustomTag: (dimensionId, tag) => {
        const customTags = [...get().customTags, tag];
        const selectedTags = { ...get().selectedTags };
        if (!selectedTags[dimensionId]) {
          selectedTags[dimensionId] = [];
        }
        selectedTags[dimensionId].push(tag.id);
        set({ customTags, selectedTags, isDraft: true });
        // Call async saveDraft but don't await to avoid blocking
        get().saveDraft().catch(error => console.error('Auto-save failed:', error));
      },

      markStepComplete: (step) => {
        const completedSteps = [...get().completedSteps];
        if (!completedSteps.includes(step)) {
          completedSteps.push(step);
        }
        set({ completedSteps });
      },

      validateStep: (step) => {
        const state = get();
        const errors: Record<string, string> = {};

        switch (step) {
          case 'A':
            if (state.belongingRating === null) {
              errors.belongingRating = 'Please provide a relationship rating';
            }
            break;
          case 'B':
            if (!state.selectedCategory) {
              errors.selectedCategory = 'Please select a primary category';
            }
            break;
          case 'C':
            // Check required tag dimensions
            const requiredDimensions = ['authorship', 'disclosure-risk', 'intended-use'];
            requiredDimensions.forEach(dim => {
              if (!state.selectedTags[dim] || state.selectedTags[dim].length === 0) {
                errors[dim] = `Please select at least one ${dim.replace('-', ' ')} tag`;
              }
            });
            break;
        }

        set({ validationErrors: errors });
        return Object.keys(errors).length === 0;
      },

      saveDraft: async () => {
        const state = get();
        
        try {
          // Get auth token from Supabase auth
          let token = null;
          try {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.access_token;
          } catch (e) {
            console.warn('Could not get auth token from Supabase session');
          }
          
          if (!token) {
            console.warn('User not authenticated, cannot save draft');
            return;
          }
          
          // Make real API call to save draft
          const response = await fetch('/api/workflow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              action: 'save_draft',
              documentId: state.currentDocument?.id,
              belongingRating: state.belongingRating,
              selectedCategory: state.selectedCategory,
              selectedTags: state.selectedTags,
              customTags: state.customTags,
              step: state.currentStep
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ 
                isDraft: true, 
                lastSaved: new Date().toISOString() 
              });
            }
          } else {
            console.error('Failed to save draft');
          }
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      },

      resetWorkflow: () => {
        set({
          currentStep: 'A',
          belongingRating: null,
          selectedCategory: null,
          selectedTags: {},
          customTags: [],
          completedSteps: [],
          validationErrors: {},
          isDraft: false,
          lastSaved: null,
        });
      },

      submitWorkflow: async () => {
        const state = get();
        
        try {
          // Get auth token from Supabase auth
          let token = null;
          try {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.access_token;
          } catch (e) {
            console.warn('Could not get auth token from Supabase session');
          }
          
          if (!token) {
            throw new Error('User not authenticated');
          }
        
          // Make real API call to submit workflow
          const response = await fetch('/api/workflow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              action: 'submit',
              documentId: state.currentDocument?.id,
              belongingRating: state.belongingRating,
              selectedCategory: state.selectedCategory,
              selectedTags: state.selectedTags,
              customTags: state.customTags,
              step: state.currentStep
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit workflow');
          }

          const data = await response.json();
          
          if (data.success) {
            // Mark as complete
            set({ 
              currentStep: 'complete',
              isDraft: false,
              completedSteps: ['A', 'B', 'C'],
              lastSaved: new Date().toISOString()
            });
            
            // Return workflow ID so it can be used in redirect
            return data.workflowId;
          } else {
            throw new Error(data.error || 'Submission failed');
          }
        } catch (error) {
          console.error('Failed to submit workflow:', error);
          throw error;
        }
      },

      loadExistingWorkflow: async (documentId: string) => {
        try {
          // Get auth token from Supabase auth
          let token = null;
          try {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.access_token;
          } catch (e) {
            console.warn('Could not get auth token from Supabase session');
          }
          
          if (!token) {
            console.warn('User not authenticated, cannot load existing workflow');
            return;
          }
          
          // Check if there's an existing workflow session for this document
          const response = await fetch(`/api/workflow/session?documentId=${documentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.session) {
              const session = data.session;
              // Load the existing workflow state
              set({
                currentStep: session.step as 'A' | 'B' | 'C' | 'complete',
                belongingRating: session.belonging_rating,
                selectedCategory: session.selected_category_id ? {
                  id: session.selected_category_id,
                  // We'd need to fetch category details, for now just use basic info
                  name: 'Loaded Category',
                  description: '',
                  examples: [],
                  isHighValue: false,
                  impact: ''
                } : null,
                selectedTags: session.selected_tags || {},
                customTags: session.custom_tags || [],
                completedSteps: session.completed_steps || [],
                isDraft: session.is_draft,
                lastSaved: session.updated_at
              });
            }
          }
        } catch (error) {
          console.error('Error loading existing workflow:', error);
        }
      },

      /**
       * Transform store tags format to API submission format
       * Used when submitting workflow to API
       * Converts: { 'dimension-key': ['tag-uuid'] } → [{ tagId: 'uuid', dimensionId: 'uuid' }]
       */
      getTagsForSubmission: () => {
        const state = get();
        const result: Array<{ tagId: string; dimensionId: string }> = [];
        
        for (const [dimensionKey, tagIds] of Object.entries(state.selectedTags)) {
          const dimensionId = dimensionKeyMap[dimensionKey];
          
          if (!dimensionId) {
            console.warn(`Unknown dimension key during submission: ${dimensionKey}`);
            continue;
          }
          
          if (Array.isArray(tagIds)) {
            for (const tagId of tagIds) {
              result.push({ tagId, dimensionId });
            }
          }
        }
        
        return result;
      },

      /**
       * Load tags from normalized database format into store format
       * Used when loading existing workflow data from normalized tables
       * Converts: [{ tag_id: 'uuid', dimension_id: 'uuid' }] → { 'dimension-key': ['tag-uuid'] }
       */
      loadTagsFromNormalized: (tags: Array<{ tag_id: string; dimension_id: string }>) => {
        const grouped: Record<string, string[]> = {};
        
        // Reverse map: UUID → key
        const dimensionIdToKey = Object.entries(dimensionKeyMap).reduce(
          (acc, [key, id]) => ({ ...acc, [id]: key }),
          {} as Record<string, string>
        );
        
        tags.forEach(tag => {
          const dimensionKey = dimensionIdToKey[tag.dimension_id];
          if (!dimensionKey) {
            console.warn(`Unknown dimension ID when loading: ${tag.dimension_id}`);
            return;
          }
          
          if (!grouped[dimensionKey]) {
            grouped[dimensionKey] = [];
          }
          grouped[dimensionKey].push(tag.tag_id);
        });
        
        set({ selectedTags: grouped });
      },
    }),
    {
      name: 'document-workflow-storage',
      partialize: (state) => ({
        currentDocument: state.currentDocument,
        belongingRating: state.belongingRating,
        selectedCategory: state.selectedCategory,
        selectedTags: state.selectedTags,
        customTags: state.customTags,
        completedSteps: state.completedSteps,
        isDraft: state.isDraft,
        lastSaved: state.lastSaved,
      }),
    }
  )
);