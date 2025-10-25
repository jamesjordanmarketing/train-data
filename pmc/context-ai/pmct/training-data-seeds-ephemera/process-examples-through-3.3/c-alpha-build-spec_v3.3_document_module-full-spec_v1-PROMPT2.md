# PROMPT 2: Upload UI Components
**Module:** Document Upload & Processing  
**Phase:** User Interface Components  
**Estimated Time:** 3-4 hours  
**Prerequisites:** Prompt 1 completed (API endpoint functional)

---

## CONTEXT FOR CODING AGENT

You are implementing Phase 2 of the document upload module for "Bright Run." In Prompt 1, you created the database schema, storage configuration, and upload API endpoint. Now you will build the user interface components that allow users to upload documents via drag-and-drop or file selection.

### What Was Built in Prompt 1
✅ Database migration (8 columns added to documents table)  
✅ Supabase Storage bucket configured with RLS policies  
✅ NPM packages installed (pdf-parse, mammoth, html-to-text)  
✅ Type definitions at `src/lib/types/upload.ts`  
✅ Upload API endpoint at `src/app/api/documents/upload/route.ts`

### Existing UI Components You Can Use
The project has 48 Radix UI components in `src/components/ui/` including:
- `Button`, `Card`, `CardContent`, `CardHeader`
- `Progress`, `Badge`, `Alert`, `AlertDescription`
- `Input`, `Label`, `Select`
- `Dialog`, `Sheet`, `Popover`
- `Table`, `Tabs`, `Accordion`

**Import pattern:** `import { Button } from '@/components/ui/button';`

### Your Task in Prompt 2
1. ✅ Create Upload Dropzone Component (drag-drop + file selection)
2. ✅ Create Upload Page (main UI integrating dropzone)
3. ✅ Create Upload Loading State
4. ✅ Update Dashboard to add "Upload Documents" button

### Success Criteria
- Users can drag-drop files onto upload zone
- Users can click "Select Files" button to choose files
- File validation works (type, size, count)
- Upload progress shown with feedback
- Files uploaded to API successfully
- Success/error messages displayed via toast notifications
- Navigation from dashboard to upload page works

---



====================



## STEP 1: Create Upload Dropzone Component

**DIRECTIVE:** You shall create a React component that provides drag-and-drop file upload functionality with visual feedback and validation.

**Instructions:**
1. Create directory: `src/components/upload/`
2. Create file: `src/components/upload/upload-dropzone.tsx`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-dropzone.tsx`

```typescript
'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { validateFile, formatFileSize, SupportedFileType } from '../../lib/types/upload';
import { toast } from 'sonner';

interface UploadDropzoneProps {
  /** Callback when files are added to upload queue */
  onFilesAdded: (files: File[]) => void;
  /** Current number of files in queue */
  currentFileCount: number;
  /** Maximum number of files allowed */
  maxFiles: number;
  /** Whether upload is currently in progress */
  isUploading: boolean;
  /** Upload progress percentage (0-100) */
  uploadProgress?: number;
}

/**
 * UploadDropzone Component
 * 
 * Provides drag-and-drop and click-to-select file upload interface
 * Features:
 * - Visual drag-over feedback
 * - File validation (type, size, count)
 * - Upload progress display
 * - Capacity warnings and limits
 * - Supported formats display
 */
