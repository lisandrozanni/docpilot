import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/lib/session';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import { DocumentIcon, SparkleIcon } from '@/components/ui/icons';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/documents');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-sm md:grid md:min-h-[34rem] md:grid-cols-2">
        <div className="flex flex-col justify-between bg-primary p-8 text-on-primary sm:p-12">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-on-primary/15">
              <DocumentIcon className="h-5 w-5" />
            </span>
            DocPilot<span aria-hidden="true">.</span>
          </div>
          <div className="py-12 md:py-20">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-on-primary/25 px-3 py-1.5 text-xs font-semibold">
              <SparkleIcon className="h-4 w-4" /> YOUR DOCUMENT COMPANION
            </span>
            <h1 className="max-w-md text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              Make sense of every page.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-on-primary/80">
              Find the answers you need in your documents, without reading between every line.
            </p>
          </div>
          <p className="text-xs text-on-primary/70">A quieter way to work with your documents.</p>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
            Welcome to DocPilot
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text">
            Let&apos;s get started<span className="text-accent">.</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Sign in to create your workspace, upload a PDF, and start asking questions.
          </p>
          <div className="mt-8">
            <GoogleSignInButton />
          </div>
          <div className="mt-8 border-t border-border pt-6 text-xs leading-5 text-text-muted">
            One workspace for your documents and the questions that matter.
          </div>
        </div>
      </div>
    </main>
  );
}
