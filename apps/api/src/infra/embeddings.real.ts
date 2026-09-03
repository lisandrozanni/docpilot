import { VoyageAIClient } from 'voyageai';
import { env } from '../lib/env.js';
import { EMBEDDING_DIMENSIONS } from './db/schema.js';

const MODEL = 'voyage-3.5';

// Guaranteed set by env.ts's superRefine whenever MOCK_EXTERNAL_SERVICES is
// false, which is the only condition under which this module is loaded.
const voyage = new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY! });

// Voyage embeddings are asymmetric: text stored for retrieval is embedded with
// inputType "document", the text used to search is embedded with inputType
// "query" — the model produces different (better-matched) vectors for each
// role even though both end up in the same vector space.
export async function embedDocumentChunks(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await voyage.embed({
    input: texts,
    model: MODEL,
    inputType: 'document',
    outputDimension: EMBEDDING_DIMENSIONS,
  });

  const data = response.data ?? [];

  if (data.length !== texts.length) {
    throw new Error(`Voyage returned ${data.length} embeddings for ${texts.length} inputs`);
  }

  return data
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((item) => {
      if (!item.embedding) {
        throw new Error('Voyage response is missing an embedding vector');
      }
      return item.embedding;
    });
}

export async function embedQuery(text: string): Promise<number[]> {
  const response = await voyage.embed({
    input: text,
    model: MODEL,
    inputType: 'query',
    outputDimension: EMBEDDING_DIMENSIONS,
  });

  const embedding = response.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error('Voyage response is missing an embedding vector');
  }

  return embedding;
}
