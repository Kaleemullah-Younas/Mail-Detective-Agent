import 'server-only';
import OpenAI from 'openai';

function loadKeys(): string[] {
  const raw = process.env.GEMINI_API_KEY ?? '';
  const keys = raw
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  if (keys.length === 0) {
    throw new Error(
      'API Key is not set. Add at least one key to GEMINI_API_KEY in .env',
    );
  }
  return keys;
}

let cursor = 0;

function nextKey(): string {
  const keys = loadKeys();
  const k = keys[cursor % keys.length];
  cursor = (cursor + 1) % keys.length;
  return k;
}

export function getGLMClient(): OpenAI {
  return new OpenAI({
    apiKey: nextKey(),
    baseURL: 'https://api.z.ai/api/coding/paas/v4',
  });
}

export async function withGLM<T>(
  fn: (client: OpenAI) => Promise<T>,
): Promise<T> {
  const keys = loadKeys();
  let lastErr: unknown;

  for (let i = 0; i < keys.length; i++) {
    const client = getGLMClient();
    try {
      return await fn(client);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      const retriable =
        msg.includes('429') ||
        msg.includes('quota') ||
        msg.includes('rate') ||
        msg.includes('503') ||
        msg.includes('overloaded') ||
        msg.includes('unavailable');
      if (!retriable) throw err;
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error('All API keys exhausted');
}

export const GLM_MODEL = 'GLM-5.1';

export const withGemini = withGLM;
export const getGeminiClient = getGLMClient;
export const GEMINI_MODEL = GLM_MODEL;
export const GEMINI_VISION_MODEL = GLM_MODEL;
