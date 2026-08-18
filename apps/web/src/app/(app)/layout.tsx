import Link from 'next/link';
import { requireSession } from '@/features/auth/lib/session';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/documents" className="text-lg font-semibold text-text">
            DocPilot
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/documents" className="text-sm font-medium text-text-muted hover:text-text">
              Documents
            </Link>
            <span className="text-sm text-text-muted">{session.user.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
