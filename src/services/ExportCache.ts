import { CacheEntry } from '../types/export';

export class ExportCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  constructor(ttlMs = 3600000, maxSize = 100) { // 1 hour TTL, 100 entries max
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = new Date();
    return entry;
  }

  set(key: string, buffer: Buffer, metadata: any): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    this.cache.set(key, {
      buffer,
      metadata,
      createdAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date()
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt.getTime() > this.ttlMs;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed.getTime() < oldestTime) {
        oldestTime = entry.lastAccessed.getTime();
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        size: entry.buffer.length
      }))
    };
  }

  clear(): void {
    this.cache.clear();
  }
}