'use client';

// This only fires when the ROOT layout itself throws — a normal error.tsx
// can't catch that, since the layout wrapping it is the thing that's broken.
// It must render its own <html>/<body>: there is no parent layout left to
// provide them. No design-system imports here on purpose — if globals.css or
// a provider is what broke, this file can't depend on it either.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <p>Something went wrong.</p>
        {error.digest && <p>Reference: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: '1rem' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
