/**
 * Database Health Monitoring Integration
 * 
 * Provides:
 * - Health status monitoring (HEALTHY, DEGRADED, UNHEALTHY, CRITICAL)
 * - Performance metrics collection
 * - Threshold-based alerting
 * - Periodic health checks
 * - Integration with DatabaseHealthService
 * 
 * @module database/health
 */

import { DatabaseHealthService } from '../services/database-health-service';
import { errorLogger } from '../../../@/lib/errors/error-logger';

/**
 * Health status levels
 */
export enum DatabaseHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  CRITICAL = 'CRITICAL',
}

/**
 * Health check result
 */
export interface DatabaseHealthCheck {
  /** Current health status */
  status: DatabaseHealthStatus;
  /** Human-readable status message */
  message: string;
  /** Performance metrics */
  metrics: {
    /** Connection pool usage percentage */
    connectionPoolUsage: number;
    /** Average query time in milliseconds */
    avgQueryTime: number;
    /** Cache hit ratio percentage */
    cacheHitRatio: number;
    /** Number of active connections */
    activeConnections: number;
    /** Number of idle connections */
    idleConnections: number;
  };
  /** List of recommendations for improvement */
  recommendations: string[];
  /** ISO timestamp when check was performed */
  lastChecked: string;
}

/**
 * Health thresholds configuration
 */
export interface HealthThresholds {
  /** Thresholds for degraded status */
  degraded: {
    /** Connection pool usage percentage */
    connectionPoolUsage: number;
    /** Average query time in milliseconds */
    avgQueryTime: number;
    /** Minimum cache hit ratio percentage */
    cacheHitRatio: number;
  };
  /** Thresholds for unhealthy status */
  unhealthy: {
    /** Connection pool usage percentage */
    connectionPoolUsage: number;
    /** Average query time in milliseconds */
    avgQueryTime: number;
    /** Minimum cache hit ratio percentage */
    cacheHitRatio: number;
  };
  /** Thresholds for critical status */
  critical: {
    /** Connection pool usage percentage */
    connectionPoolUsage: number;
    /** Average query time in milliseconds */
    avgQueryTime: number;
    /** Minimum cache hit ratio percentage */
    cacheHitRatio: number;
  };
}

/**
 * Default health thresholds
 */
const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds = {
  degraded: {
    connectionPoolUsage: 70,
    avgQueryTime: 100,
    cacheHitRatio: 90,
  },
  unhealthy: {
    connectionPoolUsage: 85,
    avgQueryTime: 250,
    cacheHitRatio: 80,
  },
  critical: {
    connectionPoolUsage: 95,
    avgQueryTime: 500,
    cacheHitRatio: 70,
  },
};

/**
 * Perform a database health check.
 * Collects metrics and determines health status based on thresholds.
 * 
 * @param thresholds Optional custom health thresholds
 * @returns Health check result with status and metrics
 * 
 * @example
 * ```typescript
 * const healthCheck = await performHealthCheck();
 * if (healthCheck.status === DatabaseHealthStatus.CRITICAL) {
 *   // Alert administrators
 *   console.error(healthCheck.message);
 *   console.log(healthCheck.recommendations);
 * }
 * ```
 */
