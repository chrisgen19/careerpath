import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Prefer the configured public URL; otherwise fall back to same-origin in the
  // browser so we never ship a hardcoded host to production.
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : undefined),
});

export const { signIn, signUp, signOut, useSession } = authClient;
