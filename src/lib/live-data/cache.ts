/**
 * Centralized Live Data Cache Layer
 * Provides high-speed TTL caching, namespace isolation, and Last-Known-Good fallback.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  lastValidatedAt: number;
  isStale: boolean;
}

class LiveCacheManager {
  private memoryStore: Map<string, CacheEntry<any>> = new Map();
  private lastKnownGoodStore: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Sets value in cache with TTL
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: now + ttlSeconds * 1000,
      lastValidatedAt: now,
      isStale: false,
    };
    this.memoryStore.set(key, entry);

    // Save as last-known-good backup if valid data
    if (data !== null && data !== undefined) {
      this.lastKnownGoodStore.set(key, { data, timestamp: now });
    }
  }

  /**
   * Gets value from cache. If expired, marks as isStale.
   */
  get<T>(key: string): { data: T | null; isFresh: boolean; isStale: boolean; ageSeconds: number } {
    const entry = this.memoryStore.get(key);
    const now = Date.now();

    if (!entry) {
      // Check last-known-good fallback
      const fallback = this.lastKnownGoodStore.get(key);
      if (fallback) {
        return {
          data: fallback.data,
          isFresh: false,
          isStale: true,
          ageSeconds: Math.round((now - fallback.timestamp) / 1000),
        };
      }
      return { data: null, isFresh: false, isStale: true, ageSeconds: 0 };
    }

    const isFresh = now < entry.expiresAt;
    const ageSeconds = Math.round((now - entry.cachedAt) / 1000);

    return {
      data: entry.data,
      isFresh,
      isStale: !isFresh,
      ageSeconds,
    };
  }

  /**
   * Retrieves last verified good snapshot when provider request fails
   */
  getLastKnownGood<T>(key: string): T | null {
    const item = this.lastKnownGoodStore.get(key);
    return item ? (item.data as T) : null;
  }

  /**
   * Invalidate specific key or entire namespace
   */
  invalidate(pattern: string): void {
    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(pattern) || key === pattern) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Get cache diagnostics for admin health center
   */
  getStats() {
    return {
      totalKeys: this.memoryStore.size,
      backupSnapshots: this.lastKnownGoodStore.size,
      namespaces: ['live:cricket', 'live:bullion', 'live:market'],
    };
  }
}

// Global Singleton
const globalForCache = global as unknown as { liveCacheManager?: LiveCacheManager };
export const liveCache = globalForCache.liveCacheManager || new LiveCacheManager();
if (process.env.NODE_ENV !== 'production') globalForCache.liveCacheManager = liveCache;
