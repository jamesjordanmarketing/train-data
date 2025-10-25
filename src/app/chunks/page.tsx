'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
  primary_category?: string | null;
  total_chunks_extracted?: number;
}

export default function ChunksIndexPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Chunk Dashboards</h1>
        <p className="text-muted-foreground">
          View chunk analysis and dimensions for your documents
        </p>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents found</p>
              <p className="text-sm mt-2">Upload a document to get started</p>
            </div>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      {doc.title}
                      {doc.primary_category && (
                        <Badge variant="outline">{doc.primary_category}</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        {doc.total_chunks_extracted && doc.total_chunks_extracted > 0 
                          ? `${doc.total_chunks_extracted} chunks`
                          : 'View chunks'}
                      </span>
                      <Badge 
                        variant={doc.status === 'completed' ? 'default' : 'secondary'}
                        className={doc.status === 'completed' ? 'bg-green-500' : ''}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/chunks/${doc.id}`} passHref>
                    <Button variant="outline" size="sm">
                      View Dashboard
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 text-blue-900">
            About Chunk Dashboards
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• View all extracted chunks for each document</li>
            <li>• Analyze AI-generated dimensions with confidence scores</li>
            <li>• Identify high-confidence findings and knowledge gaps</li>
            <li>• Access detailed spreadsheet view for dimension comparison</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

