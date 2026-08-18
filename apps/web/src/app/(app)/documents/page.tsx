import { DocumentList } from '@/features/documents/components/document-list';
import { UploadDropzone } from '@/features/documents/components/upload-dropzone';
import type { DocumentCardData } from '@/features/documents/components/document-card';
import { apiFetch } from '@/lib/api-client';

export default async function DocumentsPage() {
  // RSC does the first fetch (already authenticated via apiFetch); the client
  // takes it as initialData so TanStack Query doesn't refetch on mount, then
  // owns polling/mutations from there.
  const response = await apiFetch('/documents');
  const initialDocuments = (await response.json()) as DocumentCardData[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">Documents</h1>
      <div className="mt-6">
        <UploadDropzone />
      </div>
      <div className="mt-6">
        <DocumentList initialDocuments={initialDocuments} />
      </div>
    </div>
  );
}
