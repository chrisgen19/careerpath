import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/**
 * Returns the authenticated user for the current request, or `null` when
 * there is no valid session. Use in route handlers / server components to
 * gate access and scope queries by `user.id`.
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
