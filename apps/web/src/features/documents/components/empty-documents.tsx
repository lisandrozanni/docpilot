export function EmptyDocuments() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="font-medium text-text">No documents yet</p>
      <p className="mt-1 text-sm text-text-muted">
        Upload a PDF to start asking questions about it.
      </p>
    </div>
  );
}
