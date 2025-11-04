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
  const _refreshToken = request.cookies.get('refreshToken')?.value;

  const { pathname } = request.nextUrl;
  const redirectUrl = request.nextUrl.clone();
  const isAuthRoute = RouteUtils.isAuthRoute(pathname);
  const isPrivateRoute = RouteUtils.isPrivateRoute(pathname);
  const isAdminRoute = RouteUtils.isAdminRoute(pathname);
  const isModeratorRoute = RouteUtils.isModeratorRoute(pathname);

  // For public routes without tokens, just continue
  if (!accessToken && !isPrivateRoute && !isAdminRoute && !isModeratorRoute) {
    return NextResponse.next();
  }

  // For protected routes without tokens, redirect to login
  if (!accessToken && (isPrivateRoute || isAdminRoute || isModeratorRoute)) {
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
          user = JSON.parse(userCookie) as User;
        } else {
          console.warn('No user cookie found');
        }
      } catch (userParseError) {
        console.error('User cookie parse error:', userParseError, 'Raw cookie:', userCookie);
      }

      // Check if token is expired - be more lenient if no exp claim
      const isTokenExpired = exp ? exp * 1000 < Date.now() : false;
      const hasValidUser = user?.id;

      // For protected routes, enforce validation but be more lenient during debugging
      if (isPrivateRoute || isAdminRoute || isModeratorRoute) {
        if (!hasValidUser) {
          redirectUrl.pathname = '/auth/login';
          redirectUrl.search = '';
          redirectUrl.searchParams.set('redirect', request.nextUrl.href);
          return deleteCookieAndRedirect(redirectUrl);
        } else if (isTokenExpired) {
          console.warn('Token expired but user valid - allowing access for debugging');
        }
      }

      // For public routes, be more lenient - don't clear cookies unless absolutely necessary
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

        if (isModeratorRoute && ![Role.ADMIN, Role.MODERATOR].includes(user?.role as Role)) {
          redirectUrl.pathname = '/';
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);

      // Only clear cookies and redirect for protected routes
      if (isPrivateRoute || isAdminRoute || isModeratorRoute) {
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
        `refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        `user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
      ],
    },
  });
}
