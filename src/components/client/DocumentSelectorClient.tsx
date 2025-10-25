'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { 
  FileText, 
  Calendar, 
  User, 
  Search, 
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  Grid3x3
} from "lucide-react"
import { Document } from "../../stores/workflow-store"
import { toast } from "sonner"

interface DocumentWithChunkStatus extends Document {
  hasChunks?: boolean
  chunkCount?: number
  file_path?: string | null
}

interface Props {
  initialData: {
    documents: DocumentWithChunkStatus[]
    stats: {
      total: number
      pending: number
      categorizing: number
      completed: number
    }
  }
}

export function DocumentSelectorClient({ initialData }: Props) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'categorizing' | 'completed'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'uploaded' | 'seed'>('all')
  
  const filteredDocuments = initialData.documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    
    // Apply source filter
    let matchesSource = true
    if (sourceFilter === 'uploaded') {
      matchesSource = doc.file_path !== null && doc.file_path !== undefined
    } else if (sourceFilter === 'seed') {
      matchesSource = !doc.file_path
    }
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const handleDocumentSelect = (document: DocumentWithChunkStatus) => {
    // Navigate to the first stage of the workflow
    router.push(`/workflow/${document.id}/stage1`)
  }

  const handleChunksView = async (document: DocumentWithChunkStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If document doesn't have chunks, trigger extraction first
    if (!document.hasChunks) {
      try {
        toast.info('Starting chunk extraction...', { id: `extract-${document.id}` });
        
        // Start the extraction request
        const extractPromise = fetch('/api/chunks/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: document.id })
        });

        // Navigate to chunks page after a brief delay to show the toast
        setTimeout(() => {
          router.push(`/chunks/${document.id}`);
          toast.success('Extraction started! This may take 2-5 minutes.', { id: `extract-${document.id}` });
        }, 500);

        // Handle extraction result in background
        extractPromise
          .then(async (res) => {
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || 'Failed to start extraction');
            }
            return res.json();
          })
          .then((result) => {
            console.log('Extraction completed:', result);
          })
          .catch((error) => {
            console.error('Extraction error:', error);
            toast.error(`Extraction failed: ${error.message}`);
          });
        
      } catch (error: any) {
        console.error('Error starting extraction:', error);
        toast.error('Failed to start extraction');
      }
    } else {
      // Navigate directly to view existing chunks
      router.push(`/chunks/${document.id}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'categorizing':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'categorizing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Document Categorization System</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select a document to begin the guided categorization workflow. Transform your content 
              into valuable AI training data with our comprehensive 3-step process.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search Documents</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or summary..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="categorizing">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Filter by Source</label>
                <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
                  <SelectTrigger>
                    <FileText className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="uploaded">Uploaded Only</SelectItem>
                    <SelectItem value="seed">Seed Data Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-xl font-semibold">{initialData.stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-xl font-semibold">{initialData.stats.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-xl font-semibold">{initialData.stats.categorizing}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-xl font-semibold">{initialData.stats.completed}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No documents found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No documents available for categorization.'
                }
              </p>
            </Card>
          ) : (
            filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-all cursor-pointer">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium mb-1 line-clamp-2">
                            {document.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {document.createdAt}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {document.authorId}
                            </div>
                            {/* Add source indicator badge */}
                            {document.file_path && (
                              <Badge variant="secondary" className="text-xs">
                                Uploaded
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {document.summary}
                      </p>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(document.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(document.status)}
                            {document.status === 'pending' && 'Pending Categorization'}
                            {document.status === 'categorizing' && 'In Progress'}
                            {document.status === 'completed' && 'Categorized'}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex gap-2">
                      <Button 
                        onClick={() => handleDocumentSelect(document)}
                        className="flex items-center gap-2"
                        size="sm"
                        variant={document.status === 'completed' ? 'outline' : 'default'}
                      >
                        {document.status === 'completed' ? 'Review' : 'Start Categorization'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Chunks button - only show for completed documents */}
                      {document.status === 'completed' && (
                        <Button 
                          onClick={(e) => handleChunksView(document, e)}
                          className="flex items-center gap-2"
                          size="sm"
                          variant={document.hasChunks ? 'default' : 'secondary'}
                        >
                          <Grid3x3 className="h-4 w-4" />
                          {document.hasChunks 
                            ? `View Chunks (${document.chunkCount})` 
                            : 'Start Chunking'
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <div className="p-6 bg-muted/50">
            <h3 className="font-medium mb-3">How the Categorization Workflow Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <span className="font-medium">Statement of Belonging</span>
                </div>
                <p className="text-muted-foreground">
                  Assess how closely the document represents your unique voice and expertise.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <span className="font-medium">Primary Category</span>
                </div>
                <p className="text-muted-foreground">
                  Select from 11 business-friendly categories that determine processing approach.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <span className="font-medium">Secondary Tags</span>
                </div>
                <p className="text-muted-foreground">
                  Apply metadata tags across 7 dimensions for enhanced AI training optimization.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}