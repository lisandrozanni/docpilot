'use client';

import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';

export function GoogleSignInButton() {
  return (
    <Button
      className="w-full"
      onClick={() => {
        void authClient.signIn.social({ provider: 'google', callbackURL: '/documents' });
      }}
    >
      Continue with Google
    </Button>
  );
}
