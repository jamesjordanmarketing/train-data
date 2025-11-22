'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '../../../components/upload/upload-dropzone';
import { UploadQueue } from '../../../components/upload/upload-queue';
import { UploadStats } from '../../../components/upload/upload-stats';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ArrowLeft, Upload as UploadIcon, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { UploadDocumentResponse } from '@/lib/types/upload';

/**
 * Upload Page Component (Updated)
 * 
 * Enhanced upload page with:
 * - Two tabs: "Upload Files" and "Manage Queue"
 * - Upload dropzone in upload tab
 * - Full queue management in manage tab
 * - Statistics dashboard
 * - Real-time status updates
 */
export default function UploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('upload');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [queueRefreshKey, setQueueRefreshKey] = React.useState(0);

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

          completedCount++;
          
          // Immediately trigger processing from client side
          const documentId = data.document?.id;
          if (documentId) {
            console.log(`[Upload] Triggering processing for document ${documentId}`);
            
            // Trigger processing with fire-and-forget (don't block UI)
            fetch('/api/documents/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ documentId })
            }).then(procResponse => {
              if (procResponse.ok) {
                console.log(`[Upload] Processing started for ${documentId}`);
              } else {
                console.error(`[Upload] Failed to start processing for ${documentId}`);
                toast.warning(`Upload succeeded but processing may be delayed`, {
                  description: 'Try refreshing the page if status doesn\'t update'
                });
              }
            }).catch(procError => {
              console.error(`[Upload] Processing trigger error:`, procError);
              toast.warning(`Processing trigger failed`, {
                description: 'Document uploaded but may need manual processing'
              });
            });
          }
          
          toast.success(`Uploaded: ${file.name}`, {
            description: 'Processing started automatically'
          });

        } catch (error) {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Final progress
      setUploadProgress(100);

      // Show summary
      if (completedCount > 0) {
        toast.success('Upload complete', {
          description: `Successfully uploaded ${completedCount} of ${files.length} file(s)`
        });
        
        // Switch to queue tab and refresh
        setActiveTab('queue');
        setQueueRefreshKey(prev => prev + 1);
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

  return (
    <div className="container mx-auto py-8 max-w-7xl">
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
        <h1 className="text-3xl font-bold">Document Upload & Management</h1>
        <p className="text-muted-foreground">
          Upload documents for processing, monitor status, and manage your upload queue
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div className="mb-6">
        <UploadStats refreshInterval={5000} />
      </div>

      {/* Tabs: Upload vs Queue Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload" className="gap-2">
            <UploadIcon className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <ListFilter className="w-4 h-4" />
            Manage Queue
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <UploadDropzone
            onFilesAdded={handleFilesAdded}
            currentFileCount={0}
            maxFiles={100}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </TabsContent>

        {/* Queue Management Tab */}
        <TabsContent value="queue">
          <UploadQueue key={queueRefreshKey} autoRefresh={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

