import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

import { getToken } from './get-token.lib';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  isPrivateRoute?: boolean;
}

export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  isPrivateRoute?: boolean;
}

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;

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
    // Extract error message from response data if available
    const errorData = error.response?.data as { code?: string; message?: string } | undefined;
    const errorMessage = errorData?.code || errorData?.message || error.message;

    // Create a new error with the extracted message
    const newError = new Error(errorMessage);
    throw newError;
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
