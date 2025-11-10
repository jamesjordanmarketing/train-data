/**
 * Import operations - Primary agent tool
 */

import * as fs from 'fs';
import * as readline from 'readline';
import { AgentImportParams, AgentImportResult, BatchResult } from '../core/types';
import { DEFAULT_LIBRARY_CONFIG } from '../core/config';
import { getSupabaseClient, getPgClient, closePgClient } from '../core/client';
import { sanitizeRecord } from '../validation/sanitize';
import { normalizeRecord } from '../validation/normalize';
import { createBatches, processBatches, retryWithBackoff } from '../utils/batch';
import { logger } from '../utils/logger';
import { generateRunId, getReportPath, ensureDirectory, fileExists, getAbsolutePath } from '../utils/paths';
import { generateErrorReport, generateSummaryReport, generateSuccessReport, writeReport } from '../errors/reports';
import { suggestNextActions } from '../errors/handlers';
import { agentPreflight, detectPrimaryKey } from '../preflight/checks';

/**
 * Reads records from NDJSON or JSON file
 */
async function readRecordsFromFile(filePath: string): Promise<Record<string, any>[]> {
  const absolutePath = getAbsolutePath(filePath);
  
  if (!fileExists(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');

  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // Single object
    return [parsed];
  } catch {
    // Parse as NDJSON
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => JSON.parse(line));
  }
}

/**
 * Processes a batch using Supabase client
 */
async function processBatchSupabase(
  table: string,
  batch: Record<string, any>[],
  mode: 'insert' | 'upsert',
  onConflict?: string | string[]
): Promise<BatchResult> {
  const supabase = getSupabaseClient();

  try {
    if (mode === 'upsert') {
      const onConflictColumns = Array.isArray(onConflict) ? onConflict.join(',') : onConflict || 'id';
      const { data, error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: onConflictColumns });

      if (error) {
        return { success: false, recordCount: batch.length, errors: [error] };
      }

      return { success: true, recordCount: batch.length };
    } else {
      const { data, error } = await supabase
        .from(table)
        .insert(batch);

      if (error) {
        return { success: false, recordCount: batch.length, errors: [error] };
      }

      return { success: true, recordCount: batch.length };
    }
  } catch (error) {
    return { success: false, recordCount: batch.length, errors: [error] };
  }
}

/**
 * Processes a batch using pg client
 */
