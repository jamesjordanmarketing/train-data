'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { cn } from '../ui/utils';

interface Document {
  id: string;
  title: string;
  doc_version: string | null;
  source_url: string | null;
  doc_date: string | null;
  source_type: string;
  file_size: number;
  status: string;
}

interface MetadataEditDialogProps {
  /** Document to edit */
  document: Document | null;
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog close is requested */
  onOpenChange: (open: boolean) => void;
  /** Callback after successful save */
  onSaveSuccess?: () => void;
}

/**
 * MetadataEditDialog Component
 * 
 * Modal dialog for editing document metadata
 * Features:
 * - Edit title, version, source URL, document date
 * - Form validation (required fields, URL format, date validation)
 * - Date picker for document date
 * - Save to API with loading state
 * - Error handling and user feedback
 */
export function MetadataEditDialog({
  document,
  open,
  onOpenChange,
  onSaveSuccess
}: MetadataEditDialogProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [docVersion, setDocVersion] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [docDate, setDocDate] = useState<Date | undefined>(undefined);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Initialize form when document changes
   */
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDocVersion(document.doc_version || '');
      setSourceUrl(document.source_url || '');
      setDocDate(document.doc_date ? new Date(document.doc_date) : undefined);
      setErrors({});
    }
  }, [document]);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title is required
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 500) {
      newErrors.title = 'Title cannot exceed 500 characters';
    }

    // Source URL validation (if provided)
    if (sourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(sourceUrl)) {
        newErrors.sourceUrl = 'Must be a valid HTTP or HTTPS URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!document) return;

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Prepare update payload
      const updates: Record<string, any> = {
        title: title.trim(),
        doc_version: docVersion.trim() || null,
        source_url: sourceUrl.trim() || null,
        doc_date: docDate ? docDate.toISOString() : null
      };

      // Call API
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update metadata');
      }

      toast.success('Metadata updated successfully');
      onOpenChange(false);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }

    } catch (error) {
      console.error('[MetadataEditDialog] Save error:', error);
      toast.error('Failed to save metadata', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onOpenChange(false);
    // Reset form to original values
    if (document) {
      setTitle(document.title);
      setDocVersion(document.doc_version || '');
      setSourceUrl(document.source_url || '');
      setDocDate(document.doc_date ? new Date(document.doc_date) : undefined);
      setErrors({});
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Document Metadata</DialogTitle>
          <DialogDescription>
            Update document information. Changes are saved to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Version Field */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={docVersion}
              onChange={(e) => setDocVersion(e.target.value)}
              placeholder="e.g., v1.0, Draft, Final"
            />
            <p className="text-xs text-muted-foreground">
              Optional version or status label
            </p>
          </div>

          {/* Source URL Field */}
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/document"
              className={cn(errors.sourceUrl && 'border-red-500')}
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-500">{errors.sourceUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional URL where document was sourced
            </p>
          </div>

          {/* Document Date Field */}
          <div className="space-y-2">
            <Label htmlFor="docDate">Document Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !docDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {docDate ? format(docDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={docDate}
                  onSelect={setDocDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Original document date (not upload date)
            </p>
          </div>

          {/* Read-Only Fields */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">File Type</p>
                <p className="font-medium uppercase">{document.source_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">
                  {(document.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{document.status}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

