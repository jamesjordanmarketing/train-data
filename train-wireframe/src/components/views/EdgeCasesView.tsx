import { AlertTriangle, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'sonner@2.0.3';

const edgeCaseTypeColors = {
  error_condition: 'bg-red-100 text-red-700',
  boundary_value: 'bg-yellow-100 text-yellow-700',
  unusual_input: 'bg-purple-100 text-purple-700',
  complex_combination: 'bg-blue-100 text-blue-700',
  failure_scenario: 'bg-orange-100 text-orange-700',
};

export function EdgeCasesView() {
  const { edgeCases } = useAppStore();
  
  return (
    <div className="p-8 space-y-6">
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
          <Button onClick={() => toast.info('Edge case creation coming soon')}>
            <Plus className="h-4 w-4 mr-2" />
            New Edge Case
          </Button>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="outline" size="sm">Error Conditions</Button>
        <Button variant="outline" size="sm">Boundary Values</Button>
        <Button variant="outline" size="sm">Unusual Inputs</Button>
        <Button variant="outline" size="sm">Complex Combinations</Button>
        <Button variant="outline" size="sm">Failure Scenarios</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {edgeCases.map((edgeCase) => (
          <Card key={edgeCase.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div className="flex items-center gap-2">
                {edgeCase.testStatus === 'passed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {edgeCase.testStatus === 'failed' && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {edgeCase.testStatus === 'not_tested' && (
                  <Badge variant="outline" className="text-xs">Not Tested</Badge>
                )}
              </div>
            </div>
            
            <h3 className="mb-2 text-sm line-clamp-1">{edgeCase.title}</h3>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {edgeCase.description}
            </p>
            
            <div className="space-y-2">
              <Badge className={edgeCaseTypeColors[edgeCase.edgeCaseType]} size="sm">
                {edgeCase.edgeCaseType.replace('_', ' ')}
              </Badge>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Complexity: {edgeCase.complexity}/10</span>
                <span className="text-xs">Based on: {edgeCase.parentScenarioName.slice(0, 20)}...</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
