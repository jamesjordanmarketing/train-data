import { create } from 'zustand';
import { 
  Conversation, 
  Template, 
  Scenario, 
  EdgeCase, 
  BatchJob, 
  FilterConfig, 
  UserPreferences,
  ConversationStatus,
  TierType
} from '../lib/types';

interface BatchGenerationConfig {
  tier: TierType | 'all';
  conversationCount: number;
  errorHandling: 'continue' | 'stop';
  concurrency: number;
  sharedParameters: Record<string, string>;
}

interface BatchGenerationState {
  currentStep: 1 | 2 | 3 | 4;
  config: BatchGenerationConfig;
  jobId: string | null;
  estimatedCost: number;
  estimatedTime: number;
  actualCost: number;
  actualTime: number;
}

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  currentView: 'dashboard' | 'templates' | 'scenarios' | 'edge_cases' | 'review' | 'settings';
  currentTier: TierType | 'all';
  
  // Data State
  conversations: Conversation[];
  templates: Template[];
  scenarios: Scenario[];
  edgeCases: EdgeCase[];
  reviewQueue: Conversation[];
  activeBatchJobs: BatchJob[];
  
  // Filter & Selection State
  filters: FilterConfig;
  searchQuery: string;
  selectedConversationIds: string[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  
  // Modal State
  showGenerationModal: boolean;
  showBatchModal: boolean;
  showExportModal: boolean;
  showConfirmDialog: boolean;
  confirmDialogConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null;
  
  // Batch Generation State
  batchGeneration: BatchGenerationState;
  
  // Loading State
  isLoading: boolean;
  loadingMessage: string;
  
  // User Preferences
  preferences: UserPreferences;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setCurrentTier: (tier: TierType | 'all') => void;
  
  // Data Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  
  setScenarios: (scenarios: Scenario[]) => void;
  addScenario: (scenario: Scenario) => void;
  
  setEdgeCases: (edgeCases: EdgeCase[]) => void;
  addEdgeCase: (edgeCase: EdgeCase) => void;
  
  setReviewQueue: (queue: Conversation[]) => void;
  
  // Filter Actions
  setFilters: (filters: FilterConfig) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Selection Actions
  toggleConversationSelection: (id: string) => void;
  selectAllConversations: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Sort Actions
  setSorting: (column: string, direction: 'asc' | 'desc') => void;
  
  // Modal Actions
  openGenerationModal: () => void;
  closeGenerationModal: () => void;
  openBatchModal: () => void;
  closeBatchModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  showConfirm: (config: AppState['confirmDialogConfig']) => void;
  hideConfirm: () => void;
  
  // Batch Generation Actions
  setBatchStep: (step: 1 | 2 | 3 | 4) => void;
  setBatchConfig: (config: Partial<BatchGenerationConfig>) => void;
  setBatchJobId: (jobId: string | null) => void;
  setBatchEstimates: (cost: number, time: number) => void;
  setBatchActuals: (cost: number, time: number) => void;
  resetBatchGeneration: () => void;
  
  // Loading Actions
  setLoading: (loading: boolean, message?: string) => void;
  
  // Batch Job Actions
  addBatchJob: (job: BatchJob) => void;
  updateBatchJob: (id: string, updates: Partial<BatchJob>) => void;
  removeBatchJob: (id: string) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial UI State
  sidebarCollapsed: false,
  currentView: 'dashboard',
  currentTier: 'all',
  
  // Initial Data State
  conversations: [],
  templates: [],
  scenarios: [],
  edgeCases: [],
  reviewQueue: [],
  activeBatchJobs: [],
  
  // Initial Filter State
  filters: {},
  searchQuery: '',
  selectedConversationIds: [],
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  
  // Initial Modal State
  showGenerationModal: false,
  showBatchModal: false,
  showExportModal: false,
  showConfirmDialog: false,
  confirmDialogConfig: null,
  
  // Initial Batch Generation State
  batchGeneration: {
    currentStep: 1,
    config: {
      tier: 'all',
      conversationCount: 0,
      errorHandling: 'continue',
      concurrency: 3,
      sharedParameters: {},
    },
    jobId: null,
    estimatedCost: 0,
    estimatedTime: 0,
    actualCost: 0,
    actualTime: 0,
  },
  
  // Initial Loading State
  isLoading: false,
  loadingMessage: '',
  
  // Initial Preferences
  preferences: {
    theme: 'light',
    sidebarCollapsed: false,
    tableDensity: 'comfortable',
    rowsPerPage: 25,
    enableAnimations: true,
    keyboardShortcutsEnabled: true,
  },
  
  // UI Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentTier: (tier) => set({ currentTier: tier }),
  
  // Data Actions
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => 
    set((state) => ({ conversations: [conversation, ...state.conversations] })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    })),
  
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({ templates: [template, ...state.templates] })),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  
  setScenarios: (scenarios) => set({ scenarios }),
  addScenario: (scenario) =>
    set((state) => ({ scenarios: [scenario, ...state.scenarios] })),
  
  setEdgeCases: (edgeCases) => set({ edgeCases }),
  addEdgeCase: (edgeCase) =>
    set((state) => ({ edgeCases: [edgeCase, ...state.edgeCases] })),
  
  setReviewQueue: (queue) => set({ reviewQueue: queue }),
  
  // Filter Actions
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () => set({ filters: {}, searchQuery: '' }),
  
  // Selection Actions
  toggleConversationSelection: (id) =>
    set((state) => ({
      selectedConversationIds: state.selectedConversationIds.includes(id)
        ? state.selectedConversationIds.filter((sid) => sid !== id)
        : [...state.selectedConversationIds, id],
    })),
  selectAllConversations: (ids) => set({ selectedConversationIds: ids }),
  clearSelection: () => set({ selectedConversationIds: [] }),
  
  // Sort Actions
  setSorting: (column, direction) => set({ sortColumn: column, sortDirection: direction }),
  
  // Modal Actions
  openGenerationModal: () => set({ showGenerationModal: true }),
  closeGenerationModal: () => set({ showGenerationModal: false }),
  openBatchModal: () => set({ showBatchModal: true }),
  closeBatchModal: () => set({ showBatchModal: false }),
  openExportModal: () => set({ showExportModal: true }),
  closeExportModal: () => set({ showExportModal: false }),
  showConfirm: (config) => set({ showConfirmDialog: true, confirmDialogConfig: config }),
  hideConfirm: () => set({ showConfirmDialog: false, confirmDialogConfig: null }),
  
  // Loading Actions
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  
  // Batch Job Actions
  addBatchJob: (job) =>
    set((state) => ({ activeBatchJobs: [...state.activeBatchJobs, job] })),
  updateBatchJob: (id, updates) =>
    set((state) => ({
      activeBatchJobs: state.activeBatchJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),
  removeBatchJob: (id) =>
    set((state) => ({
      activeBatchJobs: state.activeBatchJobs.filter((j) => j.id !== id),
    })),
  
  // Preferences
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
  
  // Batch Generation Actions
  setBatchStep: (step) =>
    set((state) => ({
      batchGeneration: { ...state.batchGeneration, currentStep: step },
    })),
  setBatchConfig: (config) =>
    set((state) => ({
      batchGeneration: {
        ...state.batchGeneration,
        config: { ...state.batchGeneration.config, ...config },
      },
    })),
  setBatchJobId: (jobId) =>
    set((state) => ({
      batchGeneration: { ...state.batchGeneration, jobId },
    })),
  setBatchEstimates: (cost, time) =>
    set((state) => ({
      batchGeneration: { ...state.batchGeneration, estimatedCost: cost, estimatedTime: time },
    })),
  setBatchActuals: (cost, time) =>
    set((state) => ({
      batchGeneration: { ...state.batchGeneration, actualCost: cost, actualTime: time },
    })),
  resetBatchGeneration: () =>
    set((state) => ({
      batchGeneration: {
        currentStep: 1,
        config: {
          tier: 'all',
          conversationCount: 0,
          errorHandling: 'continue',
          concurrency: 3,
          sharedParameters: {},
        },
        jobId: null,
        estimatedCost: 0,
        estimatedTime: 0,
        actualCost: 0,
        actualTime: 0,
      },
    })),
}));
