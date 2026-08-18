export default function DocumentsLoading() {
  return (
    <div>
      <div className="h-8 w-40 animate-pulse rounded-md bg-border" />
      <div className="mt-6 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
