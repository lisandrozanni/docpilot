import { DocumentCard, type DocumentCardData } from './document-card';
import { EmptyDocuments } from './empty-documents';

export function DocumentList({ documents }: { documents: DocumentCardData[] }) {
  if (documents.length === 0) {
    return <EmptyDocuments />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </ul>
  );
}
