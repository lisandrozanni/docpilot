'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

// A browser tab keeps one QueryClient for its lifetime (useState's lazy
// initializer runs once). On the server each request gets its own instance
// via makeQueryClient, so query state never leaks between users.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
