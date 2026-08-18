import { describe, expect, it } from 'vitest';
import { chunkText } from './chunking.js';

describe('chunkText', () => {
  it('returns no chunks for empty text', () => {
    expect(chunkText('')).toEqual([]);
  });

  it('returns no chunks for whitespace-only text', () => {
    expect(chunkText('   \n\t  ')).toEqual([]);
  });

  it('returns a single chunk for text shorter than the chunk size', () => {
    const text = 'a'.repeat(500);
    const chunks = chunkText(text);

    expect(chunks).toEqual([{ content: text, chunkIndex: 0 }]);
  });

  it('trims surrounding whitespace before chunking', () => {
    const chunks = chunkText('  hello world  ');

    expect(chunks).toEqual([{ content: 'hello world', chunkIndex: 0 }]);
  });

  it('splits long text into multiple sequentially indexed chunks', () => {
    const text = 'x'.repeat(5000);
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, index) => expect(chunk.chunkIndex).toBe(index));
  });

  it('preserves the start and end of long text somewhere in the chunk sequence', () => {
    const text = 'x'.repeat(3000) + 'UNIQUE_MARKER_END';
    const chunks = chunkText(text);
    const allContent = chunks.map((chunk) => chunk.content).join('');

    expect(allContent).toContain('UNIQUE_MARKER_END');
    expect(chunks[0]?.content.startsWith('x')).toBe(true);
  });

  it('overlaps consecutive chunks so no content is skipped entirely', () => {
    // A marker placed exactly at a chunk boundary must appear in at least
    // one chunk in full, not be cut in half and lost.
    const text = 'a'.repeat(1900) + 'BOUNDARY_MARKER' + 'b'.repeat(1900);
    const chunks = chunkText(text);

    expect(chunks.some((chunk) => chunk.content.includes('BOUNDARY_MARKER'))).toBe(true);
  });
});
