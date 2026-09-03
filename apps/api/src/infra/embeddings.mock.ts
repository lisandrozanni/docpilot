import { createHash } from 'node:crypto';
import { EMBEDDING_DIMENSIONS } from './db/schema.js';

// Deterministic fake vectors, used when MOCK_EXTERNAL_SERVICES=true. Hashing
// the input text into a seed (rather than Math.random()) means the same text
// always embeds to the same vector within a run, so similarity search still
// returns consistent, repeatable results for the mocked chunks/queries.
export function embedDocumentChunks(texts: string[]): Promise<number[][]> {
  return Promise.resolve(texts.map(fakeEmbedding));
}

export function embedQuery(text: string): Promise<number[]> {
  return Promise.resolve(fakeEmbedding(text));
}

function fakeEmbedding(text: string): number[] {
  const seed = createHash('sha256').update(text).digest();
  const vector: number[] = [];

  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    const byte = seed[i % seed.length]!;
    vector.push((byte / 255) * 2 - 1);
  }

  return vector;
}
