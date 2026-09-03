import { apiFetch } from '@/lib/api-client';

// Streaming can't go through a Server Action (no token-by-token delivery), so
// this Route Handler proxies apps/api's stream through to the browser.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const body = await request.text();

  const upstream = await apiFetch(`/documents/${documentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status });
  }

  const conversationId = upstream.headers.get('X-Conversation-Id');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: conversationId ? { 'X-Conversation-Id': conversationId } : {},
  });
}
