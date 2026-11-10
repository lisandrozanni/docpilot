import Link from 'next/link';
import { requireSession } from '@/features/auth/lib/session';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { DocumentIcon } from '@/components/ui/icons';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/documents"
            className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight text-text"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
              <DocumentIcon className="h-5 w-5" />
            </span>
            DocPilot<span className="sr-only"> home</span>
            <span aria-hidden="true" className="text-accent">
              .
            </span>
          </Link>
          <nav aria-label="Account" className="flex min-w-0 items-center gap-2 sm:gap-5">
            <Link
              href="/documents"
              className="hidden rounded-md bg-primary-soft px-3 py-2 text-sm font-semibold text-primary sm:inline"
            >
              Documents
            </Link>
            <span className="hidden max-w-48 truncate text-sm text-text-muted md:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}
