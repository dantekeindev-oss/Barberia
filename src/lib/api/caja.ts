import { api } from '../api-client';

export interface Caja {
  id: string;
  negocioId: string;
  fecha: string;
  usuarioAperturaId?: string;
  montoInicial: number;
  estado: 'abierta' | 'cerrada';
  montoContadoCierre?: number;
  montoSistemaCierre?: number;
  diferencia?: number;
  observacionesCierre?: string;
  abiertaAt: string;
  cerradaAt?: string;
}

export interface AbrirCaja {
  montoInicial: number;
}

export interface CerrarCaja {
  montoContadoCierre: number;
  observacionesCierre?: string;
}

export async function getCajaActual(token: string): Promise<Caja & {
  ventas: Venta[];
  movimientos: MovimientoCaja[];
  resumen: any;
}> {
  return api.get<any>('/caja/actual', token);
}

export async function abrirCaja(data: AbrirCaja, token: string): Promise<Caja> {
  return api.post<Caja>('/caja/abrir', data, token);
}

export async function cerrarCaja(id: string, data: CerrarCaja, token: string): Promise<Caja> {
  return api.patch<Caja>(`/caja/cerrar/${id}`, data, token);
}

export async function getCajas(token: string, filters?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<Caja[]> {
  const params = new URLSearchParams();
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);

  const query = params.toString();
  return api.get<Caja[]>(`/caja/cajas${query ? `?${query}` : ''}`, token);
}

export async function getCaja(id: string, token: string): Promise<Caja> {
  return api.get<Caja>(`/caja/cajas/${id}`, token);
}

export async function getReporteDiario(token: string, fecha?: string): Promise<any> {
  const params = fecha ? `?fecha=${fecha}` : '';
  return api.get<any>(`/caja/reporte-diario${params}`, token);
}

// Ventas
export interface Venta {
  id: string;
  cajaId: string;
  negocioId: string;
  clienteId?: string;
  turnoId?: string;
  tipo: 'servicio' | 'producto' | 'mixta';
  subtotal: number;
  descuento: number;
  total: number;
  createdAt: string;
  items: {
    id: string;
    tipo: string;
    referenciaId: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  pagos: {
    id: string;
    medioPago: string;
    monto: number;
    referenciaExterna?: string;
  }[];
}

export interface CreateVenta {
  cajaId: string;
  tipo: Venta['tipo'];
  clienteId?: string;
  turnoId?: string;
  subtotal: number;
  descuento: number;
  total: number;
  cuponIds?: string[];
  items: {
    tipo: 'servicio' | 'producto';
    referenciaId: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  pagos: {
    medioPago: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr' | 'otro';
    monto: number;
    referenciaExterna?: string;
  }[];
}

export async function getVentas(token: string, filters?: {
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: Venta['tipo'];
  clienteId?: string;
}): Promise<Venta[]> {
  const params = new URLSearchParams();
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.clienteId) params.append('clienteId', filters.clienteId);

  const query = params.toString();
  return api.get<Venta[]>(`/caja/ventas${query ? `?${query}` : ''}`, token);
}

export async function getVenta(id: string, token: string): Promise<Venta> {
  return api.get<Venta>(`/caja/ventas/${id}`, token);
}

export async function createVenta(data: CreateVenta, token: string): Promise<Venta> {
  return api.post<Venta>('/caja/ventas', data, token);
}

// Movimientos
export interface MovimientoCaja {
  id: string;
  cajaId: string;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  descripcion?: string;
  monto: number;
  medioPago?: string;
  createdAt: string;
}

export async function getMovimientosCaja(token: string, filters?: {
  cajaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<MovimientoCaja[]> {
  const params = new URLSearchParams();
  if (filters?.cajaId) params.append('cajaId', filters.cajaId);
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);

  const query = params.toString();
  return api.get<MovimientoCaja[]>(`/caja/movimientos${query ? `?${query}` : ''}`, token);
}

export async function createMovimiento(data: {
  cajaId: string;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  descripcion?: string;
  monto: number;
  medioPago?: string;
}, token: string): Promise<MovimientoCaja> {
  return api.post<MovimientoCaja>('/caja/movimientos', data, token);
}
