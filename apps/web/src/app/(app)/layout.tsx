import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/documents" className="text-lg font-semibold text-text">
            DocPilot
          </Link>
          <nav>
            <Link href="/documents" className="text-sm font-medium text-text-muted hover:text-text">
              Documents
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