export function UploadDropzone({ 
  onFilesAdded, 
  currentFileCount, 
  maxFiles, 
  isUploading,
  uploadProgress = 0
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  // Calculate remaining capacity
  const remainingCapacity = maxFiles - currentFileCount;
  const isAtCapacity = remainingCapacity <= 0;
  const isNearCapacity = remainingCapacity <= 25 && remainingCapacity > 0;

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver && !isUploading && !isAtCapacity) {
      setIsDragOver(true);
    }
  }, [isDragOver, isUploading, isAtCapacity]);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only disable drag-over if we're actually leaving the dropzone
    const rect = e.currentTarget.getBoundingClientRect();
    const isOutside = (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    );
    
    if (isOutside) {
      setIsDragOver(false);
    }
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isUploading) {
      toast.error('Upload in progress', {
        description: 'Please wait for current upload to complete'
      });
      return;
    }

    if (isAtCapacity) {
      toast.error('Capacity reached', {
        description: `Maximum ${maxFiles} files allowed. Please process or remove some files.`
      });
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [isUploading, isAtCapacity, currentFileCount, maxFiles]);

  /**
   * Handle file selection via input
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    
    // Reset file input to allow selecting same files again
    setFileInputKey(prev => prev + 1);
  }, [currentFileCount]);

  /**
   * Process and validate selected files
   */
  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    files.forEach(file => {
      const validation = validateFile(file, currentFileCount + validFiles.length);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors for invalid files
    if (errors.length > 0) {
      errors.slice(0, 3).forEach(error => {
        toast.error('File validation failed', { description: error });
      });
      if (errors.length > 3) {
        toast.error(`${errors.length - 3} more files failed validation`);
      }
    }

    // Add valid files to queue
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
      toast.success(`${validFiles.length} file(s) added to upload queue`);
    }
  };

  /**
   * Get list of supported file formats
   */
  const getSupportedFormats = (): string[] => [
    'PDF (.pdf)',
    'Microsoft Word (.docx, .doc)',
    'Text Files (.txt)',
    'Markdown (.md)',
    'Rich Text (.rtf)',
    'HTML (.html, .htm)'
  ];

  return (
    <div className="space-y-4">
      {/* Main Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragOver 
            ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
            : isAtCapacity
            ? 'border-muted-foreground/10 bg-muted/20'
            : 'border-muted-foreground/25 hover:border-muted-foreground/40 hover:shadow-md'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <div className="space-y-4 max-w-md">
            {/* Upload Icon */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isDragOver 
                ? 'bg-primary text-primary-foreground scale-110' 
                : isAtCapacity
                ? 'bg-muted text-muted-foreground'
                : 'bg-muted'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            
            {/* Title and Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-medium">
                {isDragOver 
                  ? 'Drop files here' 
                  : isAtCapacity
                  ? 'Maximum capacity reached'
                  : 'Upload Documents'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isDragOver 
                  ? `Drop up to ${remainingCapacity} more file(s) to begin processing`
                  : isAtCapacity
                  ? `You have reached the maximum limit of ${maxFiles} files. Please process or remove some files before uploading more.`
                  : 'Drag and drop files here, or click to select files from your computer'
                }
              </p>
            </div>

            {/* File Selection Button */}
            <div className="space-y-3">
              <input
                key={fileInputKey}
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.docx,.doc,.txt,.md,.rtf,.html,.htm"
                onChange={handleFileSelect}
                disabled={isUploading || isAtCapacity}
              />
              <label htmlFor="file-upload">
                <Button 
                  asChild
                  size="lg" 
                  disabled={isUploading || isAtCapacity}
                  className="cursor-pointer"
                >
                  <span>
                    {isUploading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Select Files
                      </>
                    )}
                  </span>
                </Button>
              </label>

              {/* Capacity Warnings */}
              {isNearCapacity && (
                <div className="flex items-center justify-center text-sm text-yellow-600 dark:text-yellow-500">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Only {remainingCapacity} upload slot(s) remaining
                </div>
              )}

              {isAtCapacity && (
                <div className="flex items-center justify-center text-sm text-red-600 dark:text-red-500">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Maximum file limit reached ({maxFiles} files)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Please wait while your files are being uploaded and processed
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Formats Info */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Supported File Formats</h4>
            <div className="flex flex-wrap gap-2">
              {getSupportedFormats().map((format, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Maximum file size: 100MB per file</p>
              <p>• Maximum total files: {maxFiles} files per batch</p>
              <p>• Files are automatically validated and processed</p>
              <p>• Text extraction begins immediately after upload</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Explanation:**
- **Drag-Drop:** Handles dragover, dragleave, and drop events with visual feedback
- **File Selection:** Hidden file input triggered by button click
- **Validation:** Uses `validateFile` function from type definitions
- **Capacity Management:** Shows warnings when nearing limit, blocks at capacity
- **User Feedback:** Toast notifications for success/error, visual progress bar
- **Responsive:** Works on desktop, tablet, and mobile (touch-friendly)

**Verification:**
1. Component should compile with no TypeScript errors
2. Check imports resolve correctly
3. Verify UI components (Button, Card, etc.) are available



++++++++++++++++++++++++



## STEP 2: Create Upload Page

**DIRECTIVE:** You shall create the main upload page that integrates the dropzone component, manages upload state, and calls the API endpoint.

**Instructions:**
1. Create directory: `src/app/(dashboard)/upload/`
2. Create file: `src/app/(dashboard)/upload/page.tsx`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/app/(dashboard)/upload/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '../../../components/upload/upload-dropzone';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ArrowLeft, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { UploadDocumentResponse } from '../../../lib/types/upload';

interface UploadedDocument {
  id: string;
  title: string;
  status: string;
  file_path: string;
  created_at: string;
  file_name: string;
  file_size: number;
}

/**
 * Upload Page Component
 * 
 * Main page for uploading documents
 * Features:
 * - File selection via dropzone
 * - Sequential file upload to API
 * - Progress tracking
 * - Success/error feedback
 * - Recently uploaded documents list
 */
export default function UploadPage() {
  const router = useRouter();
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0
  });

  /**
   * Handle files added from dropzone
   */
  const handleFilesAdded = async (files: File[]) => {
    await uploadFiles(files);
  };

  /**
   * Upload files to API sequentially
   */
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStats({
      total: files.length,
      completed: 0,
      failed: 0
    });

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required', {
          description: 'Please sign in to upload documents'
        });
        router.push('/signin');
        return;
      }

      const token = session.access_token;
      const uploaded: UploadedDocument[] = [];
      let completedCount = 0;
      let failedCount = 0;

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        const progressPercent = Math.round(((i / files.length) * 100));
        setUploadProgress(progressPercent);

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

          // Call upload API
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data: UploadDocumentResponse = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          // Add to uploaded list
          if (data.document) {
            uploaded.push({
              ...data.document,
              file_name: file.name,
              file_size: file.size
            });
            completedCount++;
            
            toast.success(`Uploaded: ${file.name}`, {
              description: 'Text extraction started automatically'
            });
          }

        } catch (error) {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Update stats
        setUploadStats({
          total: files.length,
          completed: completedCount,
          failed: failedCount
        });
      }

      // Final progress
      setUploadProgress(100);

      // Update uploaded documents list
      setUploadedDocuments(prev => [...uploaded, ...prev]);

      // Show summary
      if (completedCount > 0) {
        toast.success('Upload complete', {
          description: `Successfully uploaded ${completedCount} of ${files.length} file(s)`
        });
      }

      if (failedCount === files.length) {
        toast.error('All uploads failed', {
          description: 'Please check your files and try again'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  /**
   * Clear uploaded documents list
   */
  const handleClearList = () => {
    setUploadedDocuments([]);
    setUploadStats({ total: 0, completed: 0, failed: 0 });
  };

  /**
   * Navigate to document in workflow
   */
  const handleViewDocument = (documentId: string) => {
    router.push(`/workflow/${documentId}/stage1`);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Document Upload</h1>
        <p className="text-muted-foreground">
          Upload up to 100 documents for processing. Supported formats include PDF, Word, text, markdown, and HTML files.
        </p>
      </div>

      {/* Upload Statistics */}
      {(uploadStats.total > 0 || uploadedDocuments.length > 0) && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Upload Session Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadStats.completed} uploaded • {uploadStats.failed} failed • {uploadedDocuments.length} total
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadStats.completed}</div>
                    <div className="text-xs text-muted-foreground">Uploaded</div>
                  </div>
                  {uploadStats.failed > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{uploadedDocuments.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Dropzone */}
      <UploadDropzone
        onFilesAdded={handleFilesAdded}
        currentFileCount={uploadedDocuments.length}
        maxFiles={100}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* Recently Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recently Uploaded Documents</h3>
            <Button variant="outline" size="sm" onClick={handleClearList}>
              Clear List
            </Button>
          </div>
          
          <div className="space-y-2">
            {uploadedDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.file_name} • {(doc.file_size / 1024).toFixed(0)} KB • Uploaded • Processing
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/dashboard')}>
              View All Documents
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Upload More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Explanation:**
- **Sequential Upload:** Uploads files one at a time to avoid overwhelming the server
- **Progress Tracking:** Shows real-time progress percentage
- **Error Handling:** Catches and displays individual file upload errors
- **Success Feedback:** Toast notifications + visual list of uploaded documents
- **Navigation:** Back to dashboard, view document in workflow
- **Statistics:** Shows upload session summary

**Verification:**
1. Page compiles with no TypeScript errors
2. All imports resolve correctly
3. Page will be accessible at: `/upload`



++++++++++++++++++++++++



## STEP 3: Create Upload Loading State

**DIRECTIVE:** You shall create a loading skeleton component for the upload page to display while the page is initializing.

**Instructions:**
1. Create file: `src/app/(dashboard)/upload/loading.tsx`
2. Copy the complete code below
3. Save

**File:** `src/app/(dashboard)/upload/loading.tsx`

```typescript
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

/**
 * Upload Page Loading State
 * 
 * Displays loading skeletons while the upload page initializes
 */
export default function UploadLoading() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Upload Zone Skeleton */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 min-h-[300px]">
          <div className="space-y-4 items-center flex flex-col">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats Skeleton */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Note:** If `Skeleton` component doesn't exist in your UI library, you can create it:

**File:** `src/components/ui/skeleton.tsx`

```typescript
import { cn } from '../../lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
```



++++++++++++++++++++++++



## STEP 4: Update Dashboard with Upload Button

**DIRECTIVE:** You shall add an "Upload Documents" button to the dashboard that navigates to the upload page.

**Instructions:**
1. Open file: `src/app/(dashboard)/dashboard/page.tsx`
2. Add the import and button as shown below
3. Save

**Modification to:** `src/app/(dashboard)/dashboard/page.tsx`

Find the dashboard header section (usually near the top of the page content) and add the upload button. The exact location may vary, but here's the general pattern:

```typescript
// Add this import at the top of the file
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Inside the component function, add:
const router = useRouter();

// In the JSX, add this button in the header section:
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <p className="text-muted-foreground">
      Manage your documents and training data
    </p>
  </div>
  <Button 
    onClick={() => router.push('/upload')}
    className="gap-2"
  >
    <Upload className="w-4 h-4" />
    Upload Documents
  </Button>
</div>
```

**Alternative:** If the dashboard structure is different, look for the main heading or action area and place the button there. The button should be prominent and easily accessible.

**Verification:**
1. Dashboard page compiles with no errors
2. "Upload Documents" button appears in dashboard
3. Clicking button navigates to `/upload`



++++++++++++++++++++++++



## PROMPT 2 COMPLETION CHECKLIST

Before proceeding to Prompt 3, verify all items below:

### Components Created
- [ ] Upload Dropzone component: `src/components/upload/upload-dropzone.tsx`
- [ ] Upload Page: `src/app/(dashboard)/upload/page.tsx`
- [ ] Upload Loading state: `src/app/(dashboard)/upload/loading.tsx`
- [ ] Skeleton component (if needed): `src/components/ui/skeleton.tsx`

### Dashboard Integration
- [ ] Dashboard updated with "Upload Documents" button
- [ ] Button navigates to `/upload` route

### Functionality Testing
- [ ] Run `npm run dev` and navigate to `http://localhost:3000/upload`
- [ ] Upload page loads with no errors
- [ ] Drag-drop zone displays correctly
- [ ] Can drag files onto dropzone (visual feedback appears)
- [ ] Can click "Select Files" button (file picker opens)
- [ ] File validation works (try invalid file types)
- [ ] File validation works (try files > 100MB)
- [ ] Upload a valid PDF file successfully
- [ ] Success toast notification appears
- [ ] File appears in "Recently Uploaded Documents" list
- [ ] Upload progress bar displays during upload
- [ ] "Back to Dashboard" button works
- [ ] Dashboard button "Upload Documents" navigates to upload page

### End-to-End Test Scenario

1. **Navigate from Dashboard:**
   - Start at `/dashboard`
   - Click "Upload Documents" button
   - Verify navigation to `/upload`

2. **Test Drag-Drop:**
   - Drag a PDF file onto the dropzone
   - Verify visual feedback (blue highlight)
   - Drop the file
   - Verify success toast appears

3. **Test File Selection:**
   - Click "Select Files" button
   - Choose 2-3 different file types (PDF, DOCX, TXT)
   - Verify success toasts appear

4. **Test Validation:**
   - Try to upload a .exe file (should fail)
   - Try to upload a 200MB file (should fail)
   - Verify error toast messages appear

5. **Verify Uploads:**
   - Check "Recently Uploaded Documents" list
   - All uploaded files should appear
   - Status should show "Uploaded • Processing"

6. **Check Database:**
   - Open Supabase Dashboard → Table Editor → documents
   - Verify new rows exist with status 'uploaded'

7. **Check Storage:**
   - Open Supabase Dashboard → Storage → documents bucket
   - Navigate to your user ID folder
   - Verify uploaded files exist

**If all items checked:** ✅ Prompt 2 complete! Proceed to Prompt 3.

---

## What's Next

**Prompt 3** will build:
- Text Extractor Service (handles PDF, DOCX, HTML, TXT, MD, RTF extraction)
- Document Processor (orchestrates extraction and database updates)
- Processing API Endpoint (triggers text extraction)
- Error handling and retry logic

After Prompt 3, you'll have a fully functional upload module with:
- ✅ File upload via drag-drop or selection
- ✅ Storage in Supabase
- ✅ Database records created
- ✅ Automatic text extraction from uploaded files
- ✅ Status tracking and error handling

---

**END OF PROMPT 2**

