import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument } from '../actions';
import { documentsQueryKey } from './use-documents';
import type { DocumentCardData } from '../components/document-card';

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onMutate: async (documentId: string) => {
      await queryClient.cancelQueries({ queryKey: documentsQueryKey });

      const previousDocuments = queryClient.getQueryData<DocumentCardData[]>(documentsQueryKey);

      queryClient.setQueryData<DocumentCardData[]>(
        documentsQueryKey,
        (documents) => documents?.filter((document) => document.id !== documentId) ?? [],
      );

      return { previousDocuments };
    },
    onError: (_error, _documentId, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentsQueryKey, context.previousDocuments);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });
}
