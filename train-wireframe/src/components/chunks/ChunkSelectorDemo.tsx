/**
 * ChunkSelector Demo Component
 * 
 * Demonstrates how to integrate and use the ChunkSelector component
 * in a conversation generation or linking scenario.
 * 
 * This file serves as both documentation and a testbed for the component.
 */

import { useState } from 'react';
import { ChunkSelector } from './ChunkSelector';
import { ChunkWithDimensions } from '@/lib/chunks-integration';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Link2, X, CheckCircle2 } from 'lucide-react';

export function ChunkSelectorDemo() {
  const [selectedChunkId, setSelectedChunkId] = useState<string | undefined>();
  const [selectedChunk, setSelectedChunk] = useState<ChunkWithDimensions | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  /**
   * Handle chunk selection
   */
  const handleChunkSelect = (chunkId: string, chunk: ChunkWithDimensions) => {
    setSelectedChunkId(chunkId);
    setSelectedChunk(chunk);
    console.log('Chunk selected:', { chunkId, chunk });
    
    // In a real application, you would:
    // 1. Update the conversation record with the chunk reference
    // 2. Save to database via API
    // 3. Update local state
    // 4. Close the selector (optional)
    // setShowSelector(false);
  };

  /**
   * Clear chunk selection
   */
  const handleClearSelection = () => {
    setSelectedChunkId(undefined);
    setSelectedChunk(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Chunk Selector Component</h1>
          <p className="text-gray-600">
            Interactive UI component for searching, filtering, and selecting document chunks
            from the chunks-alpha module.
          </p>
        </div>

        <Separator />

        {/* Demo Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Selection Display */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Current Selection</h2>
            </div>

            {selectedChunk ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{selectedChunk.title}</h3>
                      {selectedChunk.documentTitle && (
                        <p className="text-sm text-gray-600 mt-1">
                          Document: {selectedChunk.documentTitle}
                        </p>
                      )}
                    </div>
                    {selectedChunk.dimensions && (
                      <Badge variant="default">
                        Quality: {(selectedChunk.dimensions.confidence * 10).toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-3 mt-2">
                    {selectedChunk.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Chunk Linked Successfully
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelector(true)}
                    className="flex-1"
                  >
                    Change Chunk
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                {/* Technical Details */}
                <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono">
                  <p className="text-gray-600 mb-1">Chunk ID:</p>
                  <p className="text-gray-900 break-all">{selectedChunk.id}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No chunk selected</p>
                <Button onClick={() => setShowSelector(true)}>
                  Select a Chunk
                </Button>
              </div>
            )}
          </Card>

          {/* Integration Guide */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              Integration Guide
            </h2>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <h3 className="font-semibold mb-1">1. Import Component</h3>
                <code className="text-xs bg-white px-2 py-1 rounded block">
                  import &#123; ChunkSelector &#125; from '@/components/chunks';
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-1">2. Add to Your Form</h3>
                <code className="text-xs bg-white px-2 py-1 rounded block break-all">
                  &lt;ChunkSelector onSelect=&#123;handleSelect&#125; /&gt;
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-1">3. Handle Selection</h3>
                <code className="text-xs bg-white px-2 py-1 rounded block">
                  const handleSelect = (id, chunk) =&gt; &#123;...&#125;
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Debounced search (300ms)</li>
                  <li>Quality score filtering</li>
                  <li>Document filtering</li>
                  <li>Keyboard navigation (↑↓ Enter Esc)</li>
                  <li>Detailed chunk preview</li>
                  <li>Dimension visualization</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Chunk Selector Component */}
        {showSelector && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select a Chunk</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="h-[600px]">
              <ChunkSelector
                onSelect={handleChunkSelect}
                selectedChunkId={selectedChunkId}
              />
            </div>
          </Card>
        )}

        {!showSelector && !selectedChunk && (
          <Card className="p-12 text-center">
            <Button 
              size="lg" 
              onClick={() => setShowSelector(true)}
              className="gap-2"
            >
              <Link2 className="h-5 w-5" />
              Open Chunk Selector
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

