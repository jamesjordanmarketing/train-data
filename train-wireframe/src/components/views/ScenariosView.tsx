import { useState, useEffect } from 'react';
import { GitBranch, Plus, Play, CheckCircle, XCircle, AlertCircle, Upload, Trash2, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Scenario, Template } from '../../lib/types';
import { ScenarioCreateModal } from '../scenarios/ScenarioCreateModal';
import { ScenarioBulkImportModal } from '../scenarios/ScenarioBulkImportModal';

export function ScenariosView() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    templateId: 'all',
    status: 'all',
    generationStatus: 'all',
  });

  useEffect(() => {
    fetchTemplates();
    fetchScenarios();
  }, [filters]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.data || data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.templateId !== 'all') params.append('templateId', filters.templateId);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.generationStatus !== 'all') params.append('generationStatus', filters.generationStatus);

      const response = await fetch(`/api/scenarios?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setScenarios(data.data || data.scenarios || []);
      } else {
        throw new Error(data.error || 'Failed to fetch scenarios');
      }
    } catch (error: any) {
      toast.error('Failed to load scenarios');
      console.error(error);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(scenarios.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} scenarios? This cannot be undone.`)) {
      return;
    }

    const deletePromises = Array.from(selectedIds).map(id =>
      fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
    );

    try {
      await Promise.all(deletePromises);
      toast.success(`${selectedIds.size} scenarios deleted`);
      setSelectedIds(new Set());
      fetchScenarios();
    } catch (error) {
      toast.error('Failed to delete some scenarios');
      console.error(error);
    }
  };

  const handleGenerate = async (id: string) => {
    setGeneratingIds(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch('/api/conversations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: id }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Conversation generation started');
        fetchScenarios(); // Refresh to show updated status
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start generation');
      console.error(error);
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Generate conversations for ${selectedIds.size} scenarios? This may take some time.`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const id of Array.from(selectedIds)) {
      try {
        const response = await fetch('/api/conversations/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: id }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error(`Failed to generate for scenario ${id}:`, error);
      }
    }

    toast.success(`Generated ${successCount} conversations${failCount > 0 ? `, ${failCount} failed` : ''}`);
    setSelectedIds(new Set());
    fetchScenarios();
  };

  const handleCreateSuccess = (scenario: Scenario) => {
    fetchScenarios();
  };

  const handleImportSuccess = (importedScenarios: Scenario[]) => {
    fetchScenarios();
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

  const getStatusBadge = (status: Scenario['status']) => {
    const variants: Record<string, { className: string }> = {
      draft: { className: 'bg-gray-100 text-gray-700' },
      active: { className: 'bg-blue-100 text-blue-700' },
      archived: { className: 'bg-orange-100 text-orange-700' },
    };

    return (
      <Badge className={variants[status]?.className || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading scenarios...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Scenarios</h1>
          <p className="text-gray-600">
            Conversation topics with persona and emotional arc combinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button 
                onClick={handleBulkGenerate} 
                variant="outline" 
                className="gap-2"
                disabled={selectedIds.size > 50}
              >
                <Play className="h-4 w-4" />
                Generate {selectedIds.size} Selected
              </Button>
              <Button 
                onClick={handleBulkDelete} 
                variant="outline" 
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          <Button onClick={() => setImportModalOpen(true)} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Template:</label>
          <Select value={filters.templateId} onValueChange={(value) => setFilters(prev => ({ ...prev, templateId: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Generation:</label>
          <Select value={filters.generationStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, generationStatus: value }))}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="not_generated">Not Generated</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(filters.templateId !== 'all' || filters.status !== 'all' || filters.generationStatus !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilters({ templateId: 'all', status: 'all', generationStatus: 'all' })}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Selection Banner */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={true}
              onCheckedChange={() => setSelectedIds(new Set())}
            />
            <span className="text-sm">
              {selectedIds.size} scenario{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            {selectedIds.size > 50 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Selection limited to 50 for bulk operations
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.size === scenarios.length && scenarios.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Emotional Arc</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Generation</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  No scenarios found. Create your first scenario or import from CSV.
                </TableCell>
              </TableRow>
            ) : (
              scenarios.map((scenario) => (
                <TableRow key={scenario.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.has(scenario.id)}
                      onCheckedChange={(checked) => handleSelectOne(scenario.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        {scenario.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                            {scenario.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {scenario.parentTemplateName}
                    </Badge>
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
                    {getStatusBadge(scenario.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getGenerationStatusBadge(scenario.generationStatus)}
                      {scenario.generationStatus === 'error' && scenario.errorMessage && (
                        <div className="text-xs text-red-600 max-w-xs truncate" title={scenario.errorMessage}>
                          {scenario.errorMessage}
                        </div>
                      )}
                      {scenario.generationStatus === 'generated' && scenario.conversationId && (
                        <div className="text-xs text-gray-500 font-mono">
                          {scenario.conversationId.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm"
                      variant={scenario.generationStatus === 'generated' ? 'outline' : 'default'}
                      onClick={() => handleGenerate(scenario.id)}
                      className="gap-1"
                      disabled={generatingIds.has(scenario.id)}
                    >
                      <Play className="h-3 w-3" />
                      {generatingIds.has(scenario.id) 
                        ? 'Generating...' 
                        : scenario.generationStatus === 'generated' 
                          ? 'Regenerate' 
                          : 'Generate'
                      }
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-4">
          <span>
            {scenarios.filter(s => s.generationStatus === 'generated').length} generated
          </span>
          <span>•</span>
          <span>
            {scenarios.filter(s => s.generationStatus === 'not_generated').length} pending
          </span>
          <span>•</span>
          <span>
            {scenarios.filter(s => s.generationStatus === 'error').length} errors
          </span>
        </div>
      </div>

      {/* Modals */}
      <ScenarioCreateModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ScenarioBulkImportModal 
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
