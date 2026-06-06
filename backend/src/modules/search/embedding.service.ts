import { config } from '../../config/index.js';
import { AppError } from '../../shared/errors/AppError.js';

/** Matches advisor_embeddings.embedding vector(1536) in 003_advisor_embeddings.sql */
export const EMBEDDING_DIMENSIONS = 1536;

type GeminiTaskType =
  | 'RETRIEVAL_DOCUMENT'
  | 'RETRIEVAL_QUERY'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'
  | 'CLUSTERING';

interface GeminiEmbedResponse {
  embedding?: { values?: number[] };
}

export async function embedText(
  text: string,
  taskType: GeminiTaskType = 'RETRIEVAL_DOCUMENT',
): Promise<number[]> {
  if (!config.gemini.apiKey) {
    throw new AppError(503, 'INTERNAL_ERROR', 'GEMINI_API_KEY is not configured');
  }

  const model = config.gemini.embeddingModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${config.gemini.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new AppError(502, 'INTERNAL_ERROR', `Gemini embedContent failed: ${detail}`);
  }

  const data = (await response.json()) as GeminiEmbedResponse;
  const values = data.embedding?.values;
  if (!values?.length) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Gemini returned an empty embedding');
  }
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new AppError(
      500,
      'INTERNAL_ERROR',
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values.length}`,
    );
  }
  return values;
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedText(text, 'RETRIEVAL_QUERY');
}
