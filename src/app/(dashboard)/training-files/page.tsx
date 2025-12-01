'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TrainingFile {
  id: string;
  name: string;
  description: string | null;
  conversation_count: number;
  total_training_pairs: number;
  json_file_size: number | null;
  jsonl_file_size: number | null;
  avg_quality_score: number | null;
  scaffolding_distribution: {
    personas: Record<string, number>;
    emotional_arcs: Record<string, number>;
    training_topics: Record<string, number>;
  };
  status: string;
  created_at: string;
}

export default function TrainingFilesPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'jsonl' | null>(null);

  // Fetch training files
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['training-files'],
    queryFn: async () => {
      const response = await fetch('/api/training-files');
      if (!response.ok) {
        throw new Error('Failed to fetch training files');
      }
      const json = await response.json();
      return json.files as TrainingFile[];
    },
  });

  const handleDownload = async (fileId: string, format: 'json' | 'jsonl', fileName: string) => {
    try {
      setDownloadingId(fileId);
      setDownloadFormat(format);

      const response = await fetch(`/api/training-files/${fileId}/download?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate download URL');
      }

      const { download_url, filename } = await response.json();

      // Open download URL in new tab
      window.open(download_url, '_blank');

      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
      setDownloadFormat(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatScaffoldingDistribution = (distribution: TrainingFile['scaffolding_distribution']) => {
    const totalPersonas = Object.values(distribution.personas).reduce((sum, count) => sum + count, 0);
    const totalArcs = Object.values(distribution.emotional_arcs).reduce((sum, count) => sum + count, 0);
    const totalTopics = Object.values(distribution.training_topics).reduce((sum, count) => sum + count, 0);

    return {
      personas: `${totalPersonas} personas`,
      arcs: `${totalArcs} arcs`,
      topics: `${totalTopics} topics`,
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">LoRA Training JSON Files</h1>
          <p className="text-muted-foreground mt-1">
            Manage aggregated training files for LoRA fine-tuning
          </p>
        </div>
        <Button onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading training files...</p>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading training files: {(error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No training files yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training file from the Conversations page
            </p>
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Files ({data.length})</CardTitle>
            <CardDescription>
              Aggregated conversation datasets ready for LoRA training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Training Pairs</TableHead>
                  <TableHead>Avg Quality</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((file) => {
                  const distribution = formatScaffoldingDistribution(file.scaffolding_distribution);
                  const isDownloading = downloadingId === file.id;

                  return (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          {file.description && (
                            <div className="text-sm text-muted-foreground">
                              {file.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{file.conversation_count}</TableCell>
                      <TableCell>{file.total_training_pairs}</TableCell>
                      <TableCell>
                        {file.avg_quality_score ? (
                          <Badge variant="outline">
                            {file.avg_quality_score.toFixed(2)}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>{distribution.personas}</div>
                          <div>{distribution.arcs}</div>
                          <div>{distribution.topics}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <FileJson className="h-3 w-3" />
                            {formatFileSize(file.json_file_size)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {formatFileSize(file.jsonl_file_size)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDownloading && downloadFormat === 'json'}
                            onClick={() => handleDownload(file.id, 'json', file.name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDownloading && downloadFormat === 'jsonl'}
                            onClick={() => handleDownload(file.id, 'jsonl', file.name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSONL
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

