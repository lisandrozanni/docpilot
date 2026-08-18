'use client';

import { useDocuments } from '../hooks/use-documents';
import { useDeleteDocument } from '../hooks/use-delete-document';
import { DocumentCard, type DocumentCardData } from './document-card';
import { EmptyDocuments } from './empty-documents';

export function DocumentList({ initialDocuments }: { initialDocuments: DocumentCardData[] }) {
  const { data: documents } = useDocuments(initialDocuments);
  const deleteDocument = useDeleteDocument();

  if (documents.length === 0) {
    return <EmptyDocuments />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDelete={() => deleteDocument.mutate(document.id)}
          isDeleting={deleteDocument.isPending && deleteDocument.variables === document.id}
        />
      ))}
    </ul>
  );
}
