import { api } from '../api-client';

export interface Cliente {
  id: string;
  negocioId: string;
  nombre: string;
  apellido?: string;
  telefono: string;
  email?: string;
  fechaNacimiento?: string;
  dni?: string;
  fotoUrl?: string;
  preferencias?: string;
  observaciones?: string;
  segmento: 'nuevo' | 'frecuente' | 'inactivo';
  puntosAcumulados: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    turnos: number;
  };
}

export interface CreateCliente {
  nombre: string;
  apellido?: string;
  telefono: string;
  email?: string;
  fechaNacimiento?: string;
  dni?: string;
  preferencias?: string;
  observaciones?: string;
  segmento?: Cliente['segmento'];
  puntosAcumulados?: number;
}

export async function getClientes(token: string, filters?: {
  busqueda?: string;
  segmento?: string;
}): Promise<Cliente[]> {
  const params = new URLSearchParams();
  if (filters?.busqueda) params.append('busqueda', filters.busqueda);
  if (filters?.segmento) params.append('segmento', filters.segmento);

  const query = params.toString();
  return api.get<Cliente[]>(`/clientes${query ? `?${query}` : ''}`, token);
}

export async function getTopClientes(token: string, limit: number = 10): Promise<Cliente[]> {
  return api.get<Cliente[]>(`/clientes/top?limit=${limit}`, token);
}

export async function searchByPhone(telefono: string, token: string): Promise<Cliente | null> {
  return api.get<Cliente | null>(`/clientes/search?telefono=${encodeURIComponent(telefono)}`, token);
}

export async function getCliente(id: string, token: string): Promise<Cliente & {
  turnos: any[];
  movimientosPuntos: any[];
}> {
  return api.get<any>(`/clientes/${id}`, token);
}

export async function createCliente(data: CreateCliente, token: string): Promise<Cliente> {
  return api.post<Cliente>('/clientes', data, token);
}

export async function updateCliente(id: string, data: Partial<CreateCliente>, token: string): Promise<Cliente> {
  return api.patch<Cliente>(`/clientes/${id}`, data, token);
}

export async function updateSegmento(id: string, segmento: Cliente['segmento'], token: string): Promise<Cliente> {
  return api.patch<Cliente>(`/clientes/${id}/segmento`, { segmento }, token);
}

export async function deleteCliente(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/clientes/${id}`, token);
}
