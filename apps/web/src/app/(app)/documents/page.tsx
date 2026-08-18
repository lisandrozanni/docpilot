import { DocumentList } from '@/features/documents/components/document-list';

export default function DocumentsPage() {
  // Real data fetching (RSC + TanStack Query hydration) arrives in Etapa 6.
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">Documents</h1>
      <div className="mt-6">
        <DocumentList documents={[]} />
      </div>
    </div>
  );
}
