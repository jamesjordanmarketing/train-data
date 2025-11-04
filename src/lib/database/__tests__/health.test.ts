/**
 * Database Health Monitoring Unit Tests
 * 
 * Tests for health monitoring functionality:
 * - Health status determination
 * - Threshold configuration
 * - Recommendations generation
 * - Periodic health checks
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  performHealthCheck,
  scheduleHealthChecks,
  DatabaseHealthStatus,
  DatabaseHealthCheck,
  HealthThresholds,
} from '../health';

// Mock DatabaseHealthService
const mockGetHealthReport = jest.fn();
jest.mock('../../services/database-health-service', () => ({
  DatabaseHealthService: jest.fn().mockImplementation(() => ({
    getHealthReport: mockGetHealthReport,
  })),
}));

// Mock errorLogger
jest.mock('../../../../train-wireframe/src/lib/errors/error-logger', () => ({
  errorLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('performHealthCheck', () => {
  const mockHealthReport = {
    timestamp: '2025-01-01T00:00:00Z',
    overview: {
      cacheHitRatio: 95.5,
    },
    connectionPool: {
      activeConnections: 10,
      maxConnections: 100,
      idleConnections: 5,
    },
    slowQueries: [
      { meanTimeMs: 50 },
      { meanTimeMs: 75 },
      { meanTimeMs: 100 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHealthReport.mockResolvedValue(mockHealthReport);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return HEALTHY status when all metrics are good', async () => {
    const check = await performHealthCheck();

    expect(check.status).toBe(DatabaseHealthStatus.HEALTHY);
    expect(check.message).toContain('good');
    expect(check.metrics.connectionPoolUsage).toBe(10); // (10/100) * 100
    expect(check.metrics.avgQueryTime).toBe(75); // (50+75+100)/3
    expect(check.metrics.cacheHitRatio).toBe(95.5);
    expect(check.metrics.activeConnections).toBe(10);
    expect(check.metrics.idleConnections).toBe(5);
  });

  it('should return DEGRADED status when metrics exceed degraded thresholds', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      connectionPool: {
        activeConnections: 75,
        maxConnections: 100,
        idleConnections: 5,
      },
    });

    const check = await performHealthCheck();

    expect(check.status).toBe(DatabaseHealthStatus.DEGRADED);
    expect(check.message).toContain('degraded');
    expect(check.recommendations.length).toBeGreaterThan(0);
    expect(check.recommendations.some(r => r.includes('Connection pool usage'))).toBe(true);
  });

  it('should return UNHEALTHY status when metrics exceed unhealthy thresholds', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      connectionPool: {
        activeConnections: 90,
        maxConnections: 100,
        idleConnections: 2,
      },
      slowQueries: [
        { meanTimeMs: 300 },
        { meanTimeMs: 350 },
      ],
    });

    const check = await performHealthCheck();

    expect(check.status).toBe(DatabaseHealthStatus.UNHEALTHY);
    expect(check.message).toContain('unhealthy');
    expect(check.recommendations).toContain('Investigate slow queries');
    expect(check.recommendations).toContain('Consider increasing connection pool size');
  });

  it('should return CRITICAL status when metrics exceed critical thresholds', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      connectionPool: {
        activeConnections: 98,
        maxConnections: 100,
        idleConnections: 0,
      },
      slowQueries: [
        { meanTimeMs: 600 },
        { meanTimeMs: 700 },
      ],
      overview: {
        cacheHitRatio: 65,
      },
    });

    const check = await performHealthCheck();

    expect(check.status).toBe(DatabaseHealthStatus.CRITICAL);
    expect(check.message).toContain('critical');
    expect(check.recommendations).toContain('Contact database administrator immediately');
    expect(check.recommendations).toContain('Consider scaling database resources');
  });

  it('should use custom thresholds when provided', async () => {
    const customThresholds: HealthThresholds = {
      degraded: {
        connectionPoolUsage: 50,
        avgQueryTime: 50,
        cacheHitRatio: 95,
      },
      unhealthy: {
        connectionPoolUsage: 70,
        avgQueryTime: 100,
        cacheHitRatio: 85,
      },
      critical: {
        connectionPoolUsage: 90,
        avgQueryTime: 200,
        cacheHitRatio: 75,
      },
    };

    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      connectionPool: {
        activeConnections: 55,
        maxConnections: 100,
        idleConnections: 10,
      },
    });

    const check = await performHealthCheck(customThresholds);

    expect(check.status).toBe(DatabaseHealthStatus.DEGRADED);
  });

  it('should generate specific recommendations for connection pool usage', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      connectionPool: {
        activeConnections: 75,
        maxConnections: 100,
        idleConnections: 5,
      },
    });

    const check = await performHealthCheck();

    const poolRecommendation = check.recommendations.find(r => 
      r.includes('Connection pool usage') && r.includes('75.0%')
    );
    expect(poolRecommendation).toBeDefined();
  });

  it('should generate specific recommendations for query time', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      slowQueries: [
        { meanTimeMs: 120 },
        { meanTimeMs: 150 },
      ],
    });

    const check = await performHealthCheck();

    const queryRecommendation = check.recommendations.find(r => 
      r.includes('Average query time') && r.includes('ms')
    );
    expect(queryRecommendation).toBeDefined();
  });

  it('should generate specific recommendations for cache hit ratio', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      overview: {
        cacheHitRatio: 85,
      },
    });

    const check = await performHealthCheck();

    const cacheRecommendation = check.recommendations.find(r => 
      r.includes('Cache hit ratio') && r.includes('85.0%')
    );
    expect(cacheRecommendation).toBeDefined();
  });

  it('should handle health service errors gracefully', async () => {
    mockGetHealthReport.mockRejectedValue(new Error('Service unavailable'));

    const check = await performHealthCheck();

    expect(check.status).toBe(DatabaseHealthStatus.UNHEALTHY);
    expect(check.message).toContain('Failed to perform health check');
    expect(check.recommendations).toContain('Health check service is unavailable');
    expect(check.metrics.connectionPoolUsage).toBe(0);
  });

  it('should handle empty slow queries array', async () => {
    mockGetHealthReport.mockResolvedValue({
      ...mockHealthReport,
      slowQueries: [],
    });

    const check = await performHealthCheck();

    expect(check.metrics.avgQueryTime).toBe(0);
    expect(check.status).toBe(DatabaseHealthStatus.HEALTHY);
  });

  it('should include timestamp in health check result', async () => {
    const check = await performHealthCheck();

    expect(check.lastChecked).toBeDefined();
    expect(new Date(check.lastChecked).getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('scheduleHealthChecks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetHealthReport.mockResolvedValue({
      overview: { cacheHitRatio: 95 },
      connectionPool: {
        activeConnections: 10,
        maxConnections: 100,
        idleConnections: 5,
      },
      slowQueries: [{ meanTimeMs: 50 }],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should perform initial health check immediately', async () => {
    const callback = jest.fn();
    scheduleHealthChecks(60000, callback);

    // Wait for async operations
    await jest.runAllTimersAsync();

    expect(mockGetHealthReport).toHaveBeenCalled();
  });

  it('should call callback when status changes', async () => {
    const callback = jest.fn();
    
    // Start with healthy status
    mockGetHealthReport.mockResolvedValue({
      overview: { cacheHitRatio: 95 },
      connectionPool: {
        activeConnections: 10,
        maxConnections: 100,
        idleConnections: 5,
      },
      slowQueries: [{ meanTimeMs: 50 }],
    });

    scheduleHealthChecks(60000, callback);
    await jest.runAllTimersAsync();

    // Change to degraded status
    mockGetHealthReport.mockResolvedValue({
      overview: { cacheHitRatio: 85 },
      connectionPool: {
        activeConnections: 75,
        maxConnections: 100,
        idleConnections: 5,
      },
      slowQueries: [{ meanTimeMs: 120 }],
    });

    jest.advanceTimersByTime(60000);
    await jest.runAllTimersAsync();

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        status: DatabaseHealthStatus.DEGRADED,
      })
    );
  });

  it('should not call callback when status remains the same', async () => {
    const callback = jest.fn();
    
    scheduleHealthChecks(60000, callback);
    await jest.runAllTimersAsync();

    // Clear previous calls
    callback.mockClear();

    // Keep same healthy status
    jest.advanceTimersByTime(60000);
    await jest.runAllTimersAsync();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should use custom interval', async () => {
    const callback = jest.fn();
    const customInterval = 30000; // 30 seconds

    scheduleHealthChecks(customInterval, callback);
    await jest.runAllTimersAsync();

    mockGetHealthReport.mockClear();

    jest.advanceTimersByTime(customInterval);
    await jest.runAllTimersAsync();

    expect(mockGetHealthReport).toHaveBeenCalled();
  });

  it('should return cleanup function that stops health checks', async () => {
    const callback = jest.fn();
    const stopHealthChecks = scheduleHealthChecks(60000, callback);

    await jest.runAllTimersAsync();
    mockGetHealthReport.mockClear();

    // Stop health checks
    stopHealthChecks();

    // Advance time and verify no more checks
    jest.advanceTimersByTime(120000);
    await jest.runAllTimersAsync();

    expect(mockGetHealthReport).not.toHaveBeenCalled();
  });

  it('should continue checking after errors', async () => {
    mockGetHealthReport
      .mockRejectedValueOnce(new Error('Service error'))
      .mockResolvedValue({
        overview: { cacheHitRatio: 95 },
        connectionPool: {
          activeConnections: 10,
          maxConnections: 100,
          idleConnections: 5,
        },
        slowQueries: [{ meanTimeMs: 50 }],
      });

    const callback = jest.fn();
    scheduleHealthChecks(60000, callback);

    await jest.runAllTimersAsync();

    // Advance to next check
    jest.advanceTimersByTime(60000);
    await jest.runAllTimersAsync();

    expect(mockGetHealthReport).toHaveBeenCalledTimes(2);
  });
});

