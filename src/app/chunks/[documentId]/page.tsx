'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { 
  FileText, CheckCircle, AlertCircle, Hash, ExternalLink, ArrowRight, RefreshCw, Loader2, Grid3x3, Table
} from 'lucide-react';
import { Chunk, ChunkDimensions, PromptTemplate } from '../../../types/chunks';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

interface ChunkWithDimensions extends Chunk {
  dimensions?: ChunkDimensions[];
}

interface DimensionWithConfidence {
  fieldName: string;
  value: any;
  confidence: number; // 1-10 scale from database
}

export default function ChunkDashboardPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [chunks, setChunks] = useState<ChunkWithDimensions[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [selectedChunkForRegen, setSelectedChunkForRegen] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [regenAllChunks, setRegenAllChunks] = useState(false);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get authentication token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Authentication required');
          toast.error('Please sign in to view this document');
          router.push('/signin');
          return;
        }
        
        const token = session.access_token;
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch document
        const docRes = await fetch(`/api/documents/${params.documentId}`, {
          headers: authHeaders
        });
        if (!docRes.ok) throw new Error('Failed to fetch document');
        const docData = await docRes.json();
        setDocument(docData.document);

        // Fetch chunks
        const chunksRes = await fetch(`/api/chunks?documentId=${params.documentId}`, {
          headers: authHeaders
        });
        if (!chunksRes.ok) throw new Error('Failed to fetch chunks');
        const chunksData = await chunksRes.json();

        // Fetch runs
        const runsRes = await fetch(`/api/chunks/runs?documentId=${params.documentId}`, {
          headers: authHeaders
        });
        if (!runsRes.ok) throw new Error('Failed to fetch runs');
        const runsData = await runsRes.json();
        setRuns(runsData.runs || []);

        // Fetch available templates
        try {
          const templatesRes = await fetch('/api/chunks/templates', {
            headers: authHeaders
          });
          if (templatesRes.ok) {
            const templatesData = await templatesRes.json();
            setTemplates(templatesData.templates || []);
          }
        } catch (e) {
          console.error('Failed to fetch templates');
        }

        // For each chunk, fetch its latest dimensions
        const chunksWithDimensions = await Promise.all(
          chunksData.chunks.map(async (chunk: Chunk) => {
            try {
              const dimRes = await fetch(`/api/chunks/dimensions?chunkId=${chunk.id}`, {
                headers: authHeaders
              });
              if (dimRes.ok) {
                const dimData = await dimRes.json();
                return { ...chunk, dimensions: dimData.dimensions || [] };
              }
            } catch (e) {
              console.error('Failed to fetch dimensions for chunk:', chunk.id);
            }
            return { ...chunk, dimensions: [] };
          })
        );

        setChunks(chunksWithDimensions);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.documentId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Loading skeleton for document header */}
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>

        {/* Loading skeletons for chunks */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>

        {/* Loading skeleton for summary */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Document not found</div>
      </div>
    );
  }

  const totalChunks = chunks.length;
  const chunksWithDimensions = chunks.filter(c => hasDimensions(c)).length;
  const analysisProgress = totalChunks > 0 ? Math.round((chunksWithDimensions / totalChunks) * 100) : 0;
  
  // Calculate total dimensions generated
  const totalDimensionsGenerated = chunks.reduce((sum, chunk) => {
    if (chunk.dimensions && chunk.dimensions.length > 0) {
      const latestDim = chunk.dimensions[0];
      return sum + countPopulatedDimensions(latestDim);
    }
    return sum;
  }, 0);

  // Calculate total cost
  const totalCost = chunks.reduce((sum, chunk) => {
    if (chunk.dimensions && chunk.dimensions.length > 0) {
      const latestDim = chunk.dimensions[0];
      return sum + (latestDim.generation_cost_usd || 0);
    }
    return sum;
  }, 0);

  // Handle regeneration
  const handleRegenerateClick = (chunkId: string) => {
    setSelectedChunkForRegen(chunkId);
    setRegenAllChunks(false);
    setSelectedTemplates([]);
    setRegenerateModalOpen(true);
  };

  // Handler for Button 1: Regenerate Dimensions Only (existing chunks)
  const handleRegenerateDimensionsOnly = () => {
    setSelectedChunkForRegen(null);
    setRegenAllChunks(true);  // All chunks, but existing chunks only
    setSelectedTemplates([]);
    setRegenerateModalOpen(true);
  };

  // Handler for Button 2: Re-Extract & Regenerate All (fresh chunks)
  const handleReExtractAndRegenerate = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `⚠️ WARNING: This will DELETE all ${totalChunks} existing chunks and their dimension history for this document.\n\n` +
      `A fresh extraction will create new chunks from the document content, and dimension generation will run on the new chunks.\n\n` +
      `This action cannot be undone. Do you want to proceed?`
    );
    
    if (!confirmed) return;

    try {
      setExtracting(true);
      toast.info('Deleting existing chunks and re-extracting from document...');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }
      
      // Call the extract API (which will delete existing chunks, extract new ones, and generate dimensions)
      const response = await fetch('/api/chunks/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          documentId: params.documentId,
          forceReExtract: true,  // NEW: Forces deletion and re-extraction
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Re-extraction failed');
      }

      const result = await response.json();
      toast.success(
        `Successfully re-extracted ${result.chunksExtracted} chunks and generated dimensions!`
      );
      
      // Reload the page to show new chunks
      window.location.reload();
      
    } catch (error: any) {
      console.error('Re-extraction error:', error);
      toast.error(error.message || 'Failed to re-extract chunks');
    } finally {
      setExtracting(false);
    }
  };

  // Keep this for backwards compatibility with individual chunk regeneration
  const handleRegenerateAll = () => {
    handleRegenerateDimensionsOnly();
  };

  const handleStartExtraction = async () => {
    try {
      setExtracting(true);
      toast.info('Starting chunk extraction and dimension generation...');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch('/api/chunks/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          documentId: params.documentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Extraction failed');
      }

      const result = await response.json();
      toast.success(`Successfully extracted ${result.chunksExtracted} chunks!`);
      
      // Reload data
      window.location.reload();
      
    } catch (error: any) {
      console.error('Extraction error:', error);
      toast.error(error.message || 'Failed to extract chunks');
    } finally {
      setExtracting(false);
    }
  };

  const handleRegenerateSubmit = async () => {
    try {
      setRegenerating(true);
      toast.info('Starting regeneration...');
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch('/api/chunks/regenerate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          documentId: params.documentId,
          chunkIds: regenAllChunks ? undefined : (selectedChunkForRegen ? [selectedChunkForRegen] : undefined),
          templateIds: selectedTemplates.length > 0 ? selectedTemplates : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Regeneration failed');
      }

      const data = await response.json();
      toast.success(`Regeneration complete! Created run: ${data.runId.substring(0, 8)}...`);
      
      // Close modal and refresh data
      setRegenerateModalOpen(false);
      
      // Reload page data
      window.location.reload();
      
    } catch (err: any) {
      console.error('Regeneration error:', err);
      toast.error(`Regeneration failed: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 1. Filename Display - centered */}
      <div className="text-center">
        <h1 className="font-bold">{document.title}</h1>
      </div>
      
      {/* 2. Document Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {document.title}
                {document.primary_category && (
                  <Badge variant="outline">{document.primary_category}</Badge>
                )}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {totalChunks} chunks extracted
              </p>
            </div>
            <div className="text-right">
              <Badge className="mb-2 bg-green-500">
                COMPLETED
              </Badge>
              <div className="text-sm text-muted-foreground">
                Analysis Progress: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 3. Auto-Generated Chunks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Auto-Generated Chunks</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {chunksWithDimensions} / {totalChunks} Analyzed
            </Badge>
            {totalChunks > 0 && (
              <>
                {/* Button 1: Regenerate Dimensions Only */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateDimensionsOnly}
                  disabled={regenerating || extracting}
                  title="Re-run AI dimension generation for existing chunks"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate Dimensions
                </Button>
                {/* Button 2: Re-Extract & Regenerate All */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReExtractAndRegenerate}
                  disabled={regenerating || extracting}
                  title="Delete chunks, re-extract from document, and generate new dimensions"
                  className="border-orange-500 text-orange-700 hover:bg-orange-50"
                >
                  <Grid3x3 className={`h-4 w-4 mr-2 ${extracting ? 'animate-spin' : ''}`} />
                  Re-Extract & Regenerate
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Show extraction button if no chunks exist */}
        {totalChunks === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Grid3x3 className="h-16 w-16 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">No Chunks Extracted Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This document hasn't been processed for chunk extraction yet. 
                  Click the button below to start extracting chunks and generating AI dimensions.
                </p>
                <Button
                  size="lg"
                  onClick={handleStartExtraction}
                  disabled={extracting}
                  className="gap-2"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extracting Chunks...
                    </>
                  ) : (
                    <>
                      <Grid3x3 className="h-4 w-4" />
                      Start Chunk Extraction
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  This process may take 2-5 minutes depending on document size
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Individual chunk cards - FOLLOW THREE-SECTION PATTERN */}
            {chunks.map((chunk) => {
          const highConfDims = getHighConfidenceDimensions(chunk);
          const lowConfDims = getLowConfidenceDimensions(chunk);
          
          return (
            <Card 
              key={chunk.id} 
              className={`transition-all ${getChunkTypeColor(chunk.chunk_type)} ${hasDimensions(chunk) ? 'ring-1 ring-green-200' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-white/50 ${hasDimensions(chunk) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {hasDimensions(chunk) ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{chunk.chunk_handle || `Chunk ${chunk.chunk_id}`}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {chunk.chunk_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateClick(chunk.id)}
                      disabled={regenerating}
                      title="Regenerate dimensions for this chunk"
                    >
                      <RefreshCw className={`h-3 w-3 ${regenerating ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="text-sm text-muted-foreground text-right">
                      <div>ID: {chunk.chunk_id}</div>
                      {hasDimensions(chunk) ? (
                        <Badge variant="default" className="bg-green-500 text-xs mt-1">Analyzed</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs mt-1">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* SECTION 1: Chunk Metadata (neutral background) */}
                <div className="mb-4 p-3 bg-white/30 rounded border">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    Chunk Metadata
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Chars:</span>
                      <div className="font-medium">{chunk.char_end - chunk.char_start}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tokens:</span>
                      <div className="font-medium">{chunk.token_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Page:</span>
                      <div className="font-medium">{chunk.page_start || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium">{chunk.chunk_type}</div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Things We Know (green background) */}
                <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-3 w-3" />
                    Things We Know ({highConfDims.length})
                  </h5>
                  {highConfDims.length > 0 ? (
                    <div className="space-y-2">
                      {highConfDims.slice(0, 3).map((dim, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {formatFieldName(dim.fieldName)}
                            </Badge>
                            <span className="text-green-600 font-medium">
                              {dim.confidence * 10}% confidence
                            </span>
                          </div>
                          <p className="text-green-800">{truncate(formatValue(dim.value), 100)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-green-700">No dimensions generated yet</p>
                  )}
                </div>

                {/* SECTION 3: Things We Need to Know (orange background) */}
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-3 w-3" />
                      Things We Need to Know ({lowConfDims.length})
                    </h5>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => router.push(`/chunks/${params.documentId}/spreadsheet/${chunk.id}`)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Detail View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => router.push(`/chunks/${params.documentId}/dimensions/${chunk.id}`)}
                      >
                        <Table className="h-3 w-3 mr-1" />
                        View All Dimensions
                      </Button>
                    </div>
                  </div>
                  {lowConfDims.length > 0 ? (
                    <ul className="space-y-1">
                      {lowConfDims.slice(0, 3).map((dim, idx) => (
                        <li key={idx} className="text-xs text-orange-800 flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {formatFieldName(dim.fieldName)}: Low confidence ({dim.confidence * 10}%)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-orange-700">All dimensions have high confidence</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
          </>
        )}
      </div>

      {/* 4. Analysis Summary (4-column stats) */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
              <div className="text-sm text-blue-800">Total Chunks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-medium text-green-600">{chunksWithDimensions}</div>
              <div className="text-sm text-green-800">Analyzed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-medium text-orange-600">{totalDimensionsGenerated}</div>
              <div className="text-sm text-orange-800">Dimensions Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-medium text-purple-600">${totalCost.toFixed(2)}</div>
              <div className="text-sm text-purple-800">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regeneration Modal */}
      <Dialog open={regenerateModalOpen} onOpenChange={setRegenerateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Regenerate Dimensions</DialogTitle>
            <DialogDescription>
              {regenAllChunks 
                ? `This will regenerate dimensions for all ${totalChunks} existing chunks using AI analysis. The chunks themselves will not be modified.`
                : 'This will regenerate dimensions for the selected chunk using AI analysis.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Templates (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Leave unchecked to use all applicable templates
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No templates available</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`template-${template.id}`}
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTemplates([...selectedTemplates, template.id]);
                          } else {
                            setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`template-${template.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {template.template_name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {template.template_type}
                        </Badge>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This will create a new run and preserve all historical data.
                Previous dimension values will not be deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRegenerateModalOpen(false)}
              disabled={regenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerateSubmit}
              disabled={regenerating}
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getChunkTypeColor(type: string): string {
  switch (type) {
    case 'Chapter_Sequential': return 'border-blue-200 bg-blue-50';
    case 'Instructional_Unit': return 'border-purple-200 bg-purple-50';
    case 'CER': return 'border-orange-200 bg-orange-50';
    case 'Example_Scenario': return 'border-yellow-200 bg-yellow-50';
    default: return 'border-gray-200 bg-gray-50';
  }
}

function getHighConfidenceDimensions(chunk: ChunkWithDimensions): DimensionWithConfidence[] {
  if (!chunk.dimensions || chunk.dimensions.length === 0) return [];
  
  const latestDim = chunk.dimensions[0]; // Assume sorted by generated_at DESC
  const dimensionsWithScores: DimensionWithConfidence[] = [];
  
  // Define all possible dimension fields
  const fieldMappings: Record<string, any> = {
    chunk_summary_1s: latestDim.chunk_summary_1s,
    key_terms: latestDim.key_terms,
    audience: latestDim.audience,
    intent: latestDim.intent,
    tone_voice_tags: latestDim.tone_voice_tags,
    brand_persona_tags: latestDim.brand_persona_tags,
    domain_tags: latestDim.domain_tags,
    task_name: latestDim.task_name,
    preconditions: latestDim.preconditions,
    expected_output: latestDim.expected_output,
    claim: latestDim.claim,
    evidence_snippets: latestDim.evidence_snippets,
    reasoning_sketch: latestDim.reasoning_sketch,
    scenario_type: latestDim.scenario_type,
    problem_context: latestDim.problem_context,
    solution_action: latestDim.solution_action,
  };
  
  Object.entries(fieldMappings).forEach(([fieldName, value]) => {
    if (isPopulated(value)) {
      // Use accuracy score as primary confidence indicator (1-10 scale)
      const confidence = latestDim.generation_confidence_accuracy || 5;
      
      if (confidence >= 8) { // High confidence threshold
        dimensionsWithScores.push({ fieldName, value, confidence });
      }
    }
  });
  
  // Sort by confidence descending
  return dimensionsWithScores.sort((a, b) => b.confidence - a.confidence);
}

function getLowConfidenceDimensions(chunk: ChunkWithDimensions): DimensionWithConfidence[] {
  if (!chunk.dimensions || chunk.dimensions.length === 0) return [];
  
  const latestDim = chunk.dimensions[0];
  const dimensionsWithScores: DimensionWithConfidence[] = [];
  
  // Same field mappings as above
  const fieldMappings: Record<string, any> = {
    chunk_summary_1s: latestDim.chunk_summary_1s,
    key_terms: latestDim.key_terms,
    audience: latestDim.audience,
    intent: latestDim.intent,
    tone_voice_tags: latestDim.tone_voice_tags,
    brand_persona_tags: latestDim.brand_persona_tags,
    domain_tags: latestDim.domain_tags,
    task_name: latestDim.task_name,
    preconditions: latestDim.preconditions,
    expected_output: latestDim.expected_output,
    claim: latestDim.claim,
    evidence_snippets: latestDim.evidence_snippets,
    reasoning_sketch: latestDim.reasoning_sketch,
    scenario_type: latestDim.scenario_type,
    problem_context: latestDim.problem_context,
    solution_action: latestDim.solution_action,
  };
  
  Object.entries(fieldMappings).forEach(([fieldName, value]) => {
    const confidence = latestDim.generation_confidence_accuracy || 5;
    
    // Include fields that are null/empty OR have low confidence
    if (!isPopulated(value) || confidence < 8) {
      dimensionsWithScores.push({ 
        fieldName, 
        value: value || '(Not generated)', 
        confidence 
      });
    }
  });
  
  // Sort by confidence ascending (lowest first)
  return dimensionsWithScores.sort((a, b) => a.confidence - b.confidence);
}

function isPopulated(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function hasDimensions(chunk: ChunkWithDimensions): boolean {
  return chunk.dimensions !== undefined && chunk.dimensions.length > 0;
}

function countPopulatedDimensions(dim: ChunkDimensions): number {
  let count = 0;
  const fields = [
    dim.chunk_summary_1s,
    dim.key_terms,
    dim.audience,
    dim.intent,
    dim.tone_voice_tags,
    dim.brand_persona_tags,
    dim.domain_tags,
    dim.task_name,
    dim.preconditions,
    dim.expected_output,
    dim.claim,
    dim.evidence_snippets,
    dim.reasoning_sketch,
    dim.scenario_type,
    dim.problem_context,
    dim.solution_action,
  ];
  
  fields.forEach(field => {
    if (isPopulated(field)) count++;
  });
  
  return count;
}
