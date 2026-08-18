'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Real observability (Sentry, etc.) is out of scope for this project —
  // console.error is the honest stand-in so failures aren't silently lost.
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface px-6 py-16 text-center"
    >
      <p className="font-medium text-text">Something went wrong</p>
      <p className="text-sm text-text-muted">
        {error.digest ? `Reference: ${error.digest}` : 'Please try again.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
