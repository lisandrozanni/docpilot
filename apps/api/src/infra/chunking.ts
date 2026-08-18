const CHUNK_SIZE_CHARS = 2000;
const CHUNK_OVERLAP_CHARS = 250; // ~12.5% of CHUNK_SIZE_CHARS

export interface Chunk {
  content: string;
  chunkIndex: number;
}

// A char-based sliding window, not token-based: simpler to reason about and
// test, and "roughly N tokens" doesn't need to be exact for chunk boundaries —
// only the LLM call in Etapa 8 needs real token accounting. Overlap exists so
// an idea split across a chunk boundary still appears whole in at least one
// chunk, at the cost of ~12.5% redundant storage/embedding cost later.
export function chunkText(text: string): Chunk[] {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return [];
  }

  if (trimmed.length <= CHUNK_SIZE_CHARS) {
    return [{ content: trimmed, chunkIndex: 0 }];
  }

  const chunks: Chunk[] = [];
  const step = CHUNK_SIZE_CHARS - CHUNK_OVERLAP_CHARS;
  let start = 0;
  let chunkIndex = 0;

  while (start < trimmed.length) {
    const end = Math.min(start + CHUNK_SIZE_CHARS, trimmed.length);
    chunks.push({ content: trimmed.slice(start, end), chunkIndex });
    chunkIndex += 1;

    if (end === trimmed.length) {
      break;
    }

    start += step;
  }

  return chunks;
}
