import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  Conversation, 
  FilterConfig, 
  ConversationStatus,
  TierType 
} from '@/lib/types/conversations';

interface ConversationState {
  // ============================================================================
  // UI State (persisted in localStorage)
  // ============================================================================
  
  selectedConversationIds: string[];
  filterConfig: FilterConfig;
  sidebarCollapsed: boolean;
  currentView: 'dashboard' | 'templates' | 'scenarios' | 'edge-cases' | 'review-queue' | 'settings';
  
  // ============================================================================
  // Modal State (session-specific, not persisted)
  // ============================================================================
  
  modalState: {
    exportModalOpen: boolean;
    batchGenerationModalOpen: boolean;
    conversationDetailModalOpen: boolean;
    currentConversationId: string | null;
    confirmationDialog: {
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    };
  };
  
  // ============================================================================
  // Loading State
  // ============================================================================
  
  isLoading: boolean;
  loadingMessage: string;
  
  // ============================================================================
  // Selection Actions
  // ============================================================================
  
  /**
   * Toggle selection of a single conversation
   */
  toggleConversationSelection: (id: string) => void;
  
  /**
   * Select all conversations by IDs
   */
  selectAllConversations: (ids: string[]) => void;
  
  /**
   * Clear all selections
   */
  clearSelection: () => void;
  
  // ============================================================================
  // Filter Actions
  // ============================================================================
  
  /**
   * Update filter configuration (partial update)
   */
  setFilterConfig: (config: Partial<FilterConfig>) => void;
  
  /**
   * Reset all filters to default values
   */
  resetFilters: () => void;
  
  // ============================================================================
  // Modal Actions
  // ============================================================================
  
