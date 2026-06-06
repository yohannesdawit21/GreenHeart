import { config } from '../../config/index.js';
import { AppError } from '../../shared/errors/AppError.js';

/** Matches advisor_embeddings.embedding vector(1536) in 003_advisor_embeddings.sql */
export const EMBEDDING_DIMENSIONS = config.embeddings.dimensions;

type GeminiTaskType =
  | 'RETRIEVAL_DOCUMENT'
  | 'RETRIEVAL_QUERY'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'
  | 'CLUSTERING';

function assertEmbeddingDimensions(values: number[]): void {
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new AppError(
      500,
      'EMBEDDING_DIMENSION_MISMATCH',
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values.length}`,
    );
  }
}

async function embedWithOpenAI(text: string): Promise<number[]> {
  const apiKey = config.openai.apiKey;
  if (!apiKey) {
    throw new AppError(503, 'EMBEDDING_UNAVAILABLE', 'OPENAI_API_KEY is not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.embeddings.openai.model,
      input: text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AppError(502, 'EMBEDDING_FAILED', `OpenAI embedding failed: ${detail}`);
  }

  const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  const values = payload.data?.[0]?.embedding;
  if (!values) {
    throw new AppError(502, 'EMBEDDING_FAILED', 'OpenAI returned no embedding');
  }

  assertEmbeddingDimensions(values);
  return values;
}

async function embedWithGemini(text: string, taskType: GeminiTaskType): Promise<number[]> {
  const apiKey = config.gemini.apiKey || config.embeddings.gemini.apiKey;
  if (!apiKey) {
    throw new AppError(503, 'EMBEDDING_UNAVAILABLE', 'GEMINI_API_KEY is not configured');
  }

  const model = config.gemini.embeddingModel || config.embeddings.gemini.model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AppError(502, 'EMBEDDING_FAILED', `Gemini embedding failed: ${detail}`);
  }

  const payload = (await response.json()) as { embedding?: { values?: number[] } };
  const values = payload.embedding?.values;
  if (!values) {
    throw new AppError(502, 'EMBEDDING_FAILED', 'Gemini returned no embedding');
  }

  assertEmbeddingDimensions(values);
  return values;
}

export function buildAdvisorEmbeddingText(bio: string, tags: string[]): string {
  const trimmedBio = bio.trim();
  const tagLine = tags.length > 0 ? `Tags: ${tags.join(', ')}` : '';
  return [trimmedBio, tagLine].filter(Boolean).join('\n');
}

async function embedNormalized(text: string, taskType: GeminiTaskType): Promise<number[]> {
  const normalized = text.trim();
  if (!normalized) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Text to embed cannot be empty');
  }

  if (config.embeddings.provider === 'gemini') {
    return embedWithGemini(normalized, taskType);
  }
  return embedWithOpenAI(normalized);
}

/** Index advisor bios (document embedding). */
export async function embedText(text: string): Promise<number[]> {
  return embedNormalized(text, 'RETRIEVAL_DOCUMENT');
}

/** Semantic search queries (query embedding). */
export async function embedQuery(text: string): Promise<number[]> {
  return embedNormalized(text, 'RETRIEVAL_QUERY');
}

/** pgvector literal: `[0.1,0.2,...]` */
export function toVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}
