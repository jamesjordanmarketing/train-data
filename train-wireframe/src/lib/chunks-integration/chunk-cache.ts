/**
 * ChunkCache - LRU Cache Implementation with TTL Support
 * 
 * Provides caching for chunk data with:
 * - LRU (Least Recently Used) eviction policy
 * - TTL (Time To Live) expiration
 * - Prefix-based invalidation
 * - Cache metrics tracking
 * 
 * Usage:
 *   const cache = new ChunkCache(100, 5 * 60 * 1000); // 100 entries, 5 min TTL
 *   cache.set('chunk:123', chunkData);
 *   const data = cache.get<ChunkData>('chunk:123');
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  accessedAt: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

export class ChunkCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTTL: number; // TTL in milliseconds
  private hits: number;
  private misses: number;

  /**
   * Create a new ChunkCache
   * 
   * @param maxSize - Maximum number of entries (default: 100)
   * @param defaultTTL - Default TTL in milliseconds (default: 5 minutes)
   */
  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate a cache key from prefix and identifier
   * 
   * @param prefix - Key prefix (e.g., 'chunk', 'dimensions')
   * @param id - Unique identifier
   * @returns Formatted cache key
   */
  generateKey(prefix: string, id: string): string {
    return `${prefix}:${id}`;
  }

  /**
   * Get data from cache
   * 
   * Returns null if:
   * - Key doesn't exist
   * - Entry has expired (also removes expired entry)
   * 
   * @param key - Cache key
   * @returns Cached data or null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access time for LRU
    entry.accessedAt = now;
    this.hits++;
    
    return entry.data as T;
  }

  /**
   * Set data in cache
   * 
   * If cache is at max size, evicts the least recently used entry
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Optional TTL override (milliseconds)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl ?? this.defaultTTL);

    // Check if we need to evict an entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      expiresAt,
      accessedAt: now
    });
  }

  /**
   * Invalidate (remove) a specific cache entry
   * 
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries with a specific prefix
   * 
   * Useful for bulk invalidation (e.g., all chunks for a document)
   * 
   * @param prefix - Key prefix to match
   */
  invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache entries and reset metrics
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache performance metrics
   * 
   * @returns Cache metrics including hit rate and size
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Evict the least recently used entry
   * 
   * Removes the entry with the oldest accessedAt timestamp
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   * 
   * Removes all entries that have passed their TTL
   * Useful for periodic maintenance
   * 
   * @returns Number of entries removed
   */
  cleanExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get cache size
   * 
   * @returns Current number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists in cache (and is not expired)
   * 
   * @param key - Cache key
   * @returns True if key exists and not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export singleton instance with default configuration
export const chunkCache = new ChunkCache(100, 5 * 60 * 1000); // 100 entries, 5 min TTL

