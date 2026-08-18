import type { DocumentCardData } from './components/document-card';

// Client-side fetcher hits Next's own Route Handler, never apps/api directly —
// the browser never holds the JWT that authenticates to apps/api.
export async function fetchDocuments(): Promise<DocumentCardData[]> {
  const response = await fetch('/api/documents');

  if (!response.ok) {
    throw new Error(`Failed to fetch documents (${response.status})`);
  }

  return response.json() as Promise<DocumentCardData[]>;
}
