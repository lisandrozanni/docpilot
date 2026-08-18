import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-text">Sign in to DocPilot</h1>
        <p className="mt-2 text-sm text-text-muted">
          Ask questions about your documents, powered by Claude.
        </p>
        {/* Google OAuth wiring arrives in Etapa 4 */}
        <Button className="mt-6 w-full" disabled>
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
