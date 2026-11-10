import { DocumentIcon } from '@/components/ui/icons';

export function EmptyDocuments() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <DocumentIcon className="h-7 w-7" />
      </span>
      <p className="font-semibold text-text">A fresh start for your ideas</p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
        No documents yet. Upload a PDF to start asking questions about it.
      </p>
    </div>
  );
}
