export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHUNK_DELAY_MS = 25;

// Streams a canned, deterministic answer word-by-word (like the real
// token-by-token SSE stream) so the chat UI's streaming rendering is
// exercised end-to-end without an Anthropic API key.
export async function* streamAnswer(
  documentContext: string,
  history: ChatMessage[],
): AsyncIterable<string> {
  const question = history.at(-1)?.content ?? '';
  const hasContext = documentContext.trim().length > 0;

  const answer = hasContext
    ? `This is a mocked answer to "${question}". MOCK_EXTERNAL_SERVICES is enabled, so no real ` +
      `call was made to Claude — the response is generated locally from the retrieved document ` +
      `context (${documentContext.length} characters) so the streaming UI can be exercised end ` +
      `to end without an Anthropic API key.`
    : `This is a mocked answer to "${question}". No relevant document context was retrieved.`;

  for (const word of answer.split(' ')) {
    await delay(CHUNK_DELAY_MS);
    yield `${word} `;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
