export class RouteUtils {
  private static privateRoutes = ['/profile', '/dashboard', '/settings'];
  private static adminRoutes = ['/admin'];
  private static authRoutes = ['/auth'];

  static isPrivateRoute(route: string) {
    return this.privateRoutes.some((r) => route.startsWith(r));
  }

  static isAuthRoute(route: string) {
    return this.authRoutes.some((r) => route.startsWith(r));
  }

  static isAdminRoute(route: string) {
    return this.adminRoutes.some((r) => route.startsWith(r));
  }
}
