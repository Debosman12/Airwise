/**
 * 5-10 minute Cache Manager with localStorage persistence and stale detection
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheResult<T> {
  data: T;
  isStale: boolean;
  ageMs: number;
  ageMinutes: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes default
const STORAGE_PREFIX = 'airwise_cache_';

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<unknown>>();

  /**
   * Retrieves an item from cache.
   * Returns data with isStale flag, or null if no entry exists.
   */
  get<T>(key: string, maxStaleMs: number = 24 * 60 * 60 * 1000): CacheResult<T> | null {
    const now = Date.now();
    let entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    // Check localStorage if not in memory
    if (!entry) {
      try {
        const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (item) {
          entry = JSON.parse(item) as CacheEntry<T>;
          // Populate memory cache
          this.memoryCache.set(key, entry);
        }
      } catch {
        // localStorage not accessible or corrupted, ignore
      }
    }

    if (!entry) {
      return null;
    }

    const ageMs = now - entry.timestamp;
    const isStale = ageMs > entry.ttl;

    // If it exceeds allowable stale window (e.g. 24h), drop it
    if (ageMs > maxStaleMs) {
      this.delete(key);
      return null;
    }

    return {
      data: entry.data,
      isStale,
      ageMs,
      ageMinutes: Math.round(ageMs / 60000)
    };
  }

  /**
   * Stores an item into cache with specified TTL.
   */
  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in localStorage for cross-session offline recovery
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota exceeded or private mode, in-memory continues to work
    }
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      // Ignore
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}

export const cacheManager = new CacheManager();
