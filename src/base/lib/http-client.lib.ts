import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

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
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 10000,
      ...otherAxiosConfig,
    });

    this.axiosInstance.interceptors.request.use(this.onSuccessRequest);
    this.axiosInstance.interceptors.response.use(this.onSuccessResponse, this.onResponseFailed);
  }

  protected async onSuccessRequest(config: CustomInternalAxiosRequestConfig) {
    if (config.isPrivateRoute) {
      config.headers.set('Is-Private-Route', 'true');
      config.baseURL = '/api';
    } else {
      config.baseURL =
        typeof window !== undefined
          ? (await import('../config/env-client.config')).envClient.NEXT_PUBLIC_API_URL
          : (await import('../config/env-server.config')).envServer.API_URL;
    }
    return config;
  }

  protected onSuccessResponse(response: AxiosResponse) {
    return response.data;
  }

  protected onResponseFailed(error: AxiosError) {
    // TODO: Additional handling for different status codes here
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
