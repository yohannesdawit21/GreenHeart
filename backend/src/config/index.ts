import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  postgres: {
    url: process.env.DATABASE_URL ?? 'postgresql://codex:codex@localhost:5432/codex',
  },

  jwt: {
    secret: required('JWT_SECRET', 'dev-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  livekit: {
    url: process.env.LIVEKIT_URL ?? 'ws://localhost:7880',
    apiKey: process.env.LIVEKIT_API_KEY ?? '',
    apiSecret: process.env.LIVEKIT_API_SECRET ?? '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
  },

  embeddings: {
    /** `openai` | `gemini` — defaults to gemini when GEMINI_API_KEY is set */
    provider: (process.env.EMBEDDING_PROVIDER ??
      (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')) as 'openai' | 'gemini',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS ?? '1536', 10),
    gemini: {
      apiKey: process.env.GEMINI_API_KEY ?? '',
      model: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
    },
    openai: {
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    },
    maxDistance: parseFloat(process.env.SEMANTIC_MAX_DISTANCE ?? '0.40'),
  },

  payment: {
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? '',
  },
} as const;

export const coinPackages = {
  starter: { coins: 20, priceUsd: 19.99 },
  growth: { coins: 50, priceUsd: 44.99 },
  pro: { coins: 120, priceUsd: 99.99 },
} as const;
