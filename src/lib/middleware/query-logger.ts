import { queryPerformanceService } from '@/lib/services/query-performance-service';

/**
 * Wraps a database query with performance logging
 * 
 * Automatically tracks query execution time and logs performance metrics.
 * Queries exceeding 500ms will automatically generate alerts.
 * 
 * @param queryFn - The database query function to execute
 * @param context - Metadata about the query (name, endpoint, user, parameters)
 * @returns The result of the query function
 * 
 * @example
 * ```typescript
 * // In conversation-service.ts:
 * async list(filters: FilterConfig): Promise<Conversation[]> {
 *   return withQueryLogging(
 *     async () => {
 *       const { data } = await supabase
 *         .from('conversations')
 *         .select('*')
 *         .eq('status', filters.status);
 *       return data || [];
 *     },
 *     {
 *       queryName: 'conversations.list',
 *       endpoint: '/api/conversations',
 *       parameters: filters,
 *     }
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // With user context from API route:
 * export async function GET(request: Request) {
 *   const userId = await getCurrentUserId();
 *   
 *   const conversations = await withQueryLogging(
 *     () => conversationService.list({ statuses: ['approved'] }),
 *     {
 *       queryName: 'conversations.list',
 *       endpoint: '/api/conversations',
 *       userId,
 *       parameters: { statuses: ['approved'] }
 *     }
 *   );
 *   
 *   return NextResponse.json(conversations);
 * }
 * ```
 */
export async function withQueryLogging<T>(
  queryFn: () => Promise<T>,
  context: {
    queryName: string;
    endpoint?: string;
    userId?: string;
    parameters?: Record<string, any>;
  }
): Promise<T> {
  const startTime = performance.now();
  let error: Error | undefined;

  try {
    const result = await queryFn();
    return result;
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    const duration = Math.round(performance.now() - startTime);
    
    // Log performance (don't await to avoid slowing down the query)
    queryPerformanceService.logQuery({
      query_text: context.queryName,
      duration_ms: duration,
      user_id: context.userId,
      endpoint: context.endpoint,
      parameters: context.parameters,
      error_message: error?.message,
      stack_trace: error?.stack,
    }).catch(err => {
      console.error('Failed to log query performance:', err);
    });
  }
}

