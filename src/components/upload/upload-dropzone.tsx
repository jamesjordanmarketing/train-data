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

