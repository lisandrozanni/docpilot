import { DocumentList } from '@/features/documents/components/document-list';
import { UploadDropzone } from '@/features/documents/components/upload-dropzone';
import type { DocumentCardData } from '@/features/documents/components/document-card';
import { apiFetch } from '@/lib/api-client';

export default async function DocumentsPage() {
  const response = await apiFetch('/documents');
  const initialDocuments = (await response.json()) as DocumentCardData[];

  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <p className="mb-3 text-xs font-bold tracking-[0.16em] text-primary uppercase">
          Your workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Your documents<span className="text-accent">.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
          A little more clarity, one document at a time. Upload a PDF and ask away.
        </p>
      </div>
      <div className="space-y-10">
        <section aria-label="Upload document">
          <UploadDropzone />
        </section>
        <section aria-labelledby="library-title">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 id="library-title" className="text-lg font-semibold tracking-tight">
                Document library
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Everything you have uploaded, in one place.
              </p>
            </div>
          </div>
          <DocumentList initialDocuments={initialDocuments} />
        </section>
      </div>
    </div>
  );
}
