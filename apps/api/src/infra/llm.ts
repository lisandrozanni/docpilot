import { GoogleGenAI } from '@google/genai';
import { env } from '../lib/env.js';

const MODEL = 'gemini-3.5-flash-lite';
const MAX_OUTPUT_TOKENS = 4096;

const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function* streamAnswer(
  documentContext: string,
  history: ChatMessage[],
): AsyncIterable<string> {
  const stream = await gemini.models.generateContentStream({
    model: MODEL,
    config: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      systemInstruction: buildSystemPrompt(documentContext),
    },
    contents: history.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
  });
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

function buildSystemPrompt(documentContext: string): string {
  return [
    'You are DocPilot, an assistant that answers questions about a single document.',
    'Answer only using the document content provided below. If the answer is not',
    'in the document, say so plainly instead of guessing.',
    '',
    '--- DOCUMENT CONTENT ---',
    documentContext,
    '--- END DOCUMENT CONTENT ---',
  ].join('\n');
}
