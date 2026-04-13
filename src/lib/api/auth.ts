import { api, ApiError } from '../api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    negocio: {
      id: string;
      nombre: string;
      logoUrl?: string;
    };
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', credentials);
}

export async function getProfile(token: string): Promise<AuthResponse['user']> {
  return api.get<AuthResponse['user']>('/auth/me', token);
}

export async function register(data: {
  nombre: string;
  email: string;
  password: string;
  nombreNegocio: string;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', data);
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'RECEPCIONISTA' | 'BARBERO';
  activo: boolean;
  negocioId: string;
}

export async function getUsuarios(token: string, filters?: {
  negocioId?: string;
}): Promise<Usuario[]> {
  const params = new URLSearchParams();
  if (filters?.negocioId) params.append('negocioId', filters.negocioId);

  const query = params.toString();
  return api.get<Usuario[]>(`/auth/usuarios${query ? `?${query}` : ''}`, token);
}
