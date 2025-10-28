import { useState } from 'react';
import { GitBranch, Plus, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Scenario } from '../../lib/types';

export function ScenariosView() {
  const { scenarios } = useAppStore();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScenarios(scenarios.map(s => s.id));
    } else {
      setSelectedScenarios([]);
    }
  };
  
  const handleSelectScenario = (scenarioId: string, checked: boolean) => {
    if (checked) {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    } else {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    }
  };
  
  const handleGenerateConversation = (scenario: Scenario) => {
    toast.info('Conversation generation coming soon', {
      description: `Generating conversation for "${scenario.name}"`,
    });
  };
  
  const handleBulkGenerate = () => {
    toast.info('Bulk conversation generation coming soon', {
      description: `Generating ${selectedScenarios.length} conversations`,
    });
  };
  
  const getGenerationStatusBadge = (status: Scenario['generationStatus']) => {
    switch (status) {
      case 'generated':
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <CheckCircle className="h-3 w-3" />
            Generated
          </Badge>
        );
      case 'not_generated':
        return (
          <Badge className="bg-gray-100 text-gray-700 gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Generated
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
    }
  };
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Scenarios</h1>
          <p className="text-gray-600">
            Conversation topics with persona and emotional arc combinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedScenarios.length > 0 && (
            <Button onClick={handleBulkGenerate} variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Generate {selectedScenarios.length} Selected
            </Button>
          )}
          <Button onClick={() => toast.info('Scenario creation coming soon')}>
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </div>
      </div>
      
      {selectedScenarios.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={true}
              onCheckedChange={() => setSelectedScenarios([])}
            />
            <span className="text-sm">
              {selectedScenarios.length} scenario{selectedScenarios.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedScenarios([])}
          >
            Clear selection
          </Button>
        </div>
      )}
      
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedScenarios.length === scenarios.length && scenarios.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Emotional Arc</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map((scenario) => (
              <TableRow key={scenario.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedScenarios.includes(scenario.id)}
                    onCheckedChange={(checked) => handleSelectScenario(scenario.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <div>
                      <div>{scenario.name}</div>
                      {scenario.description && (
                        <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{scenario.persona}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{scenario.topic}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">{scenario.emotionalArc}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getGenerationStatusBadge(scenario.generationStatus)}
                    {scenario.generationStatus === 'error' && scenario.errorMessage && (
                      <div className="text-xs text-red-600">{scenario.errorMessage}</div>
                    )}
                    {scenario.generationStatus === 'generated' && scenario.conversationId && (
                      <div className="text-xs text-gray-500">ID: {scenario.conversationId}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm"
                    variant={scenario.generationStatus === 'generated' ? 'outline' : 'default'}
                    onClick={() => handleGenerateConversation(scenario)}
                    className="gap-1"
                  >
                    <Play className="h-3 w-3" />
                    {scenario.generationStatus === 'generated' ? 'Regenerate' : 'Generate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-600">
        Showing {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
