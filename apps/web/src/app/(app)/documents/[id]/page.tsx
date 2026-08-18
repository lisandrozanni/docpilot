import { notFound } from 'next/navigation';
import { DocumentChat } from '@/features/chat/components/document-chat';
import { apiFetch } from '@/lib/api-client';

interface DocumentResponse {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await apiFetch(`/documents/${id}`);

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to load document (${response.status})`);
  }

  const document = (await response.json()) as DocumentResponse;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">{document.filename}</h1>

      {document.status === 'ready' ? (
        <div className="mt-6">
          <DocumentChat
            documentId={document.id}
            initialMessages={[]}
            initialConversationId={undefined}
          />
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-muted">
          {document.status === 'failed'
            ? 'This document failed to process, so questions are not available.'
            : 'This document is still processing — questions will be available once it is ready.'}
        </p>
      )}
    </div>
  );
}
