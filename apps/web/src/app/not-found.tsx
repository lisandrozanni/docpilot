import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-lg font-semibold text-text">Page not found</p>
      <p className="text-sm text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/documents"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-standard hover:bg-primary-hover"
      >
        Back to documents
      </Link>
    </main>
  );
}
