import { describe, expect, it, vi } from 'vitest';

const { generateContentStream } = vi.hoisted(() => ({ generateContentStream: vi.fn() }));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContentStream };
  },
}));
vi.mock('../lib/env.js', () => ({ env: { GEMINI_API_KEY: 'test-key' } }));

import { streamAnswer } from './llm.js';

describe('streamAnswer', () => {
  it('sends document context and conversation roles to Gemini and streams its text', async () => {
    generateContentStream.mockResolvedValue(
      (async function* () {
        yield { text: 'Hello' };
        yield { text: undefined };
        yield { text: ' world' };
      })(),
    );

    const chunks: string[] = [];
    for await (const chunk of streamAnswer('Document text', [
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'Next question' },
    ])) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Hello', ' world']);
    expect(generateContentStream).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash-lite',
      config: {
        maxOutputTokens: 4096,
        systemInstruction: expect.stringContaining('Document text'),
      },
      contents: [
        { role: 'user', parts: [{ text: 'First question' }] },
        { role: 'model', parts: [{ text: 'First answer' }] },
        { role: 'user', parts: [{ text: 'Next question' }] },
      ],
    });
  });
});
