/**
 * Report generation for errors, summaries, and success logs
 */

import * as fs from 'fs';
import { 
  ErrorReport, 
  SummaryReport, 
  SuccessReport, 
  ErrorBreakdownItem,
  FailedRecord,
  NextAction,
  ImportMode,
  UnicodeNormalization,
  Transport
} from '../core/types';
import { mapDatabaseError } from './codes';
import { generateRecoverySteps } from './handlers';
import { calculatePercentage } from '../utils/batch';

/**
 * Generates an error report
 */
export function generateErrorReport(
  runId: string,
  table: string,
  errors: Array<{ record: Record<string, any>; error: any }>
): ErrorReport {
  // Group errors by code
  const errorGroups = new Map<string, number>();
  const errorCodeDetails = new Map<string, any>();

  for (const { error } of errors) {
    const mapped = mapDatabaseError(error);
    const count = errorGroups.get(mapped.code) || 0;
    errorGroups.set(mapped.code, count + 1);
    
    if (!errorCodeDetails.has(mapped.code)) {
      errorCodeDetails.set(mapped.code, mapped);
    }
  }

  // Create error breakdown
  const errorBreakdown: ErrorBreakdownItem[] = [];
  for (const [code, count] of errorGroups.entries()) {
    const details = errorCodeDetails.get(code)!;
    errorBreakdown.push({
      code,
      pgCode: details.pgCode,
      count,
      percentage: calculatePercentage(count, errors.length),
      description: details.description
    });
  }

  // Sort by count descending
  errorBreakdown.sort((a, b) => b.count - a.count);

  // Create failed records list (limit to first 100 for report size)
  const failedRecords: FailedRecord[] = errors.slice(0, 100).map(({ record, error }) => {
    const mapped = mapDatabaseError(error);
    return {
      record,
      error: {
        code: mapped.code,
        pgCode: mapped.pgCode,
        message: error.message || String(error),
        detail: error.detail
      }
    };
  });

  // Generate recovery steps
  const recoverySteps = generateRecoverySteps(errors);

  return {
    runId,
    table,
    totalErrors: errors.length,
    errorBreakdown,
    failedRecords,
    recoverySteps
  };
}

/**
 * Generates a summary report
 */
export function generateSummaryReport(
  runId: string,
  table: string,
  totals: { total: number; success: number; failed: number; skipped: number; durationMs: number },
  warnings: string[],
  config: {
    mode: ImportMode;
    onConflict?: string | string[];
    batchSize: number;
    concurrency: number;
    sanitize: boolean;
    normalization: UnicodeNormalization;
    transport: Transport;
  },
  nextActions: NextAction[]
): SummaryReport {
  return {
    runId,
    table,
    totals,
    warnings,
    config,
    nextActions
  };
}

/**
 * Generates a success report
 */
export function generateSuccessReport(
  runId: string,
  table: string,
  successfulRecords: Record<string, any>[]
): SuccessReport {
  // For large imports, only include record IDs to keep file size reasonable
  const records = successfulRecords.slice(0, 1000).map(record => {
    if ('id' in record) {
      return { id: record.id };
    }
    return record;
  });

  return {
    runId,
    table,
    totalSuccess: successfulRecords.length,
    records
  };
}

/**
 * Writes a report to a file
 */
export function writeReport(filePath: string, report: any): void {
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
}

/**
 * Reads a report from a file
 */
export function readReport<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

