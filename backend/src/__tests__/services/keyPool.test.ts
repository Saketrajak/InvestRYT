import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApiKeyPool } from '../../services/keyPool.js';

// ============================================================
// ApiKeyPool
// ============================================================
describe('ApiKeyPool', () => {
  describe('constructor', () => {
    it('initializes with provided keys', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2', 'key3']);
      expect(pool.size).toBe(3);
      expect(pool.availableCount).toBe(3);
    });

    it('trims whitespace from keys', () => {
      const pool = new ApiKeyPool('test', ['  key1  ', '  key2  ']);
      expect(pool.size).toBe(2);
      // Keys should be trimmed
      const key1 = pool.getKey();
      expect(key1).toBe('key1');
    });

    it('handles empty array', () => {
      const pool = new ApiKeyPool('test', []);
      expect(pool.size).toBe(0);
    });
  });

  describe('getKey', () => {
    it('returns a key from the pool', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2']);
      const key = pool.getKey();
      expect(['key1', 'key2']).toContain(key);
    });

    it('throws when pool is empty', () => {
      const pool = new ApiKeyPool('test', []);
      expect(() => pool.getKey()).toThrow('No API keys configured');
    });

    it('rotates through keys round-robin', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2', 'key3']);
      const key1 = pool.getKey();
      const key2 = pool.getKey();
      const key3 = pool.getKey();
      const key4 = pool.getKey(); // Should wrap around

      expect(key1).toBe('key1');
      expect(key2).toBe('key2');
      expect(key3).toBe('key3');
      expect(key4).toBe('key1'); // Wrapped
    });

    it('skips rate-limited keys', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2', 'key3']);
      pool.markRateLimited('key1', 60_000); // 1 min cooldown

      const key = pool.getKey();
      expect(key).toBe('key2'); // Should skip key1
    });

    it('returns least-restricted key when all are rate-limited', () => {
      vi.useFakeTimers();
      try {
        const pool = new ApiKeyPool('test', ['key1', 'key2', 'key3']);

        // Rate-limit all keys with different cooldowns
        pool.markRateLimited('key1', 60_000); // 1 min
        pool.markRateLimited('key2', 120_000); // 2 min
        pool.markRateLimited('key3', 30_000); // 30 sec

        const key = pool.getKey();
        expect(key).toBe('key3'); // Shortest cooldown = least restricted
      } finally {
        vi.useRealTimers();
      }
    });

    it('recovers keys after cooldown expires', () => {
      vi.useFakeTimers();
      try {
        const pool = new ApiKeyPool('test', ['key1', 'key2']);
        pool.markRateLimited('key1', 5_000); // 5 sec cooldown

        // Immediately: key1 is rate-limited
        expect(pool.getKey()).toBe('key2');

        // Advance past cooldown
        vi.advanceTimersByTime(6_000);

        // key1 should be available again
        expect(pool.getKey()).toBe('key1');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('markRateLimited', () => {
    it('marks a key as rate-limited', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2']);
      pool.markRateLimited('key1', 60_000);
      expect(pool.availableCount).toBe(1);
    });

    it('uses default cooldown of 60 seconds', () => {
      vi.useFakeTimers();
      try {
        const pool = new ApiKeyPool('test', ['key1']);
        pool.markRateLimited('key1'); // Default 60s

        vi.advanceTimersByTime(59_000);
        expect(pool.availableCount).toBe(0);

        vi.advanceTimersByTime(2_000); // 61s total
        expect(pool.availableCount).toBe(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('does nothing for non-existent key', () => {
      const pool = new ApiKeyPool('test', ['key1']);
      pool.markRateLimited('nonexistent', 60_000);
      expect(pool.availableCount).toBe(1);
    });
  });

  describe('size', () => {
    it('returns total key count', () => {
      const pool = new ApiKeyPool('test', ['a', 'b', 'c', 'd']);
      expect(pool.size).toBe(4);
    });
  });

  describe('availableCount', () => {
    it('returns count of non-rate-limited keys', () => {
      const pool = new ApiKeyPool('test', ['key1', 'key2', 'key3']);
      expect(pool.availableCount).toBe(3);

      pool.markRateLimited('key1', 60_000);
      expect(pool.availableCount).toBe(2);

      pool.markRateLimited('key2', 60_000);
      expect(pool.availableCount).toBe(1);
    });
  });
});
