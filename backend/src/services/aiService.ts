// ============================================================
// Investryt AI — Gemini AI Service
// ============================================================
// Instantiates Gemini models using rotated API keys from key pool.
// On rate-limit errors, automatically rotates to the next key and retries.

import { ChatGoogle } from '@langchain/google';
import type { BaseMessage, AIMessage } from '@langchain/core/messages';
import { getGeminiPool } from './keyPool.js';

interface ModelOptions {
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
}

/**
 * Returns a new ChatGoogle instance with a rotated Gemini API key.
 */
export function getGeminiModel(options: ModelOptions = {}): ChatGoogle {
  const pool = getGeminiPool();
  const apiKey = pool.getKey();
  
  const temperature = options.temperature ?? 0.2;
  const mimeType = options.responseMimeType;

  try {
    return new ChatGoogle({
      apiKey,
      model: 'gemini-2.5-flash', // Use gemini-2.5-flash as the stable production model in 2026
      temperature,
      // If the model supports responseMimeType in extra fields:
      ...(mimeType ? { additionalKwargs: { responseMimeType: mimeType } } : {}),
    });
  } catch (err) {
    console.error('[AiService] Error initializing ChatGoogle with key:', apiKey.slice(-4), err);
    throw err;
  }
}

// ---- Helpers ----

function isRateLimitError(err: any, errorMsg: string): boolean {
  // Check HTTP status code if available
  if (err?.status === 429 || err?.response?.status === 429) return true;
  // Check nested error objects
  if (err?.error?.message && String(err.error.message).toLowerCase().includes('quota')) return true;

  const lower = errorMsg.toLowerCase();
  return (
    lower.includes('quota exceeded') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('please retry')
  );
}

function extractRetryDelay(errorMsg: string): number {
  const match = errorMsg.match(/retry in ([\d.]+)s/);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 1000; // parse seconds → ms, add 1s buffer
  }
  return 60_000; // default 1 minute cooldown
}

/**
 * Invoke Gemini with built-in API key rotation on rate-limit errors.
 * Cycles through ALL available keys until one succeeds or all are in cooldown.
 */
export async function invokeGemini(
  messages: BaseMessage[],
  options: ModelOptions = {}
): Promise<AIMessage> {
  const pool = getGeminiPool();
  let lastError: any;

  // Try up to pool.size times — with 20+ keys we need to cycle through them all
  const maxAttempts = Math.max(2, pool.size);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // If all keys are in cooldown, no point retrying further
    if (attempt > 0 && pool.availableCount === 0) {
      console.warn(
        `[AiService] All ${pool.size} Gemini keys in cooldown — cannot retry.`
      );
      break;
    }

    const apiKey = pool.getKey();

    try {
      const model = new ChatGoogle({
        apiKey,
        model: 'gemini-2.5-flash',
        temperature: options.temperature ?? 0.2,
        ...(options.responseMimeType
          ? { additionalKwargs: { responseMimeType: options.responseMimeType } }
          : {}),
      });

      const response = await model.invoke(messages);
      return response;
    } catch (err: any) {
      lastError = err;
      const errorMsg = String(err.message || err);

      if (isRateLimitError(err, errorMsg)) {
        const cooldownMs = extractRetryDelay(errorMsg);
        pool.markRateLimited(apiKey, cooldownMs);
        console.warn(
          `[AiService] Gemini key ***${apiKey.slice(-4)} rate-limited, rotating (cooldown: ${cooldownMs}ms, available: ${pool.availableCount}/${pool.size})`
        );
        continue; // Retry with next key
      }

      // Non-rate-limit error — throw immediately
      throw err;
    }
  }

  // All keys exhausted or a non-rate-limit error occurred
  throw lastError;
}
