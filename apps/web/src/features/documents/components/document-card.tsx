import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentIcon } from '@/components/ui/icons';

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
  pending: 'bg-surface-soft text-text-muted',
  processing: 'bg-accent/10 text-accent',
  ready: 'bg-primary-soft text-primary',
  failed: 'bg-danger/10 text-danger',
};

interface DocumentCardProps {
  document: DocumentCardData;
  onDelete: () => void;
  isDeleting: boolean;
}

export function DocumentCard({ document, onDelete, isDeleting }: DocumentCardProps) {
  const [confirming, setConfirming] = useState(false);
  const confirmLabelId = useId();
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelButtonRef.current?.focus();
  }, [confirming]);

  function cancelDelete() {
    setConfirming(false);
    deleteButtonRef.current?.focus();
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4 transition-colors duration-150 ease-standard hover:border-primary/40">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
        <Link href={`/documents/${document.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <DocumentIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-text">
              {document.filename}
            </span>
            <span className="mt-1 block text-xs text-text-muted">
              {document.pageCount ? `${document.pageCount} pages` : 'Page count pending'}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[document.status]}`}
          >
            {statusLabel[document.status]}
          </span>
          <Button
            ref={deleteButtonRef}
            variant="ghost"
            onClick={() => setConfirming(true)}
            disabled={isDeleting}
            aria-label={`Delete ${document.filename}`}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
      {confirming && (
        <div
          role="group"
          aria-labelledby={confirmLabelId}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancelDelete();
          }}
          className="mt-4 flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p id={confirmLabelId} className="text-sm font-semibold text-text">
            Delete {document.filename}?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button ref={cancelButtonRef} variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button
              className="bg-danger text-on-primary hover:bg-danger/90"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Confirm delete'}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