export async function performHealthCheck(
  thresholds: HealthThresholds = DEFAULT_HEALTH_THRESHOLDS
): Promise<DatabaseHealthCheck> {
  const healthService = new DatabaseHealthService();
  
  try {
    // Get health metrics from existing service
    const report = await healthService.getHealthReport();
    
    // Calculate metrics
    const connectionPoolUsage = (report.connectionPool.activeConnections / report.connectionPool.maxConnections) * 100;
    const avgQueryTime = report.slowQueries.length > 0
      ? report.slowQueries.reduce((sum, q) => sum + q.meanTimeMs, 0) / report.slowQueries.length
      : 0;
    const cacheHitRatio = report.overview.cacheHitRatio;
    const activeConnections = report.connectionPool.activeConnections;
    const idleConnections = report.connectionPool.idleConnections;
    
    // Determine status
    let status: DatabaseHealthStatus;
    let message: string;
    const recommendations: string[] = [];
    
    if (
      connectionPoolUsage >= thresholds.critical.connectionPoolUsage ||
      avgQueryTime >= thresholds.critical.avgQueryTime ||
      cacheHitRatio < thresholds.critical.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.CRITICAL;
      message = 'Database health is critical. Immediate action required.';
      recommendations.push('Contact database administrator immediately');
      recommendations.push('Consider scaling database resources');
    } else if (
      connectionPoolUsage >= thresholds.unhealthy.connectionPoolUsage ||
      avgQueryTime >= thresholds.unhealthy.avgQueryTime ||
      cacheHitRatio < thresholds.unhealthy.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.UNHEALTHY;
      message = 'Database health is unhealthy. Performance degradation detected.';
      recommendations.push('Investigate slow queries');
      recommendations.push('Consider increasing connection pool size');
    } else if (
      connectionPoolUsage >= thresholds.degraded.connectionPoolUsage ||
      avgQueryTime >= thresholds.degraded.avgQueryTime ||
      cacheHitRatio < thresholds.degraded.cacheHitRatio
    ) {
      status = DatabaseHealthStatus.DEGRADED;
      message = 'Database health is degraded. Monitor closely.';
      recommendations.push('Review recent query patterns');
      recommendations.push('Optimize slow queries if possible');
    } else {
      status = DatabaseHealthStatus.HEALTHY;
      message = 'Database health is good.';
    }
    
    // Add specific recommendations
    if (connectionPoolUsage >= thresholds.degraded.connectionPoolUsage) {
      recommendations.push(`Connection pool usage is ${connectionPoolUsage.toFixed(1)}%. Consider increasing pool size.`);
    }
    if (avgQueryTime >= thresholds.degraded.avgQueryTime) {
      recommendations.push(`Average query time is ${avgQueryTime.toFixed(0)}ms. Investigate slow queries.`);
    }
    if (cacheHitRatio < thresholds.degraded.cacheHitRatio) {
      recommendations.push(`Cache hit ratio is ${cacheHitRatio.toFixed(1)}%. Consider increasing shared_buffers.`);
    }
    
    const healthCheck: DatabaseHealthCheck = {
      status,
      message,
      metrics: {
        connectionPoolUsage,
        avgQueryTime,
        cacheHitRatio,
        activeConnections,
        idleConnections,
      },
      recommendations,
      lastChecked: new Date().toISOString(),
    };
    
    // Log health status
    if (status === DatabaseHealthStatus.CRITICAL || status === DatabaseHealthStatus.UNHEALTHY) {
      errorLogger.error('Database health check failed', undefined, {
        status,
        metrics: healthCheck.metrics,
      });
    } else if (status === DatabaseHealthStatus.DEGRADED) {
      errorLogger.warn('Database health degraded', undefined, {
        status,
        metrics: healthCheck.metrics,
      });
    } else {
      errorLogger.debug('Database health check passed', {
        status,
      });
    }
    
    return healthCheck;
  } catch (error) {
    errorLogger.error('Failed to perform health check', error instanceof Error ? error : undefined, {
      component: 'DatabaseHealthMonitor',
    });
    
    return {
      status: DatabaseHealthStatus.UNHEALTHY,
      message: 'Failed to perform health check',
      metrics: {
        connectionPoolUsage: 0,
        avgQueryTime: 0,
        cacheHitRatio: 0,
        activeConnections: 0,
        idleConnections: 0,
      },
      recommendations: ['Health check service is unavailable', 'Contact system administrator'],
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Schedule periodic health checks.
 * Returns a cleanup function to stop the checks.
 * 
 * @param intervalMs Interval between health checks in milliseconds (default: 60000 = 1 minute)
 * @param onStatusChange Optional callback function called when health status changes
 * @returns Cleanup function to stop health checks
 * 
 * @example
 * ```typescript
 * const stopHealthChecks = scheduleHealthChecks(60000, (check) => {
 *   console.log('Health status changed:', check.status);
 *   if (check.status === DatabaseHealthStatus.CRITICAL) {
 *     // Send alert
 *   }
 * });
 * 
 * // Later, stop health checks
 * stopHealthChecks();
 * ```
 */
export function scheduleHealthChecks(
  intervalMs: number = 60000, // 1 minute default
  onStatusChange?: (check: DatabaseHealthCheck) => void
): () => void {
  let lastStatus: DatabaseHealthStatus | null = null;
  
  const checkHealth = async () => {
    const check = await performHealthCheck();
    
    // Notify if status changed
    if (check.status !== lastStatus && onStatusChange) {
      onStatusChange(check);
    }
    
    lastStatus = check.status;
  };
  
  // Run initial check
  checkHealth();
  
  // Schedule periodic checks
  const intervalId = setInterval(checkHealth, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

