'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push('/login'),
          },
        });
      }}
    >
      Sign out
    </Button>
  );
}
