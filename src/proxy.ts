import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const AUTH_PAGES = ['/login', '/register'];

/**
 * Optimistic route protection (Next.js 16 "proxy" convention): redirects
 * unauthenticated users to /login and keeps authenticated users away from the
 * auth pages. Session validity is still enforced server-side in every API route
 * and via getCurrentUser().
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));

  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all page routes except API, Next internals, and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
