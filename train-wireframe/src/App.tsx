import { useEffect } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { TemplatesView } from './components/views/TemplatesView';
import { ScenariosView } from './components/views/ScenariosView';
import { EdgeCasesView } from './components/views/EdgeCasesView';
import { ReviewQueueView } from './components/views/ReviewQueueView';
import { SettingsView } from './components/views/SettingsView';
import { SingleGenerationForm } from './components/generation/SingleGenerationForm';
import { BatchGenerationModal } from './components/generation/BatchGenerationModal';
import { ExportModal } from './components/dashboard/ExportModal';
import { useAppStore } from './stores/useAppStore';
import { generateInitialMockData } from './lib/mockData';

export default function App() {
  const { 
    currentView,
    setConversations,
    setTemplates,
    setScenarios,
    setEdgeCases,
  } = useAppStore();
  
  // Load mock data on mount
  useEffect(() => {
    const mockData = generateInitialMockData();
    setConversations(mockData.conversations);
    setTemplates(mockData.templates);
    setScenarios(mockData.scenarios);
    setEdgeCases(mockData.edgeCases);
  }, [setConversations, setTemplates, setScenarios, setEdgeCases]);
  
  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'templates':
        return <TemplatesView />;
      case 'scenarios':
        return <ScenariosView />;
      case 'edge_cases':
        return <EdgeCasesView />;
      case 'review':
        return <ReviewQueueView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };
  
  return (
    <DashboardLayout>
      {renderView()}
      
      {/* Modals */}
      <SingleGenerationForm />
      <BatchGenerationModal />
      <ExportModal />
    </DashboardLayout>
  );
}
