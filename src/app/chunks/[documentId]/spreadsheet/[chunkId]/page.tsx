'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { ChunkSpreadsheet } from '../../../../../components/chunks/ChunkSpreadsheet';
import { ArrowLeft, FileText } from 'lucide-react';
import { Chunk, ChunkDimensions, ChunkRun } from '../../../../../types/chunks';

export default function ChunkSpreadsheetPage({ 
  params 
}: { 
  params: { documentId: string; chunkId: string } 
}) {
  const router = useRouter();
  const [chunk, setChunk] = useState<Chunk | null>(null);
  const [dimensions, setDimensions] = useState<ChunkDimensions[]>([]);
  const [runs, setRuns] = useState<ChunkRun[]>([]);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch document
        const docRes = await fetch(`/api/documents/${params.documentId}`);
        if (!docRes.ok) throw new Error('Failed to fetch document');
        const docData = await docRes.json();
        setDocument(docData.document);

        // Fetch chunk
        const chunkRes = await fetch(`/api/chunks?documentId=${params.documentId}`);
        if (!chunkRes.ok) throw new Error('Failed to fetch chunks');
        const chunksData = await chunkRes.json();
        
        const targetChunk = chunksData.chunks.find((c: Chunk) => c.id === params.chunkId);
        if (!targetChunk) throw new Error('Chunk not found');
        setChunk(targetChunk);

        // Fetch dimensions for this chunk
        const dimRes = await fetch(`/api/chunks/dimensions?chunkId=${params.chunkId}`);
        if (!dimRes.ok) throw new Error('Failed to fetch dimensions');
        const dimData = await dimRes.json();
        setDimensions(dimData.dimensions || []);

        // Fetch runs
        const runsRes = await fetch(`/api/chunks/runs?documentId=${params.documentId}`);
        if (!runsRes.ok) throw new Error('Failed to fetch runs');
        const runsData = await runsRes.json();
        setRuns(runsData.runs || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.documentId, params.chunkId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!chunk) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Chunk not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => router.push(`/chunks/${params.documentId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Chunks
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {chunk.chunk_handle || chunk.chunk_id}
                <Badge variant="outline" className="capitalize">
                  {chunk.chunk_type.replace(/_/g, ' ')}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Document: {document?.title}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Chunk ID: {chunk.chunk_id}</div>
              <div className="mt-1">
                {dimensions.length} dimension record{dimensions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chunk Details */}
      <Card>
        <CardHeader>
          <CardTitle>Chunk Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Characters</div>
              <div className="font-medium">{chunk.char_end - chunk.char_start}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tokens</div>
              <div className="font-medium">{chunk.token_count}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Page Range</div>
              <div className="font-medium">
                {chunk.page_start && chunk.page_end 
                  ? `${chunk.page_start}-${chunk.page_end}` 
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Section</div>
              <div className="font-medium">{chunk.section_heading || 'N/A'}</div>
            </div>
          </div>

          {/* Chunk text preview */}
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">Text Preview:</div>
            <div className="p-3 bg-muted rounded text-sm max-h-32 overflow-y-auto">
              {chunk.chunk_text.substring(0, 500)}
              {chunk.chunk_text.length > 500 && '...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions Spreadsheet */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Analysis Spreadsheet</CardTitle>
          <p className="text-sm text-muted-foreground">
            View and compare all dimension records for this chunk across different runs
          </p>
        </CardHeader>
        <CardContent>
          {dimensions.length > 0 ? (
            <ChunkSpreadsheet 
              chunk={chunk}
              dimensions={dimensions}
              runs={runs}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No dimensions generated for this chunk yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

