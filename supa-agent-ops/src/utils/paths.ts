/**
 * Cross-platform path handling utilities
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Normalizes a file path to handle Windows-style paths
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

/**
 * Checks if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Gets the absolute path, handling relative paths correctly
 */
export function getAbsolutePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return normalizePath(filePath);
  }
  return normalizePath(path.resolve(process.cwd(), filePath));
}

/**
 * Generates a run ID based on current UTC time
 * Format: YYYYMMDDThhmmssZ
 */
export function generateRunId(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generates a report file path
 */
export function getReportPath(
  outputDir: string,
  table: string,
  runId: string,
  type: 'summary' | 'errors' | 'success'
): string {
  ensureDirectory(outputDir);
  return path.join(outputDir, `import-${table}-${runId}.${type}.json`);
}

