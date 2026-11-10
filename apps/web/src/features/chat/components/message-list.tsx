import type { ChatMessage } from '../hooks/use-chat';

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm leading-6 text-text-muted">
        Your conversation starts here.
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
          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
            message.role === 'user'
              ? 'ml-auto bg-primary text-on-primary'
              : 'mr-auto bg-surface-soft text-text'
          }`}
        >
          {message.content || (message.role === 'assistant' ? '…' : '')}
        </li>
      ))}
    </ul>
  );
}
