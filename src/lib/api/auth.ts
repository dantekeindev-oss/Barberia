import { MOCK_USER, nextId } from '../mock/data';

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

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'RECEPCIONISTA' | 'BARBERO';
  activo: boolean;
  negocioId: string;
}

const MOCK_TOKEN = 'mock-jwt-token-demo';

export async function login(_credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(300);
  return { access_token: MOCK_TOKEN, user: MOCK_USER };
}

export async function getProfile(_token: string): Promise<AuthResponse['user']> {
  await delay(100);
  return MOCK_USER;
}

export async function register(data: {
  nombre: string;
  email: string;
  password: string;
  nombreNegocio: string;
}): Promise<AuthResponse> {
  await delay(400);
  return {
    access_token: MOCK_TOKEN,
    user: { ...MOCK_USER, id: nextId('usr'), nombre: data.nombre, email: data.email, negocio: { id: MOCK_USER.negocio.id, nombre: data.nombreNegocio } },
  };
}

export async function getUsuarios(_token: string, _filters?: { negocioId?: string }): Promise<Usuario[]> {
  await delay(200);
  return [
    { id: 'usr-001', nombre: 'Admin', email: 'admin@demo.com', rol: 'ADMIN', activo: true, negocioId: MOCK_USER.negocio.id },
    { id: 'usr-002', nombre: 'Carlos García', email: 'carlos@barberia.com', rol: 'BARBERO', activo: true, negocioId: MOCK_USER.negocio.id },
  ];
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
