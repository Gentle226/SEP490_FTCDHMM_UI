import { pathToRegexp } from 'path-to-regexp';

export class RouteUtils {
  private static privateRoutes = ['/favourites', '/profile', '/book', '/book/*path'];
  private static managerRoutes = ['/manager/*path'];
  private static authRoutes = ['/auth/*path'];

  static isPrivateRoute(route: string) {
    return this.privateRoutes.some((r) => pathToRegexp(r).regexp.test(route));
  }

  static isAuthRoute(route: string) {
    return this.authRoutes.some((r) => pathToRegexp(r).regexp.test(route));
  }

  static isManagerRoute(route: string) {
    return this.managerRoutes.some((r) => pathToRegexp(r).regexp.test(route));
  }
}
