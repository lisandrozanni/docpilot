export interface DocumentCardData {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  pageCount: number | null;
  createdAt: string;
}

const statusLabel: Record<DocumentCardData['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

const statusClasses: Record<DocumentCardData['status'], string> = {
  pending: 'bg-border text-text-muted',
  processing: 'bg-accent/10 text-accent',
  ready: 'bg-primary/10 text-primary',
  failed: 'bg-danger/10 text-danger',
};

export function DocumentCard({ document }: { document: DocumentCardData }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-colors duration-150 ease-standard hover:border-primary">
      <div>
        <p className="font-medium text-text">{document.filename}</p>
        <p className="text-sm text-text-muted">
          {document.pageCount ? `${document.pageCount} pages` : 'Page count pending'}
        </p>
      </div>
      <span
        className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusClasses[document.status]}`}
      >
        {statusLabel[document.status]}
      </span>
    </li>
  );
}
