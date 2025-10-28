import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAppStore } from '../../stores/useAppStore';
import { Upload, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function BatchGenerationModal() {
  const { showBatchModal, closeBatchModal } = useAppStore();
  const [batchName, setBatchName] = useState('');
  const [topics, setTopics] = useState('');
  
  const handleStartBatch = () => {
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }
    
    const topicList = topics.split('\n').filter(t => t.trim());
    if (topicList.length === 0) {
      toast.error('Please enter at least one topic');
      return;
    }
    
    toast.success(`Batch "${batchName}" started with ${topicList.length} conversations`);
    closeBatchModal();
  };
  
  return (
    <Dialog open={showBatchModal} onOpenChange={closeBatchModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Conversation Generation</DialogTitle>
          <DialogDescription>
            Generate multiple conversations at once
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="batchName">Batch Name *</Label>
            <Input
              id="batchName"
              placeholder="e.g., Customer Support Scenarios Q1 2025"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="template">Template-Based</TabsTrigger>
              <TabsTrigger value="clone">Clone Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-500 cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">Drag CSV file here or click to browse</p>
                <p className="text-xs text-gray-500 mt-2">CSV with columns: tier, topic, audience, complexity, length, style</p>
                <Button variant="link" size="sm" className="mt-2">
                  Download Sample CSV
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topics">Topics (one per line) *</Label>
                <Textarea
                  id="topics"
                  placeholder="Password reset process&#10;Account recovery workflow&#10;Two-factor authentication setup&#10;..."
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-gray-500">
                  {topics.split('\n').filter(t => t.trim()).length} topics entered
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a template and enter variations to generate multiple scenarios
              </p>
              <div className="space-y-2">
                <Label>Coming soon...</Label>
                <p className="text-xs text-gray-500">This feature will allow you to select a template and generate variations automatically.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="clone" className="space-y-4">
              <p className="text-sm text-gray-600">
                Clone an existing conversation with variations
              </p>
              <div className="space-y-2">
                <Label>Coming soon...</Label>
                <p className="text-xs text-gray-500">This feature will allow you to create variations of existing conversations.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <strong>Batch Configuration:</strong>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Priority: Normal</div>
              <div>• Concurrent processing: 3 conversations at a time</div>
              <div>• Error handling: Continue on error</div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={closeBatchModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleStartBatch} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Start Batch Generation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
