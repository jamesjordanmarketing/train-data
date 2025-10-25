'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { ArrowLeft, RefreshCw, TrendingUp, Percent } from 'lucide-react';
import { DimensionValidationSheet } from '../../../../../components/chunks/DimensionValidationSheet';
import { dimensionService, DimensionValidationData } from '../../../../../lib/dimension-service';
import { ChunkRun } from '../../../../../types/chunks';
import { toast } from 'sonner';

export default function DimensionValidationPage({ 
  params 
}: { 
  params: { documentId: string; chunkId: string } 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DimensionValidationData | null>(null);
  const [availableRuns, setAvailableRuns] = useState<Array<{ run: ChunkRun; hasData: boolean }>>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');

  // Load runs on mount
  useEffect(() => {
    loadRuns();
  }, [params.chunkId]);

  // Load data when run selected
  useEffect(() => {
    if (selectedRunId) {
      loadData(selectedRunId);
    }
  }, [selectedRunId]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const runs = await dimensionService.getRunsForChunk(params.chunkId);
      
      if (runs.length === 0) {
        toast.error('No dimension data found for this chunk');
        setLoading(false);
        return;
      }

      setAvailableRuns(runs);
      // Default to most recent run
      if (runs[0]) {
        setSelectedRunId(runs[0].run.run_id);
      }
    } catch (error: any) {
      console.error('Error loading runs:', error);
      toast.error('Failed to load available runs');
      setLoading(false);
    }
  };

  const loadData = async (runId: string) => {
    try {
      setLoading(true);
      const validationData = await dimensionService.getDimensionValidationData(
        params.chunkId,
        runId
      );

      if (!validationData) {
        toast.error('Failed to load dimension data');
        setLoading(false);
        return;
      }

      setData(validationData);
    } catch (error: any) {
      console.error('Error loading dimension data:', error);
      toast.error('Failed to load dimension data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunChange = (runId: string) => {
    setSelectedRunId(runId);
  };

  const handleRegenerate = () => {
    toast.info('Regeneration feature coming soon');
  };

  // Loading state
  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state - no runs found
  if (availableRuns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No dimension data found for this chunk</p>
              <Button onClick={() => router.push(`/chunks/${params.documentId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chunks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const needsReviewCount = data.dimensionRows.filter(row => row.accuracyConfidence < 8.0).length;
  
  // Calculate type distribution
  const aiCount = data.dimensionRows.filter(row => row.generationType === 'AI Generated').length;
  const mechanicalCount = data.dimensionRows.filter(row => row.generationType === 'Mechanically Generated').length;
  const priorCount = data.dimensionRows.filter(row => row.generationType === 'Prior Generated').length;

  const pageTitle = `${data.document.title} - ${data.chunk.chunk_handle || `Chunk ${data.chunk.chunk_id}`} - ${new Date(data.run.started_at).toLocaleString()}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/chunks/${params.documentId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{data.document.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-16">
            {data.chunk.chunk_handle || `Chunk ${data.chunk.chunk_id}`} • {new Date(data.run.started_at).toLocaleString()}
          </p>
          <p className="text-sm font-medium ml-16">
            Dimension Validation - 60 Total Dimensions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statistics</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Run:</span>
              <Select value={selectedRunId} onValueChange={handleRunChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRuns.map(({ run }) => (
                    <SelectItem key={run.run_id} value={run.run_id}>
                      {new Date(run.started_at).toLocaleString()} - {run.ai_model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 4 Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Percent className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Populated</p>
                <p className="text-2xl font-bold text-blue-900">{data.populatedPercentage}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Avg Precision</p>
                <p className="text-2xl font-bold text-green-900">{data.averagePrecision.toFixed(1)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Avg Accuracy</p>
                <p className="text-2xl font-bold text-purple-900">{data.averageAccuracy.toFixed(1)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Badge className="bg-orange-600 text-white">{needsReviewCount}</Badge>
              </div>
              <div>
                <p className="text-sm text-orange-700">Need Review</p>
                <p className="text-lg font-medium text-orange-900">Low confidence (&lt;8.0)</p>
              </div>
            </div>
          </div>

          {/* Type Distribution Badges */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type Distribution:</span>
            <Badge className="bg-purple-100 text-purple-800">
              {aiCount} AI Generated
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {mechanicalCount} Mechanical
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              {priorCount} Prior
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Validation Spreadsheet */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DimensionValidationSheet
            dimensionRows={data.dimensionRows}
            documentName={data.document.title}
            chunkName={data.chunk.chunk_handle || `Chunk ${data.chunk.chunk_id}`}
            runTimestamp={new Date(data.run.started_at).toLocaleString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