  openExportModal: () => void;
  closeExportModal: () => void;
  openBatchGenerationModal: () => void;
  closeBatchGenerationModal: () => void;
  openConversationDetail: (id: string) => void;
  closeConversationDetail: () => void;
  showConfirm: (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => void;
  hideConfirm: () => void;
  
  // ============================================================================
  // UI Actions
  // ============================================================================
  
  /**
   * Set loading state with optional message
   */
  setLoading: (loading: boolean, message?: string) => void;
  
  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar: () => void;
  
  /**
   * Set current view/section
   */
  setCurrentView: (view: ConversationState['currentView']) => void;
}

/**
 * Conversation Store
 * 
 * Manages client-side UI state for the conversation management interface.
 * Separates concerns between:
 * - Server state (managed by React Query hooks)
 * - Client state (managed here with Zustand)
 * 
 * Persisted State:
 * - Filter configurations
 * - Sidebar collapsed state
 * - Current view
 * 
 * Session State (not persisted):
 * - Selections
 * - Modal states
 * - Loading states
 */
export const useConversationStore = create<ConversationState>()(
  devtools(
    persist(
      (set) => ({
        // ========================================================================
        // Initial State
        // ========================================================================
        
        selectedConversationIds: [],
        filterConfig: {
          tierTypes: [],
          statuses: [],
          qualityRange: undefined,
          dateRange: undefined,
          categories: [],
          personas: [],
          emotions: [],
          searchQuery: '',
          parentId: undefined,
          createdBy: undefined,
        },
        sidebarCollapsed: false,
        currentView: 'dashboard',
        
        modalState: {
          exportModalOpen: false,
          batchGenerationModalOpen: false,
          conversationDetailModalOpen: false,
          currentConversationId: null,
          confirmationDialog: {
            open: false,
            title: '',
            message: '',
            onConfirm: () => {},
          },
        },
        
        isLoading: false,
        loadingMessage: '',
        
        // ========================================================================
        // Selection Actions
        // ========================================================================
        
        toggleConversationSelection: (id: string) =>
          set((state) => ({
            selectedConversationIds: state.selectedConversationIds.includes(id)
              ? state.selectedConversationIds.filter((sid) => sid !== id)
              : [...state.selectedConversationIds, id],
          }), false, 'toggleConversationSelection'),
        
        selectAllConversations: (ids: string[]) =>
          set({ selectedConversationIds: ids }, false, 'selectAllConversations'),
        
        clearSelection: () =>
          set({ selectedConversationIds: [] }, false, 'clearSelection'),
        
        // ========================================================================
        // Filter Actions
        // ========================================================================
        
        setFilterConfig: (config: Partial<FilterConfig>) =>
          set((state) => ({
            filterConfig: { ...state.filterConfig, ...config },
          }), false, 'setFilterConfig'),
        
        resetFilters: () =>
          set({
            filterConfig: {
              tierTypes: [],
              statuses: [],
              qualityRange: undefined,
              dateRange: undefined,
              categories: [],
              personas: [],
              emotions: [],
              searchQuery: '',
              parentId: undefined,
              createdBy: undefined,
            },
          }, false, 'resetFilters'),
        
        // ========================================================================
        // Modal Actions
        // ========================================================================
        
        openExportModal: () =>
          set((state) => ({
            modalState: { ...state.modalState, exportModalOpen: true },
          }), false, 'openExportModal'),
        
        closeExportModal: () =>
          set((state) => ({
            modalState: { ...state.modalState, exportModalOpen: false },
          }), false, 'closeExportModal'),
        
        openBatchGenerationModal: () =>
          set((state) => ({
            modalState: { ...state.modalState, batchGenerationModalOpen: true },
          }), false, 'openBatchGenerationModal'),
        
        closeBatchGenerationModal: () =>
          set((state) => ({
            modalState: { ...state.modalState, batchGenerationModalOpen: false },
          }), false, 'closeBatchGenerationModal'),
        
        openConversationDetail: (id: string) =>
          set((state) => ({
            modalState: { 
              ...state.modalState, 
              conversationDetailModalOpen: true,
              currentConversationId: id,
            },
          }), false, 'openConversationDetail'),
        
        closeConversationDetail: () =>
          set((state) => ({
            modalState: { 
              ...state.modalState, 
              conversationDetailModalOpen: false,
              currentConversationId: null,
            },
          }), false, 'closeConversationDetail'),
        
        showConfirm: (
          title: string, 
          message: string, 
          onConfirm: () => void,
          onCancel?: () => void
        ) =>
          set((state) => ({
            modalState: {
              ...state.modalState,
              confirmationDialog: {
                open: true,
                title,
                message,
                onConfirm,
                onCancel,
              },
            },
          }), false, 'showConfirm'),
        
        hideConfirm: () =>
          set((state) => ({
            modalState: {
              ...state.modalState,
              confirmationDialog: {
                open: false,
                title: '',
                message: '',
                onConfirm: () => {},
              },
            },
          }), false, 'hideConfirm'),
        
        // ========================================================================
        // UI Actions
        // ========================================================================
        
        setLoading: (loading: boolean, message = '') =>
          set({ isLoading: loading, loadingMessage: message }, false, 'setLoading'),
        
        toggleSidebar: () =>
          set((state) => ({ 
            sidebarCollapsed: !state.sidebarCollapsed 
          }), false, 'toggleSidebar'),
        
        setCurrentView: (view: ConversationState['currentView']) =>
          set({ currentView: view }, false, 'setCurrentView'),
      }),
      {
        name: 'conversation-storage',
        // Only persist user preferences, not session-specific state
        partialize: (state) => ({
          filterConfig: state.filterConfig,
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
        }),
      }
    ),
    {
      name: 'ConversationStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for optimized rendering
 * Use these to subscribe to specific slices of state
 */

export const useSelectedConversationIds = () =>
  useConversationStore((state) => state.selectedConversationIds);

export const useFilterConfig = () =>
  useConversationStore((state) => state.filterConfig);

export const useModalState = () =>
  useConversationStore((state) => state.modalState);

export const useLoadingState = () =>
  useConversationStore((state) => ({
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
  }));

