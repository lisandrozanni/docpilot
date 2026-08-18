import type { ChatMessage } from '../hooks/use-chat';

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
        Ask a question about this document to get started.
      </div>
    );
  }

  return (
    <ul
      aria-live="polite"
      aria-label="Conversation"
      className="flex flex-1 flex-col gap-4 overflow-y-auto py-4"
    >
      {messages.map((message) => (
        <li
          key={message.id}
          className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
            message.role === 'user'
              ? 'ml-auto bg-primary text-white'
              : 'mr-auto bg-surface text-text'
          }`}
        >
          {message.content || (message.role === 'assistant' ? '…' : '')}
        </li>
      ))}
    </ul>
  );
}
