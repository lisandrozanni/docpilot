import { useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatOptions {
  documentId: string;
  initialMessages: ChatMessage[];
  initialConversationId: string | undefined;
}

export function useChat({ documentId, initialMessages, initialConversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string) => {
    setError(null);
    setIsStreaming(true);

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question };
    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch(`/api/documents/${documentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, question }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId) {
        setConversationId(newConversationId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const delta = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + delta }
              : message,
          ),
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong');
      // Remove the empty assistant placeholder so the UI doesn't show a
      // permanently blank bubble alongside the error message.
      setMessages((prev) => prev.filter((message) => message.id !== assistantMessageId));
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, isStreaming, error, ask };
}
