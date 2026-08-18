'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { askQuestionFormSchema, type AskQuestionFormValues } from '../schemas';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AskQuestionFormValues>({ resolver: zodResolver(askQuestionFormSchema) });

  const submit = handleSubmit(({ question }) => {
    onSubmit(question);
    reset();
  });

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="flex flex-col gap-2 border-t border-border pt-4"
    >
      <div className="flex gap-2">
        <label htmlFor="chat-question" className="sr-only">
          Ask a question about this document
        </label>
        <input
          id="chat-question"
          type="text"
          placeholder="Ask a question about this document…"
          disabled={disabled}
          aria-invalid={errors.question ? true : undefined}
          aria-describedby={errors.question ? 'chat-question-error' : undefined}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-50"
          {...register('question')}
        />
        <Button type="submit" disabled={disabled}>
          {disabled ? 'Asking…' : 'Ask'}
        </Button>
      </div>
      {errors.question && (
        <p id="chat-question-error" className="text-sm text-danger">
          {errors.question.message}
        </p>
      )}
    </form>
  );
}
