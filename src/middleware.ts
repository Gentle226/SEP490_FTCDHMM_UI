import { decodeJwt } from 'jose';
import { NextURL } from 'next/dist/server/web/next-url';
import { NextRequest, NextResponse } from 'next/server';

import { Role, User } from '@/modules/auth/types';

import { RouteUtils } from './base/utils';

export const config = {
  /**
   * The middleware runs on all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico, sitemap.xml, robots.txt (metadata files)
   * - URL with file extension (names & extensions are separated by a dot)
   */
  matcher: '/((?!api|_next/static|_next/image|.*\\..*).*)',
};

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  const { pathname } = request.nextUrl;
  const redirectUrl = request.nextUrl.clone();
  const isAuthRoute = RouteUtils.isAuthRoute(pathname);
  const isPrivateRoute = RouteUtils.isPrivateRoute(pathname);
  const isAdminRoute = RouteUtils.isAdminRoute(pathname);

  // For public routes without tokens, just continue
  if (!accessToken && !isPrivateRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // For protected routes without tokens, redirect to login
  if (!accessToken && (isPrivateRoute || isAdminRoute)) {
    redirectUrl.pathname = '/auth/login';
    redirectUrl.search = '';
    redirectUrl.searchParams.set('redirect', request.nextUrl.href);
    return NextResponse.redirect(redirectUrl);
  }

  // If we have an access token, validate it
  if (accessToken) {
    try {
      const { exp } = decodeJwt(accessToken);
      const userCookie = request.cookies.get('user')?.value;

      let user: User | null = null;
      try {
        if (userCookie) {
          // Decode base64-encoded user cookie
          const decodedUser = Buffer.from(userCookie, 'base64').toString('utf-8');
          user = JSON.parse(decodedUser) as User;
        } else {
          console.warn('No user cookie found');
        }
      } catch (userParseError) {
        console.error('User cookie parse error:', userParseError, 'Raw cookie:', userCookie);
      }

      // Check if token is expired
      const isTokenExpired = exp ? exp * 1000 < Date.now() : false;
      const hasValidUser = user?.id;

      // If token is expired, clear cookies for all routes to prevent frozen state
      if (isTokenExpired) {
        console.warn('Token expired, clearing cookies');
        // For auth routes, just clear cookies and continue (allow access to login/register)
        if (isAuthRoute) {
          return deleteCookieAndContinue();
        }
        // For protected routes, clear cookies and redirect to login
        if (isPrivateRoute || isAdminRoute) {
          redirectUrl.pathname = '/auth/login';
          redirectUrl.search = '';
          redirectUrl.searchParams.set('redirect', request.nextUrl.href);
          return deleteCookieAndRedirect(redirectUrl);
        }
        // For public routes, clear cookies and continue
        return deleteCookieAndContinue();
      }

      // Token is valid, check user validity
      if (!hasValidUser) {
        // No valid user, clear cookies
        if (isPrivateRoute || isAdminRoute) {
          redirectUrl.pathname = '/auth/login';
          redirectUrl.search = '';
          redirectUrl.searchParams.set('redirect', request.nextUrl.href);
          return deleteCookieAndRedirect(redirectUrl);
        }
        // For public routes including auth routes, clear cookies and continue
        return deleteCookieAndContinue();
      }

      // Token and user are valid
      if (hasValidUser) {
        // Check role-based access
        if (isAuthRoute) {
          redirectUrl.pathname = '/';
          return NextResponse.redirect(redirectUrl);
        }

        if (isAdminRoute && user?.role !== Role.ADMIN) {
          redirectUrl.pathname = '/';
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);

      // Only clear cookies and redirect for protected routes
      if (isPrivateRoute || isAdminRoute) {
        redirectUrl.pathname = '/auth/login';
        redirectUrl.search = '';
        redirectUrl.searchParams.set('redirect', request.nextUrl.href);
        return deleteCookieAndRedirect(redirectUrl);
      }

      // For public routes, continue even with invalid tokens
      return NextResponse.next();
    }
  }

  // Continue if the route is accessible
  return NextResponse.next();
}

function deleteCookieAndRedirect(url: NextURL) {
  return NextResponse.redirect(url, {
    // @ts-expect-error Array of cookies does work in runtime
    headers: {
      'Set-Cookie': [
        `accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        `user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
      ],
    },
  });
}

function deleteCookieAndContinue() {
  return NextResponse.next({
    request: {
      headers: new Headers(),
    },
    // @ts-expect-error Array of cookies does work in runtime
    headers: {
      'Set-Cookie': [
        `accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        `user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
      ],
    },
  });
}
