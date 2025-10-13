import { useEffect, useState } from 'react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

/**
 * Hook to get sidebar state from cookie
 * Returns true if sidebar should be open, false if closed
 */
export function useSidebarStateFromCookie(): boolean | null {
  const [sidebarState, setSidebarState] = useState<boolean | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get cookie value
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const cookieValue = getCookie(SIDEBAR_COOKIE_NAME);

    if (cookieValue !== null) {
      setSidebarState(cookieValue === 'true');
    } else {
      // Default to true if no cookie exists
      setSidebarState(true);
    }
  }, []);

  return sidebarState;
}
