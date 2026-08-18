import { DocumentList } from '@/features/documents/components/document-list';
import { UploadDropzone } from '@/features/documents/components/upload-dropzone';
import type { DocumentCardData } from '@/features/documents/components/document-card';
import { apiFetch } from '@/lib/api-client';

export default async function DocumentsPage() {
  // Polling, caching, and optimistic updates (TanStack Query) arrive in Etapa 6.
  // This proves the auth chain end-to-end: session -> JWT -> verified API call.
  const response = await apiFetch('/documents');
  const documents = (await response.json()) as DocumentCardData[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">Documents</h1>
      <div className="mt-6">
        <UploadDropzone />
      </div>
      <div className="mt-6">
        <DocumentList documents={documents} />
      </div>
    </div>
  );
}
