'use client';

import { useChat, type ChatMessage } from '../hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';

interface DocumentChatProps {
  documentId: string;
  initialMessages: ChatMessage[];
  initialConversationId: string | undefined;
}

export function DocumentChat({
  documentId,
  initialMessages,
  initialConversationId,
}: DocumentChatProps) {
  const { messages, isStreaming, error, ask } = useChat({
    documentId,
    initialMessages,
    initialConversationId,
  });

  return (
    <div className="flex h-[32rem] flex-col rounded-lg border border-border bg-background p-4">
      <MessageList messages={messages} />
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <ChatInput onSubmit={(question) => void ask(question)} disabled={isStreaming} />
    </div>
  );
}
