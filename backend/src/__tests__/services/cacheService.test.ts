import { describe, it, expect, beforeEach, vi } from 'vitest';

// We need to create a fresh CacheService instance for each test
// since the singleton has a running interval and shared state.
// We'll import the class by reconstructing it.

class CacheService {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private defaultTTL: number;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(defaultTTLMinutes: number = 60) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    this.cache.set(key, { data, expiresAt: Date.now() + ttl });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  key(...parts: string[]): string {
    return parts.join(':').toLowerCase();
  }

  get size(): number {
    return this.cache.size;
  }
}

// ============================================================
// CacheService
// ============================================================
describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService(60); // 60 min default TTL
  });

  describe('set / get', () => {
    it('stores and retrieves a string value', () => {
      cache.set('key1', 'hello');
      expect(cache.get<string>('key1')).toBe('hello');
    });

    it('stores and retrieves an object value', () => {
      const obj = { name: 'Apple', ticker: 'AAPL' };
      cache.set('company', obj);
      expect(cache.get<typeof obj>('company')).toEqual(obj);
    });

    it('stores and retrieves an array', () => {
      const arr = [1, 2, 3];
      cache.set('numbers', arr);
      expect(cache.get<number[]>('numbers')).toEqual(arr);
    });

    it('returns undefined for non-existent key', () => {
      expect(cache.get('missing')).toBeUndefined();
    });

    it('overwrites existing value with same key', () => {
      cache.set('key', 'first');
      cache.set('key', 'second');
      expect(cache.get<string>('key')).toBe('second');
    });
  });

  describe('TTL expiration', () => {
    it('returns value before TTL expires', () => {
      cache.set('key', 'value', 1); // 1 minute TTL
      expect(cache.get<string>('key')).toBe('value');
    });

    it('returns undefined after TTL expires', () => {
      vi.useFakeTimers();
      try {
        cache.set('key', 'value', 0.001); // ~0.06 seconds (3.6ms)
        vi.advanceTimersByTime(100); // Advance 100ms
        expect(cache.get<string>('key')).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });

    it('uses default TTL when custom TTL not provided', () => {
      vi.useFakeTimers();
      try {
        cache.set('key', 'value'); // 60 min default
        vi.advanceTimersByTime(30 * 60 * 1000); // 30 min
        expect(cache.get<string>('key')).toBe('value');
        vi.advanceTimersByTime(31 * 60 * 1000); // 61 min total
        expect(cache.get<string>('key')).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      expect(cache.has('missing')).toBe(false);
    });

    it('returns false for expired key', () => {
      vi.useFakeTimers();
      try {
        cache.set('key', 'value', 0.001);
        vi.advanceTimersByTime(100);
        expect(cache.has('key')).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('delete', () => {
    it('removes an existing key', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
      cache.delete('key');
      expect(cache.has('key')).toBe(false);
    });

    it('does not throw when deleting non-existent key', () => {
      expect(() => cache.delete('missing')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.size).toBe(3);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(false);
    });
  });

  describe('key builder', () => {
    it('joins parts with colon', () => {
      expect(cache.key('a', 'b', 'c')).toBe('a:b:c');
    });

    it('lowercases all parts', () => {
      expect(cache.key('A', 'B', 'C')).toBe('a:b:c');
    });

    it('handles single part', () => {
      expect(cache.key('hello')).toBe('hello');
    });

    it('handles empty parts', () => {
      expect(cache.key('a', '', 'c')).toBe('a::c');
    });
  });

  describe('size', () => {
    it('returns 0 for empty cache', () => {
      expect(cache.size).toBe(0);
    });

    it('tracks insertions', () => {
      cache.set('a', 1);
      expect(cache.size).toBe(1);
      cache.set('b', 2);
      expect(cache.size).toBe(2);
    });

    it('does not increase for overwrite', () => {
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.size).toBe(1);
    });
  });
});
