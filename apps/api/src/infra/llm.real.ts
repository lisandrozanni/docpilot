import Anthropic from '@anthropic-ai/sdk';
import { env } from '../lib/env.js';

const MODEL = 'claude-opus-5';
const MAX_OUTPUT_TOKENS = 4096;

// Guaranteed set by env.ts's superRefine whenever MOCK_EXTERNAL_SERVICES is
// false, which is the only condition under which this module is loaded.
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY! });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// System prompt goes first and is marked cacheable: it's the stable prefix
// (instructions + full document context) that doesn't change between turns of
// the same conversation. History and the new question are volatile and go
// after — anything after the cached prefix can change without invalidating it,
// but changing the prefix itself invalidates everything that follows it.
export function streamAnswer(
  documentContext: string,
  history: ChatMessage[],
): AsyncIterable<string> {
  const systemPrompt = buildSystemPrompt(documentContext);

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages: history.map((message) => ({ role: message.role, content: message.content })),
  });

  return textDeltas(stream);
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

async function* textDeltas(stream: ReturnType<typeof anthropic.messages.stream>) {
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}
