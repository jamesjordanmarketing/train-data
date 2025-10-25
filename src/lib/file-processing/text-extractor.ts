import { SupportedFileType } from '../types/upload';

// Use dynamic imports to prevent build-time evaluation
// This fixes Vercel build issues with pdf-parse test files
let pdfParse: any;
let mammoth: any;
let htmlToText: any;

async function loadPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
}

async function loadMammoth() {
  if (!mammoth) {
    mammoth = await import('mammoth');
  }
  return mammoth;
}

async function loadHtmlToText() {
  if (!htmlToText) {
    const module = await import('html-to-text');
    htmlToText = module.convert;
  }
  return htmlToText;
}

/**
 * Text extraction error types
 */
export type ExtractionErrorType = 
  | 'CORRUPT_FILE'
  | 'UNSUPPORTED_CONTENT'
  | 'TIMEOUT'
  | 'SERVER_ERROR';

/**
 * Custom error class for text extraction failures
 */
export class ExtractionError extends Error {
  constructor(
    message: string,
    public type: ExtractionErrorType,
    public documentId: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Text Extractor Service
 * 
 * Handles text extraction from various file formats:
 * - PDF (via pdf-parse)
 * - DOCX (via mammoth)
 * - HTML (via html-to-text)
 * - TXT, MD, RTF (direct read)
 */
export class TextExtractor {
  /**
   * Extract text from a file buffer based on source type
   * @param buffer - File buffer (from Supabase Storage)
   * @param sourceType - Detected file type
   * @param documentId - Document ID for error tracking
   * @returns Extracted plain text
   */
  async extractText(
    buffer: Buffer, 
    sourceType: SupportedFileType,
    documentId: string
  ): Promise<string> {
    try {
      switch (sourceType) {
        case 'pdf':
          return await this.extractFromPDF(buffer, documentId);
        
        case 'docx':
        case 'doc':
          return await this.extractFromDOCX(buffer, documentId);
        
        case 'html':
        case 'htm':
          return await this.extractFromHTML(buffer, documentId);
        
        case 'txt':
        case 'md':
        case 'markdown':
        case 'rtf':
          return await this.extractFromPlainText(buffer, documentId);
        
        default:
          throw new ExtractionError(
            `Unsupported file type: ${sourceType}`,
            'UNSUPPORTED_CONTENT',
            documentId,
            false
          );
      }
    } catch (error) {
      // Re-throw ExtractionError as-is
      if (error instanceof ExtractionError) {
        throw error;
      }
      
      // Wrap other errors
      throw new ExtractionError(
        `Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SERVER_ERROR',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from PDF file
   * Uses pdf-parse library
   */
  private async extractFromPDF(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const pdfParseFunc = await loadPdfParse();
      const data = await pdfParseFunc(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new ExtractionError(
          'PDF contains no extractable text. It may be a scanned image or empty.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(data.text);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. File may be corrupt or contain only images.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from DOCX file
   * Uses mammoth library
   */
  private async extractFromDOCX(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const mammothLib = await loadMammoth();
      const result = await mammothLib.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new ExtractionError(
          'DOCX file contains no extractable text or is empty.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Check for warnings (mammoth may have issues with document structure)
      if (result.messages && result.messages.length > 0) {
        console.warn(`DOCX extraction warnings for ${documentId}:`, result.messages);
      }

      // Clean up text
      const cleanedText = this.cleanText(result.value);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. File may be corrupt.',
          'CORRUPT_FILE',
          documentId,
          true
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from HTML file
   * Uses html-to-text library
   */
  private async extractFromHTML(buffer: Buffer, documentId: string): Promise<string> {
    try {
      const htmlContent = buffer.toString('utf8');
      const htmlToTextFunc = await loadHtmlToText();
      
      // Convert HTML to plain text with formatting options
      const text = htmlToTextFunc(htmlContent, {
        wordwrap: false,
        preserveNewlines: true,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
        ]
      });
      
      if (!text || text.trim().length === 0) {
        throw new ExtractionError(
          'HTML file contains no extractable text content.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(text);
      
      // Validate minimum length
      if (cleanedText.length < 10) {
        throw new ExtractionError(
          'Extracted text is too short. HTML file may be empty or contain only markup.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Extract text from plain text files (TXT, MD, RTF)
   * Direct buffer read with encoding detection
   */
  private async extractFromPlainText(buffer: Buffer, documentId: string): Promise<string> {
    try {
      // Try UTF-8 encoding first
      let text = buffer.toString('utf8');
      
      // If UTF-8 decode failed (contains replacement characters), try other encodings
      if (text.includes('\uFFFD')) {
        console.log(`UTF-8 decode failed for ${documentId}, trying latin1...`);
        text = buffer.toString('latin1');
      }
      
      if (!text || text.trim().length === 0) {
        throw new ExtractionError(
          'Text file is empty or contains no readable content.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      // Clean up text
      const cleanedText = this.cleanText(text);
      
      // Validate minimum length
      if (cleanedText.length < 5) {
        throw new ExtractionError(
          'File is too short or contains no readable text.',
          'UNSUPPORTED_CONTENT',
          documentId,
          false
        );
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      
      throw new ExtractionError(
        `Text file reading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CORRUPT_FILE',
        documentId,
        true
      );
    }
  }

  /**
   * Clean and normalize extracted text
   * - Remove excessive whitespace
   * - Normalize line endings
   * - Remove null bytes
   * - Trim whitespace
   */
  private cleanText(text: string): string {
    return text
      // Remove null bytes
      .replace(/\0/g, '')
      // Normalize line endings to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive blank lines (more than 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      // Remove excessive spaces (more than 2 consecutive)
      .replace(/ {3,}/g, '  ')
      // Trim leading/trailing whitespace
      .trim();
  }

  /**
   * Validate extracted text meets quality standards
   * @param text - Extracted text
   * @param documentId - Document ID for error tracking
   * @throws ExtractionError if validation fails
   */
  validateExtractedText(text: string, documentId: string): void {
    // Minimum length check
    if (text.length < 100) {
      throw new ExtractionError(
        `Extracted text is too short (${text.length} characters). Minimum 100 characters required.`,
        'UNSUPPORTED_CONTENT',
        documentId,
        false
      );
    }

    // Maximum length check (10MB)
    const maxLength = 10 * 1024 * 1024;
    if (text.length > maxLength) {
      throw new ExtractionError(
        `Extracted text is too large (${text.length} characters). Maximum ${maxLength} characters allowed.`,
        'UNSUPPORTED_CONTENT',
        documentId,
        false
      );
    }

    // Check for mostly binary/garbled content
    const printableChars = text.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
    const printableRatio = printableChars / text.length;
    
    if (printableRatio < 0.7) {
      throw new ExtractionError(
        'Extracted text contains mostly non-printable characters. File may be binary or corrupted.',
        'CORRUPT_FILE',
        documentId,
        false
      );
    }
  }
}

// Export singleton instance
export const textExtractor = new TextExtractor();

