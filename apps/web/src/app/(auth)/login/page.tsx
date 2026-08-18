import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/lib/session';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/documents');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-text">Sign in to DocPilot</h1>
        <p className="mt-2 text-sm text-text-muted">
          Ask questions about your documents, powered by Claude.
        </p>
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
