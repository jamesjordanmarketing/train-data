// Core data types for the Training Data Generation Platform

export type TierType = 'template' | 'scenario' | 'edge_case';

export type ConversationStatus = 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'none' | 'failed';

export type ConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenCount: number;
};

export type QualityMetrics = {
  overall: number;
  relevance: number;
  accuracy: number;
  naturalness: number;
  methodology: number;
  coherence: number;
  confidence: 'high' | 'medium' | 'low';
  uniqueness: number;
  trainingValue: 'high' | 'medium' | 'low';
};

export type Conversation = {
  id: string;
  title: string;
  persona: string;
  emotion: string;
  tier: TierType;
  category: string[];
  status: ConversationStatus;
  qualityScore: number;
  qualityMetrics?: QualityMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  turns: ConversationTurn[];
  totalTurns: number;
  totalTokens: number;
  parentId?: string; // ID of parent template/scenario
  parentType?: 'template' | 'scenario';
  parameters: Record<string, any>;
  reviewHistory: ReviewAction[];
};

export type ReviewAction = {
  id: string;
  action: 'approved' | 'rejected' | 'revision_requested' | 'generated' | 'moved_to_review';
  performedBy: string;
  timestamp: string;
  comment?: string;
  reasons?: string[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string; // Template text with {{placeholders}}
  variables: TemplateVariable[];
  tone: string;
  complexityBaseline: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold: number;
  requiredElements: string[];
  usageCount: number;
  rating: number;
  lastModified: string;
  createdBy: string;
  // Additional database fields
  tier?: TierType;
  isActive?: boolean;
  version?: number;
  applicablePersonas?: string[];
  applicableEmotions?: string[];
};

export type TemplateVariable = {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[]; // For dropdown type
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  parentTemplateId: string;
  parentTemplateName: string;
  context: string;
  parameterValues: Record<string, any>;
  variationCount: number;
  status: 'draft' | 'active' | 'archived';
  qualityScore: number;
  createdAt: string;
  createdBy: string;
  // New fields for conversation generation
  topic: string;
  persona: string;
  emotionalArc: string;
  generationStatus: 'not_generated' | 'generated' | 'error';
  conversationId?: string; // Reference to generated conversation
  errorMessage?: string;
};

export type EdgeCase = {
  id: string;
  title: string;
  description: string;
  parentScenarioId: string;
  parentScenarioName: string;
  edgeCaseType: 'error_condition' | 'boundary_value' | 'unusual_input' | 'complex_combination' | 'failure_scenario';
  complexity: number;
  testStatus: 'not_tested' | 'passed' | 'failed';
  testResults?: {
    expectedBehavior: string;
    actualBehavior: string;
    passed: boolean;
    testDate: string;
  };
  createdAt: string;
  createdBy: string;
};

export type BatchJob = {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  successfulItems: number;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
  priority: 'high' | 'normal' | 'low';
  items: BatchItem[];
  configuration: {
    tier: TierType;
    sharedParameters: Record<string, any>;
    concurrentProcessing: number;
    errorHandling: 'continue' | 'stop';
  };
};

export type BatchItem = {
  id: string;
  position: number;
  topic: string;
  tier: TierType;
  parameters: Record<string, any>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  conversationId?: string;
  error?: string;
};

export type FilterConfig = {
  tier?: TierType[];
  status?: ConversationStatus[];
  qualityScoreMin?: number;
  qualityScoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  searchQuery?: string;
};

export type CoverageMetrics = {
  totalConversations: number;
  templates: number;
  scenarios: number;
  edgeCases: number;
  approvalRate: number;
  avgQualityScore: number;
  coverageCompleteness: number;
  topicCoverage: TopicCoverageData[];
  qualityDistribution: QualityDistributionBucket[];
  gaps: CoverageGap[];
};

export type TopicCoverageData = {
  topic: string;
  category: string;
  conversationCount: number;
  avgQuality: number;
  complexity: number;
};

export type QualityDistributionBucket = {
  range: string;
  count: number;
  percentage: number;
};

export type CoverageGap = {
  topic: string;
  currentCount: number;
  targetCount: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
};

export type ExportConfig = {
  scope: 'selected' | 'filtered' | 'all';
  format: 'json' | 'jsonl' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  includeParentReferences: boolean;
  includeFullContent: boolean;
};

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  rowsPerPage: number;
  enableAnimations: boolean;
  keyboardShortcutsEnabled: boolean;
  retryConfig?: {
    strategy: 'exponential' | 'linear' | 'fixed';
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    continueOnError: boolean;
  };
};

// Template Testing Types

export type TemplateTestResult = {
  templateId: string;
  testParameters: Record<string, any>;
  resolvedTemplate: string;
  apiResponse: {
    id: string;
    content: string;
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
    };
  } | null;
  qualityScore: number;
  qualityBreakdown: QualityMetrics;
  passedTest: boolean;
  baselineComparison?: {
    avgQualityScore: number;
    deviation: number;
  };
  executionTimeMs: number;
  errors: string[];
  warnings: string[];
  timestamp: string;
};

export type TemplateTestRequest = {
  templateId: string;
  parameters: Record<string, any>;
  compareToBaseline?: boolean;
};

// Template Analytics Types

export type TemplateAnalytics = {
  templateId: string;
  templateName: string;
  tier: TierType;
  usageCount: number;
  avgQualityScore: number;
  approvalRate: number;
  avgExecutionTime: number;
  successRate: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUsed: string;
  topParameters?: Array<{
    name: string;
    frequency: number;
  }>;
};

export type TemplatePerformanceMetrics = {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  avgQualityScore: number;
  qualityTrend: Array<{
    date: string;
    avgScore: number;
    count: number;
  }>;
  parameterUsage: Record<string, number>;
};

export type AnalyticsSummary = {
  totalTemplates: number;
  activeTemplates: number;
  totalUsage: number;
  avgQualityScore: number;
  topPerformers: TemplateAnalytics[];
  bottomPerformers: TemplateAnalytics[];
  usageByTier: {
    template: number;
    scenario: number;
    edge_case: number;
  };
  qualityByTier: {
    template: number;
    scenario: number;
    edge_case: number;
  };
};