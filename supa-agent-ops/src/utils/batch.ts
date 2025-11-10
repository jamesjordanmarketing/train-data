/**
 * Batching utilities for processing large datasets
 */

/**
 * Splits an array into batches of a given size
 */
export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Processes batches with controlled concurrency
 */
export async function processBatches<T, R>(
  batches: T[][],
  processor: (batch: T[], batchIndex: number) => Promise<R>,
  concurrency: number = 2
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < batches.length; i += concurrency) {
    const batchGroup = batches.slice(i, i + concurrency);
    const promises = batchGroup.map((batch, idx) => 
      processor(batch, i + idx)
    );
    
    const groupResults = await Promise.all(promises);
    results.push(...groupResults);
  }
  
  return results;
}

/**
 * Implements exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  backoffMs: number = 300
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        // Exponential backoff: backoffMs * 2^(attempt-1)
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10; // One decimal place
}

