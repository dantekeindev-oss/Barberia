import { api } from '../api-client';

// Puntos
export async function getMovimientosPuntos(token: string, clienteId?: string): Promise<any[]> {
  const params = clienteId ? `?clienteId=${clienteId}` : '';
  return api.get<any[]>(`/fidelizacion/puntos/movimientos${params}`, token);
}

export async function getLeaderboard(token: string, limit: number = 10): Promise<any[]> {
  return api.get<any[]>(`/fidelizacion/puntos/leaderboard?limit=${limit}`, token);
}

export async function agregarPuntosPorVisita(clienteId: string, montoCompra: number, token: string): Promise<any> {
  return api.post<any>('/fidelizacion/puntos/agregar-por-visita', { clienteId, montoCompra }, token);
}

// Membresías
export interface Membresia {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  beneficios?: any;
  activa: boolean;
  _count?: {
    clientes: number;
  };
}

export interface CreateMembresia {
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  beneficios?: any[];
  activa?: boolean;
}

export async function getMembresias(token: string): Promise<Membresia[]> {
  return api.get<Membresia[]>('/fidelizacion/membresias', token);
}

export async function getMembresia(id: string, token: string): Promise<Membresia> {
  return api.get<Membresia>(`/fidelizacion/membresias/${id}`, token);
}

export async function createMembresia(data: CreateMembresia, token: string): Promise<Membresia> {
  return api.post<Membresia>('/fidelizacion/membresias', data, token);
}

export async function updateMembresia(id: string, data: Partial<CreateMembresia>, token: string): Promise<Membresia> {
  return api.patch<Membresia>(`/fidelizacion/membresias/${id}`, data, token);
}

export async function deleteMembresia(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/fidelizacion/membresias/${id}`, token);
}

export async function asignarMembresia(clienteId: string, membresiaId: string, token: string): Promise<any> {
  return api.post<any>('/fidelizacion/membresias/asignar', { clienteId, membresiaId }, token);
}

// Cupones
export interface Cupon {
  id: string;
  negocioId: string;
  codigo: string;
  descripcion?: string;
  tipoDescuento: 'porcentaje' | 'monto_fijo';
  valor: number;
  usosMax?: number;
  usosActuales: number;
  fechaDesde?: string;
  fechaHasta?: string;
  activo: boolean;
}

export interface CreateCupon {
  codigo: string;
  descripcion?: string;
  tipoDescuento: Cupon['tipoDescuento'];
  valor: number;
  usosMax?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  activo?: boolean;
}

export async function getCupones(token: string): Promise<Cupon[]> {
  return api.get<Cupon[]>('/fidelizacion/cupones', token);
}

export async function getCupon(id: string, token: string): Promise<Cupon> {
  return api.get<Cupon>(`/fidelizacion/cupones/${id}`, token);
}

export async function getCuponByCodigo(codigo: string, token: string): Promise<Cupon> {
  return api.get<Cupon>(`/fidelizacion/cupones/codigo/${codigo}`, token);
}

export async function validarCupon(codigo: string, monto: number, token: string): Promise<{
  cuponId: string;
  codigo: string;
  tipoDescuento: string;
  valor: number;
  descuento: number;
  montoFinal: number;
}> {
  return api.post<any>('/fidelizacion/cupones/validar', { codigo, monto }, token);
}

export async function usarCupon(id: string, token: string): Promise<Cupon> {
  return api.post<Cupon>(`/fidelizacion/cupones/${id}/usar`, {}, token);
}

export async function createCupon(data: CreateCupon, token: string): Promise<Cupon> {
  return api.post<Cupon>('/fidelizacion/cupones', data, token);
}

export async function updateCupon(id: string, data: Partial<CreateCupon>, token: string): Promise<Cupon> {
  return api.patch<Cupon>(`/fidelizacion/cupones/${id}`, data, token);
}

export async function deleteCupon(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/fidelizacion/cupones/${id}`, token);
}
