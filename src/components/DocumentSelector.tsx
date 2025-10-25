/**
 * Document Selector Component
 * 
 * This is a convenience re-export of the DocumentSelectorServer component.
 * The actual implementation uses a server/client component pattern:
 * 
 * - DocumentSelectorServer: Fetches data server-side
 * - DocumentSelectorClient: Handles UI and interactivity
 * 
 * Updated in Prompt 6 to include:
 * - Source filter (Uploaded vs Seed documents)
 * - "Uploaded" badge for documents with file_path
 * - Integration with workflow navigation
 */

export { DocumentSelectorServer as DocumentSelector } from './server/DocumentSelectorServer';
export { DocumentSelectorClient } from './client/DocumentSelectorClient';
