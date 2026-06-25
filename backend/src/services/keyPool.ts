// ============================================================
// Investryt AI — API Key Pool with Auto-Rotation
// ============================================================
// Rotates through multiple API keys to avoid rate limits.
// If a key gets a 429, it's marked cooldown and the next key is used.

interface KeyState {
  key: string;
  cooldownUntil: number; // timestamp
}

export class ApiKeyPool {
  private keys: KeyState[];
  private currentIndex: number = 0;
  private name: string;

  constructor(name: string, keys: string[]) {
    this.name = name;
    this.keys = keys.map(key => ({ key: key.trim(), cooldownUntil: 0 }));
    if (this.keys.length === 0) {
      console.warn(`[ApiKeyPool:${name}] No keys provided!`);
    }
  }

  /**
   * Get the next available key (round-robin with cooldown skip)
   */
  getKey(): string {
    if (this.keys.length === 0) {
      throw new Error(`[ApiKeyPool:${this.name}] No API keys configured`);
    }

    const now = Date.now();
    const startIndex = this.currentIndex;

    // Try each key in round-robin order
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (startIndex + i) % this.keys.length;
      const keyState = this.keys[idx];

      if (keyState.cooldownUntil <= now) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return keyState.key;
      }
    }

    // All keys in cooldown — return the one with shortest remaining cooldown
    const sortedByExpiry = [...this.keys].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
    console.warn(`[ApiKeyPool:${this.name}] All keys in cooldown. Using least-restricted key.`);
    return sortedByExpiry[0].key;
  }

  /**
   * Mark a key as rate-limited (cooldown for specified duration)
   */
  markRateLimited(key: string, cooldownMs: number = 60_000): void {
    const keyState = this.keys.find(k => k.key === key);
    if (keyState) {
      keyState.cooldownUntil = Date.now() + cooldownMs;
      console.warn(`[ApiKeyPool:${this.name}] Key ***${key.slice(-4)} rate-limited for ${cooldownMs / 1000}s`);
    }
  }

  /**
   * Get total number of keys
   */
  get size(): number {
    return this.keys.length;
  }

  /**
   * Get number of available (non-cooldown) keys
   */
  get availableCount(): number {
    const now = Date.now();
    return this.keys.filter(k => k.cooldownUntil <= now).length;
  }
}

// ---- Singleton pools initialized from env ----

function parseKeys(envVar: string | undefined): string[] {
  if (!envVar) return [];
  let val = envVar.trim();
  if (val.startsWith('[')) val = val.slice(1);
  if (val.endsWith(']')) val = val.slice(0, -1);
  return val.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

let geminiPool: ApiKeyPool | null = null;
let tavilyPool: ApiKeyPool | null = null;
let fmpPool: ApiKeyPool | null = null;

export function initKeyPools(): void {
  geminiPool = new ApiKeyPool('Gemini', parseKeys(process.env.GEMINI_API_KEYS));
  tavilyPool = new ApiKeyPool('Tavily', parseKeys(process.env.TAVILY_API_KEYS));
  fmpPool = new ApiKeyPool('FMP', parseKeys(process.env.FMP_API_KEYS));

  console.log(`[KeyPools] Gemini: ${geminiPool.size} keys | Tavily: ${tavilyPool.size} keys | FMP: ${fmpPool.size} keys`);
}

export function getGeminiPool(): ApiKeyPool {
  if (!geminiPool) throw new Error('Key pools not initialized. Call initKeyPools() first.');
  return geminiPool;
}

export function getTavilyPool(): ApiKeyPool {
  if (!tavilyPool) throw new Error('Key pools not initialized. Call initKeyPools() first.');
  return tavilyPool;
}

export function getFmpPool(): ApiKeyPool {
  if (!fmpPool) throw new Error('Key pools not initialized. Call initKeyPools() first.');
  return fmpPool;
}
