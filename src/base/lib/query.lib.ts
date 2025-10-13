import { QueryClient, isServer } from '@tanstack/react-query';
import { AxiosError } from 'axios';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        networkMode: 'always',
        retryDelay: 0,
        retry: (failureCount, error) => {
          if (error instanceof AxiosError) {
            // Does not retry if status code presents
            if (error.status) return false;
          }

          // Retry only 3 times
          if (failureCount > 2) {
            if (typeof window !== 'undefined') {
              import('sonner').then(({ toast }) => {
                toast.error('Something went wrong. Please try again later.');
              });
            }
            return false;
          }
          return true;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
