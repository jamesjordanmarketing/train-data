import { AlertTriangle, Plus, CheckCircle, XCircle, Play, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { EdgeCase } from '../../lib/types';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { EdgeCaseCreateModal, TestExecutionModal } from '../edge-cases';

type EdgeCaseType = 'error_condition' | 'boundary_value' | 'unusual_input' | 'complex_combination' | 'failure_scenario';
type TestStatus = 'not_tested' | 'passed' | 'failed';

const edgeCaseTypeColors = {
  error_condition: 'bg-red-100 text-red-700 border-red-300',
  boundary_value: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  unusual_input: 'bg-purple-100 text-purple-700 border-purple-300',
  complex_combination: 'bg-blue-100 text-blue-700 border-blue-300',
  failure_scenario: 'bg-orange-100 text-orange-700 border-orange-300',
};

const edgeCaseTypeLabels: Record<EdgeCaseType, string> = {
  error_condition: 'Error Conditions',
  boundary_value: 'Boundary Values',
  unusual_input: 'Unusual Inputs',
  complex_combination: 'Complex Combinations',
  failure_scenario: 'Failure Scenarios',
};

export function EdgeCasesView() {
  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedEdgeCase, setSelectedEdgeCase] = useState<EdgeCase | null>(null);

  const [filters, setFilters] = useState({
    type: 'all' as EdgeCaseType | 'all',
    testStatus: 'all' as TestStatus | 'all',
  });

  useEffect(() => {
    fetchEdgeCases();
  }, [filters]);

  const fetchEdgeCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.testStatus !== 'all') params.append('testStatus', filters.testStatus);

      const response = await fetch(`/api/edge-cases?${params.toString()}`);
      const data = await response.json();
      setEdgeCases(data.data || data.edgeCases || []);
    } catch (error) {
      toast.error('Failed to load edge cases');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (edgeCase: EdgeCase) => {
    setEdgeCases(prev => [edgeCase, ...prev]);
  };

  const handleTestSuccess = (updatedEdgeCase: EdgeCase) => {
    setEdgeCases(prev => 
      prev.map(ec => ec.id === updatedEdgeCase.id ? updatedEdgeCase : ec)
    );
  };

  const handleTest = (edgeCase: EdgeCase) => {
    setSelectedEdgeCase(edgeCase);
    setTestModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete edge case "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/edge-cases/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('Edge case deleted');
        setEdgeCases(prev => prev.filter(ec => ec.id !== id));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete edge case');
      }
    } catch (error) {
      toast.error('Failed to delete edge case');
      console.error(error);
    }
  };

  const getTypeColor = (type: EdgeCaseType): string => {
    return edgeCaseTypeColors[type] || 'bg-white border-gray-300';
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity <= 3) return 'text-green-600';
    if (complexity <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEdgeCases = edgeCases.filter(ec => {
    if (filters.type !== 'all' && ec.edgeCaseType !== filters.type) return false;
    if (filters.testStatus !== 'all' && ec.testStatus !== filters.testStatus) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Edge Cases</h1>
          <p className="text-gray-600">
            Unusual situations and boundary conditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Auto-generate coming soon')}>
            Auto-Generate Edge Cases
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Edge Case
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700">Filter by Type:</p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filters.type === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
            >
              All Types
            </Button>
            {(Object.keys(edgeCaseTypeLabels) as EdgeCaseType[]).map(type => (
              <Button
                key={type}
                variant={filters.type === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, type }))}
              >
                {edgeCaseTypeLabels[type]}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2 text-gray-700">Filter by Test Status:</p>
          <div className="flex gap-2">
            <Button
              variant={filters.testStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, testStatus: 'all' }))}
            >
              All Statuses
            </Button>
            <Button
              variant={filters.testStatus === 'not_tested' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, testStatus: 'not_tested' }))}
            >
              Not Tested
            </Button>
            <Button
              variant={filters.testStatus === 'passed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, testStatus: 'passed' }))}
            >
              Passed
            </Button>
            <Button
              variant={filters.testStatus === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, testStatus: 'failed' }))}
            >
              Failed
            </Button>
          </div>
        </div>
      </div>

      {/* Edge Cases Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredEdgeCases.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No edge cases found</h3>
          <p className="text-gray-600 mb-4">
            {filters.type !== 'all' || filters.testStatus !== 'all'
              ? 'Try adjusting your filters or create a new edge case.'
              : 'Create your first edge case to get started.'}
          </p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Edge Case
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredEdgeCases.length} edge case{filteredEdgeCases.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEdgeCases.map((edgeCase) => (
              <Card 
                key={edgeCase.id} 
                className={`p-4 hover:shadow-lg transition-shadow border-2 ${getTypeColor(edgeCase.edgeCaseType)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <div className="flex items-center gap-2">
                    {edgeCase.testStatus === 'passed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {edgeCase.testStatus === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>

                <h3 className="font-semibold mb-2 text-sm line-clamp-2">{edgeCase.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {edgeCase.description}
                </p>

                <div className="space-y-2 mb-4">
                  <Badge className={edgeCaseTypeColors[edgeCase.edgeCaseType]}>
                    {edgeCase.edgeCaseType.replace(/_/g, ' ')}
                  </Badge>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${getComplexityColor(edgeCase.complexity)}`}>
                      Complexity: {edgeCase.complexity}/10
                    </span>
                    {getStatusBadge(edgeCase.testStatus)}
                  </div>

                  <div className="text-xs text-gray-500">
                    Scenario: {edgeCase.parentScenarioName.slice(0, 30)}
                    {edgeCase.parentScenarioName.length > 30 ? '...' : ''}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleTest(edgeCase)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(edgeCase.id, edgeCase.title)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <EdgeCaseCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedEdgeCase && (
        <TestExecutionModal
          edgeCase={selectedEdgeCase}
          open={testModalOpen}
          onClose={() => {
            setTestModalOpen(false);
            setSelectedEdgeCase(null);
          }}
          onSuccess={handleTestSuccess}
        />
      )}
    </div>
  );
}
