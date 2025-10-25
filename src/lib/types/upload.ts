// ================================================
// Document Upload Module - Type Definitions
// ================================================
// Purpose: Centralized type definitions for upload functionality
// Version: 1.0
// Date: 2025-10-10

/**
 * Supported file types for document upload
 */
export type SupportedFileType = 
  | 'pdf' 
  | 'docx' 
  | 'doc' 
  | 'txt' 
  | 'md' 
  | 'markdown' 
  | 'html' 
  | 'htm' 
  | 'rtf';

/**
 * Document processing status
 * - uploaded: File uploaded to storage, pending text extraction
 * - processing: Text extraction in progress
 * - completed: Text extraction successful, document ready for categorization
 * - error: Text extraction failed
 * - paused: Processing manually paused by user (future feature)
 */
export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'paused';

/**
 * Document upload priority (for future queue management)
 */
export type DocumentPriority = 'high' | 'medium' | 'low';

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'INVALID_NAME' | 'CAPACITY_EXCEEDED';
}

/**
 * Document metadata captured during upload
 */
export interface DocumentMetadata {
  title: string;
  doc_version?: string | null;
  source_url?: string | null;
  doc_date?: string | null; // ISO 8601 date string
  source_type: SupportedFileType;
  file_size: number;
  file_path: string;
}

/**
 * Upload API response payload
 */
export interface UploadDocumentResponse {
  success: boolean;
  document?: {
    id: string;
    title: string;
    status: DocumentStatus;
    file_path: string;
    created_at: string;
  };
  error?: string;
  errorCode?: string;
}

/**
 * Processing API request payload
 */
export interface ProcessDocumentRequest {
  documentId: string;
}

/**
 * Processing API response payload
 */
export interface ProcessDocumentResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_BATCH_SIZE: 100, // Maximum files per upload session
} as const;

/**
 * Supported MIME types mapping for validation
 */
export const MIME_TYPE_MAP: Record<SupportedFileType, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword'],
  txt: ['text/plain'],
  md: ['text/markdown', 'text/x-markdown'],
  markdown: ['text/markdown', 'text/x-markdown'],
  html: ['text/html'],
  htm: ['text/html'],
  rtf: ['application/rtf', 'text/rtf'],
};

/**
 * Detect file type from filename extension
 * @param filename - Name of the file including extension
 * @returns Detected file type or null if unsupported
 */
export function detectFileType(filename: string): SupportedFileType | null {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  
  const supportedTypes: SupportedFileType[] = [
    'pdf', 'docx', 'doc', 'txt', 'md', 'markdown', 'html', 'htm', 'rtf'
  ];
  
  if (supportedTypes.includes(extension as SupportedFileType)) {
    return extension as SupportedFileType;
  }
  
  return null;
}

/**
 * Validate file for upload eligibility
 * @param file - File object to validate
 * @param currentFileCount - Number of files already in upload queue
 * @returns Validation result with error details if invalid
 */
export function validateFile(file: File, currentFileCount: number): FileValidationResult {
  // Check capacity limit
  if (currentFileCount >= FILE_SIZE_LIMITS.MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Maximum file limit reached (${FILE_SIZE_LIMITS.MAX_BATCH_SIZE} files). Please process or remove some files.`,
      errorCode: 'CAPACITY_EXCEEDED',
    };
  }

  // Check file size limit
  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum limit of 100MB. File size: ${sizeMB}MB`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  // Check file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      valid: false,
      error: `Unsupported file type. Supported formats: PDF, DOCX, DOC, TXT, MD, HTML, RTF`,
      errorCode: 'UNSUPPORTED_TYPE',
    };
  }

  // Validate filename characters (prevent path traversal and invalid chars)
  const invalidChars = /[<>:"|?*\x00-\x1F]/;
  if (invalidChars.test(file.name)) {
    return {
      valid: false,
      error: 'Filename contains invalid characters. Please rename the file.',
      errorCode: 'INVALID_NAME',
    };
  }

  // Check for path traversal attempts
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Filename cannot contain path separators.',
      errorCode: 'INVALID_NAME',
    };
  }

  return { valid: true };
}

/**
 * Format file size for human-readable display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format timestamp as relative time ago
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted string (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Sanitize filename for storage
 * Replaces problematic characters with underscores
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}