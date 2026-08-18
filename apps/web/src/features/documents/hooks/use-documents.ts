import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '../api';
import type { DocumentCardData } from '../components/document-card';

export const documentsQueryKey = ['documents'] as const;

const POLL_INTERVAL_MS = 3000;

export function useDocuments(initialData: DocumentCardData[]) {
  return useQuery({
    queryKey: documentsQueryKey,
    queryFn: fetchDocuments,
    initialData,
    refetchInterval: (query) => {
      const documents = query.state.data ?? [];
      const hasInFlightDocument = documents.some(
        (document) => document.status === 'pending' || document.status === 'processing',
      );
      return hasInFlightDocument ? POLL_INTERVAL_MS : false;
    },
  });
}