async function processBatchPg(
  table: string,
  batch: Record<string, any>[],
  mode: 'insert' | 'upsert',
  onConflict?: string | string[]
): Promise<BatchResult> {
  const client = await getPgClient();
  const errors: any[] = [];

  try {
    for (const record of batch) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      let query = '';
      if (mode === 'upsert') {
        const conflictColumns = Array.isArray(onConflict) ? onConflict.join(', ') : onConflict || 'id';
        const updateSet = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
        query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (${conflictColumns}) DO UPDATE SET ${updateSet}`;
      } else {
        query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      }

      try {
        await client.query(query, values);
      } catch (error) {
        errors.push({ record, error });
      }
    }

    if (errors.length > 0) {
      return { success: false, recordCount: batch.length, errors };
    }

    return { success: true, recordCount: batch.length };
  } catch (error) {
    return { success: false, recordCount: batch.length, errors: [error] };
  }
}

/**
 * Import records into a Supabase table - Agent-optimized function
 */
export async function agentImportTool(params: AgentImportParams): Promise<AgentImportResult> {
  const startTime = Date.now();
  const runId = generateRunId();
  
  // Merge with defaults
  const config = {
    mode: params.mode || 'insert',
    onConflict: params.onConflict,
    outputDir: params.outputDir || DEFAULT_LIBRARY_CONFIG.outputDir,
    batchSize: params.batchSize || DEFAULT_LIBRARY_CONFIG.batchSize,
    concurrency: params.concurrency || DEFAULT_LIBRARY_CONFIG.concurrency,
    dryRun: params.dryRun || false,
    retry: {
      maxAttempts: params.retry?.maxAttempts || DEFAULT_LIBRARY_CONFIG.retry.maxAttempts,
      backoffMs: params.retry?.backoffMs || DEFAULT_LIBRARY_CONFIG.retry.backoffMs
    },
    validateCharacters: params.validateCharacters !== false,
    sanitize: params.sanitize !== false,
    normalization: params.normalization || 'NFC',
    transport: params.transport || DEFAULT_LIBRARY_CONFIG.transport
  };

  logger.info('Starting import', { table: params.table, mode: config.mode, runId });

  // Run preflight checks
  const preflight = await agentPreflight({
    table: params.table,
    mode: config.mode,
    onConflict: config.onConflict,
    transport: config.transport
  });

  if (!preflight.ok) {
    logger.error('Preflight checks failed', { issues: preflight.issues });
    
    const reportPath = getReportPath(config.outputDir, params.table, runId, 'summary');
    const summary = generateSummaryReport(
      runId,
      params.table,
      { total: 0, success: 0, failed: 0, skipped: 0, durationMs: Date.now() - startTime },
      [`Preflight failed: ${preflight.issues.join(', ')}`],
      {
        mode: config.mode,
        onConflict: config.onConflict,
        batchSize: config.batchSize,
        concurrency: config.concurrency,
        sanitize: config.sanitize,
        normalization: config.normalization,
        transport: config.transport
      },
      preflight.recommendations.map(r => ({ 
        action: 'FIX_CONFIGURATION', 
        description: r.description, 
        example: r.example, 
        priority: r.priority 
      }))
    );
    writeReport(reportPath, summary);

    return {
      success: false,
      summary: `Preflight checks failed for table: ${params.table}`,
      totals: { total: 0, success: 0, failed: 0, skipped: 0, durationMs: Date.now() - startTime },
      reportPaths: { summary: reportPath },
      nextActions: preflight.recommendations.map(r => ({ 
        action: 'FIX_CONFIGURATION', 
        description: r.description, 
        example: r.example, 
        priority: r.priority 
      }))
    };
  }

  // Auto-detect primary key if needed
  if (config.mode === 'upsert' && !config.onConflict) {
    const detectedKey = await detectPrimaryKey(params.table, config.transport);
    config.onConflict = detectedKey || 'id';
    logger.info('Auto-detected primary key', { onConflict: config.onConflict });
  }

  // Load records
  let records: Record<string, any>[];
  if (typeof params.source === 'string') {
    records = await readRecordsFromFile(params.source);
  } else {
    records = params.source;
  }

  logger.info('Loaded records', { count: records.length });

  // Sanitize and normalize records
  const warnings: string[] = [];
  const processedRecords = records.map(record => {
    let processed = normalizeRecord(record);
    
    if (config.sanitize) {
      const sanitized = sanitizeRecord(processed, {
        ...DEFAULT_LIBRARY_CONFIG.validation,
        normalizeUnicode: config.normalization
      });
      processed = sanitized.sanitized;
      warnings.push(...sanitized.warnings);
    }
    
    return processed;
  });

  // Dry run mode
  if (config.dryRun) {
    logger.info('Dry run mode - skipping database writes');
    
    const reportPath = getReportPath(config.outputDir, params.table, runId, 'summary');
    const summary = generateSummaryReport(
      runId,
      params.table,
      { total: records.length, success: records.length, failed: 0, skipped: 0, durationMs: Date.now() - startTime },
      warnings,
      {
        mode: config.mode,
        onConflict: config.onConflict,
        batchSize: config.batchSize,
        concurrency: config.concurrency,
        sanitize: config.sanitize,
        normalization: config.normalization,
        transport: config.transport
      },
      [{ action: 'RUN_IMPORT', description: 'Dry run completed successfully. Ready for actual import.', priority: 'MEDIUM' }]
    );
    writeReport(reportPath, summary);

    return {
      success: true,
      summary: `Dry run completed for table: ${params.table}. Total: ${records.length}`,
      totals: { total: records.length, success: records.length, failed: 0, skipped: 0, durationMs: Date.now() - startTime },
      reportPaths: { summary: reportPath },
      nextActions: [{ action: 'RUN_IMPORT', description: 'Dry run completed successfully. Ready for actual import.', priority: 'MEDIUM' }]
    };
  }

  // Create batches
  const batches = createBatches(processedRecords, config.batchSize);
  logger.info('Created batches', { batchCount: batches.length });

  // Process batches
  const successfulRecords: Record<string, any>[] = [];
  const failedRecords: Array<{ record: Record<string, any>; error: any }> = [];

  const processor = async (batch: Record<string, any>[], batchIndex: number): Promise<BatchResult> => {
    logger.debug('Processing batch', { batchIndex, size: batch.length });

    return await retryWithBackoff(
      async () => {
        if (config.transport === 'pg') {
          return await processBatchPg(params.table, batch, config.mode, config.onConflict);
        } else {
          return await processBatchSupabase(params.table, batch, config.mode, config.onConflict);
        }
      },
      config.retry.maxAttempts,
      config.retry.backoffMs
    );
  };

  const results = await processBatches(batches, processor, config.concurrency);

  // Collect results
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const batch = batches[i];

    if (result.success) {
      successfulRecords.push(...batch);
    } else {
      if (result.errors) {
        failedRecords.push(...result.errors);
      } else {
        // If no specific error details, add all records from batch
        batch.forEach(record => {
          failedRecords.push({ record, error: new Error('Unknown batch error') });
        });
      }
    }
  }

  const totals = {
    total: records.length,
    success: successfulRecords.length,
    failed: failedRecords.length,
    skipped: 0,
    durationMs: Date.now() - startTime
  };

  // Generate reports
  ensureDirectory(config.outputDir);
  
  const summaryPath = getReportPath(config.outputDir, params.table, runId, 'summary');
  const nextActions = suggestNextActions(totals.failed === 0, warnings.length > 0, failedRecords);
  
  const summary = generateSummaryReport(
    runId,
    params.table,
    totals,
    warnings.slice(0, 100), // Limit warnings in report
    {
      mode: config.mode,
      onConflict: config.onConflict,
      batchSize: config.batchSize,
      concurrency: config.concurrency,
      sanitize: config.sanitize,
      normalization: config.normalization,
      transport: config.transport
    },
    nextActions
  );
  writeReport(summaryPath, summary);

  const reportPaths: { summary: string; errors?: string; success?: string } = { summary: summaryPath };

  if (failedRecords.length > 0) {
    const errorsPath = getReportPath(config.outputDir, params.table, runId, 'errors');
    const errorReport = generateErrorReport(runId, params.table, failedRecords);
    writeReport(errorsPath, errorReport);
    reportPaths.errors = errorsPath;
  }

  if (successfulRecords.length > 0) {
    const successPath = getReportPath(config.outputDir, params.table, runId, 'success');
    const successReport = generateSuccessReport(runId, params.table, successfulRecords);
    writeReport(successPath, successReport);
    reportPaths.success = successPath;
  }

  // Close pg client if used
  if (config.transport === 'pg') {
    await closePgClient();
  }

  const success = failedRecords.length === 0;
  const summaryText = `Import ${success ? 'completed' : 'completed with errors'} for table: ${params.table}\nTotal: ${totals.total} | Success: ${totals.success} | Failed: ${totals.failed} | Duration: ${(totals.durationMs / 1000).toFixed(2)}s`;

  logger.info('Import completed', { success, totals });

  return {
    success,
    summary: summaryText,
    totals,
    reportPaths,
    nextActions
  };
}

/**
 * Analyzes import errors and provides recovery steps
 */
export async function analyzeImportErrors(result: AgentImportResult): Promise<{
  recoverySteps: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    errorCode: string;
    affectedCount: number;
    action: string;
    description: string;
    example?: string;
    automatable: boolean;
  }>;
}> {
  // If there's an error report, read it
  if (result.reportPaths.errors) {
    const errorReport = fs.readFileSync(result.reportPaths.errors, 'utf-8');
    const parsed = JSON.parse(errorReport);
    
    return {
      recoverySteps: parsed.recoverySteps || []
    };
  }

  return { recoverySteps: [] };
}

/**
 * Generates dollar-quoted SQL for manual execution in SQL Editor
 */
export function generateDollarQuotedInsert(
  table: string,
  record: Record<string, any>
): string {
  const columns = Object.keys(record);
  const values = columns.map(col => {
    const value = record[col];

    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'object') {
      // JSONB: use dollar-quoting to avoid escaping issues
      return `$$${JSON.stringify(value)}$$::jsonb`;
    }

    if (typeof value === 'string') {
      // Text: use dollar-quoting
      return `$$${value}$$`;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      // Array: use dollar-quoting for each element
      const elements = value.map(v => `$$${String(v)}$$`);
      return `ARRAY[${elements.join(', ')}]`;
    }

    return 'NULL';
  });

  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

