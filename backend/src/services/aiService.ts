// ============================================================
// Investryt AI — Gemini AI Service
// ============================================================
// Instantiates Gemini models using rotated API keys from key pool.

import { ChatGoogle } from '@langchain/google';
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
