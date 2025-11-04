import { useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { TemplatesView } from './components/views/TemplatesView';
import { ScenariosView } from './components/views/ScenariosView';
import { EdgeCasesView } from './components/views/EdgeCasesView';
import { ReviewQueueView } from './components/views/ReviewQueueView';
import { QualityFeedbackView } from './components/views/QualityFeedbackView';
import { SettingsView } from './components/views/SettingsView';
import { AIConfigView } from './components/views/AIConfigView';
import { DatabaseHealthView } from './components/views/DatabaseHealthView';
import { SingleGenerationForm } from './components/generation/SingleGenerationForm';
import { BatchGenerationModal } from './components/generation/BatchGenerationModal';
import { ExportModal } from './components/dashboard/ExportModal';
import { useAppStore } from './stores/useAppStore';
import { generateInitialMockData } from './lib/mockData';
import { initializeTheme } from './lib/theme';
import { 
  ErrorBoundary,
  DashboardErrorBoundary,
  TemplatesErrorBoundary,
  ReviewQueueErrorBoundary,
  SettingsErrorBoundary,
  GenerationErrorBoundary,
  ExportErrorBoundary,
  ModalErrorBoundary,
} from './components/errors';

export default function App() {
  const { 
    currentView,
    setConversations,
    setTemplates,
    setScenarios,
    setEdgeCases,
    loadPreferences,
    subscribeToPreferences,
    unsubscribeFromPreferences,
    preferences,
    preferencesLoaded,
  } = useAppStore();
  
  // Load mock data on mount
  useEffect(() => {
    const mockData = generateInitialMockData();
    setConversations(mockData.conversations);
    setTemplates(mockData.templates);
    setScenarios(mockData.scenarios);
    setEdgeCases(mockData.edgeCases);
  }, [setConversations, setTemplates, setScenarios, setEdgeCases]);
  
  // Load user preferences on mount and subscribe to real-time updates
  useEffect(() => {
    // Load preferences from database
    loadPreferences();
    
    // Subscribe to real-time preference changes (useful for multi-tab sync)
    subscribeToPreferences();
    
    // Cleanup: unsubscribe on unmount
    return () => {
      unsubscribeFromPreferences();
    };
  }, [loadPreferences, subscribeToPreferences, unsubscribeFromPreferences]);
  
  // Apply theme when preferences loaded or changed
  useEffect(() => {
    if (!preferencesLoaded) return;
    
    const cleanup = initializeTheme(preferences.theme);
    
    return cleanup;
  }, [preferences.theme, preferencesLoaded]);
  
  // Render current view with feature-specific error boundaries
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardErrorBoundary>
            <DashboardView />
          </DashboardErrorBoundary>
        );
      case 'templates':
        return (
          <TemplatesErrorBoundary>
            <TemplatesView />
          </TemplatesErrorBoundary>
        );
      case 'scenarios':
        return (
          <ErrorBoundary>
            <ScenariosView />
          </ErrorBoundary>
        );
      case 'edge_cases':
        return (
          <ErrorBoundary>
            <EdgeCasesView />
          </ErrorBoundary>
        );
      case 'review':
        return (
          <ReviewQueueErrorBoundary>
            <ReviewQueueView />
          </ReviewQueueErrorBoundary>
        );
      case 'feedback':
        return (
          <ErrorBoundary>
            <QualityFeedbackView />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <SettingsErrorBoundary>
            <SettingsView />
          </SettingsErrorBoundary>
        );
      case 'ai-config':
        return (
          <SettingsErrorBoundary>
            <AIConfigView />
          </SettingsErrorBoundary>
        );
      case 'database':
        return (
          <ErrorBoundary>
            <DatabaseHealthView />
          </ErrorBoundary>
        );
      default:
        return (
          <DashboardErrorBoundary>
            <DashboardView />
          </DashboardErrorBoundary>
        );
    }
  };
  
  return (
    <ErrorBoundary>
      <DashboardLayout>
        {renderView()}
        
        {/* Modals wrapped in error boundaries */}
        <ModalErrorBoundary>
          <GenerationErrorBoundary>
            <SingleGenerationForm />
          </GenerationErrorBoundary>
        </ModalErrorBoundary>
        
        <ModalErrorBoundary>
          <GenerationErrorBoundary>
            <BatchGenerationModal />
          </GenerationErrorBoundary>
        </ModalErrorBoundary>
        
        <ModalErrorBoundary>
          <ExportErrorBoundary>
            <ExportModal />
          </ExportErrorBoundary>
        </ModalErrorBoundary>
      </DashboardLayout>
    </ErrorBoundary>
  );
}
