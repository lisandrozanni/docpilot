export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Chat UI (Etapa 8) and RAG-backed answers (Etapa 9) land here.
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">Document {id}</h1>
      <p className="mt-2 text-sm text-text-muted">Q&amp;A arrives in Etapa 8.</p>
    </div>
  );
}
