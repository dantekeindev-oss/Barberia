const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
  } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Error en la petición',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error de conexión con el servidor', 0, error);
  }
}

export const api = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { token }),
  post: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: 'POST', body, token }),
  put: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body, token }),
  patch: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: 'PATCH', body, token }),
  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};

export type { ApiError };
