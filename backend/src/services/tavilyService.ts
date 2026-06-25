// ============================================================
// Investryt AI — Tavily Search Service
// ============================================================
// Performs web search using Tavily API with key rotation.

import { tavily } from '@tavily/core';
import { getTavilyPool } from './keyPool.js';
import { cache } from './cacheService.js';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export async function searchWeb(query: string, searchDepth: 'basic' | 'advanced' = 'basic'): Promise<SearchResult[]> {
  const cacheKey = cache.key('tavily', 'search', `${query}:${searchDepth}`);
  const cached = cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const pool = getTavilyPool();
  let key = pool.getKey();

  const makeSearch = async (apiKey: string): Promise<SearchResult[]> => {
    const tvly = tavily({ apiKey });
    const response = await tvly.search(query, {
      searchDepth,
      maxResults: 5,
    });
    return (response.results || []).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      content: r.content || '',
      score: r.score,
    }));
  };

  try {
    try {
      const results = await makeSearch(key);
      cache.set(cacheKey, results, 120); // Cache for 2 hours
      return results;
    } catch (err: any) {
      // Check if it's a rate limit or key issue (typically 429 or auth error status)
      const errorMsg = String(err.message || err);
      const isRateLimit = errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit');
      
      if (isRateLimit) {
        pool.markRateLimited(key, 60_000); // 1 minute cooldown
        // Retry with next key
        const retryKey = pool.getKey();
        console.log(`[Tavily] Retrying search with rotated API key...`);
        const results = await makeSearch(retryKey);
        cache.set(cacheKey, results, 120);
        return results;
      }
      
      throw err;
    }
  } catch (err) {
    console.error(`[Tavily] Search error for "${query}":`, err);
    return [];
  }
}
