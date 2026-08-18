import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // RSC already fetched fresh data for the initial paint — avoid an
        // immediate client-side refetch on mount.
        staleTime: 5 * 1000,
      },
    },
  });
}
