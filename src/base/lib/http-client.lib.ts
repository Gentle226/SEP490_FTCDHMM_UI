import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

import { translateError } from './error-translator.lib';
import { getToken } from './get-token.lib';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  isPrivateRoute?: boolean;
  suppressErrorToast?: boolean; // Add option to suppress automatic error toast
}

export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  isPrivateRoute?: boolean;
  suppressErrorToast?: boolean;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  // Error deduplication cache: tracks recent errors to prevent duplicate toasts
  private static errorCache = new Map<string, number>();
  private static readonly ERROR_DEDUP_WINDOW = 2000; // 2 seconds
  private static readonly CACHE_CLEANUP_THRESHOLD = 5000; // 5 seconds

  constructor({ headers, ...otherAxiosConfig }: Omit<CreateAxiosDefaults, 'baseURL'> = {}) {
    this.axiosInstance = axios.create({
      headers: {
        ...headers,
      },
      timeout: 120000, // Increased to 120 seconds for long-running requests like image detection
      ...otherAxiosConfig,
    });

    this.axiosInstance.interceptors.request.use(this.onSuccessRequest);
    this.axiosInstance.interceptors.response.use(this.onSuccessResponse, this.onResponseFailed);
  }

  /**
   * Cleanup old entries from error cache to prevent memory leaks
   */
  private static cleanupErrorCache() {
    const now = Date.now();
    for (const [key, timestamp] of HttpClient.errorCache.entries()) {
      if (now - timestamp > HttpClient.CACHE_CLEANUP_THRESHOLD) {
        HttpClient.errorCache.delete(key);
      }
    }
  }

  /**
   * Check if error should be shown (not a duplicate within time window)
   */
  private static shouldShowError(errorKey: string): boolean {
    const now = Date.now();
    const lastShown = HttpClient.errorCache.get(errorKey);

    if (!lastShown || now - lastShown > HttpClient.ERROR_DEDUP_WINDOW) {
      // Update cache and cleanup old entries
      HttpClient.errorCache.set(errorKey, now);
      HttpClient.cleanupErrorCache();
      return true;
    }

    return false;
  }

  protected async onSuccessRequest(config: CustomInternalAxiosRequestConfig) {
    const token = getToken();

    if (config.isPrivateRoute) {
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      config.baseURL =
        typeof window !== 'undefined'
          ? (await import('../config/env-client.config')).envClient.NEXT_PUBLIC_API_URL
          : (await import('../config/env-server.config')).envServer.API_URL;
    } else {
      config.baseURL =
        typeof window !== 'undefined'
          ? (await import('../config/env-client.config')).envClient.NEXT_PUBLIC_API_URL
          : (await import('../config/env-server.config')).envServer.API_URL;
    }
    return config;
  }

  protected onSuccessResponse(response: AxiosResponse) {
    return response.data;
  }

  protected onResponseFailed(error: AxiosError) {
    // Check if we should suppress the error toast
    const config = error.config as CustomInternalAxiosRequestConfig;
    const suppressToast = config?.suppressErrorToast;

    // Show toast notification for errors unless suppressed
    if (!suppressToast && typeof window !== 'undefined') {
      // Get error details for deduplication
      const statusCode =
        (error.response?.data as { statusCode?: number })?.statusCode || error.status;
      const errorMessage = translateError(error);

      // Create unique key for this error (statusCode + message)
      const errorKey = `${statusCode}:${errorMessage}`;

      // Only show toast if this error wasn't shown recently (deduplication)
      if (HttpClient.shouldShowError(errorKey)) {
        // Dynamic import to avoid SSR issues
        import('sonner').then(({ toast }) => {
          toast.error(errorMessage);
        });
      }
    }

    throw error;
  }

  public get<T>(url: string, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.get<T, T>(url, config);
  }

  public post<T>(url: string, data?: unknown, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.post<T, T>(url, data, config);
  }

  public patch<T>(url: string, data?: unknown, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.patch<T, T>(url, data, config);
  }

  public put<T>(url: string, data?: unknown, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.put<T, T>(url, data, config);
  }

  public delete<T = void>(url: string, config?: CustomAxiosRequestConfig) {
    return this.axiosInstance.delete<T, T>(url, config);
  }
}

export const httpClient = new HttpClient();
