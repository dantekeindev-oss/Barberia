import { membresias as _membresias, cupones as _cupones, movimientosPuntos as _movimientos, clientes, NEGOCIO_ID, nextId } from '../mock/data';

export async function getMovimientosPuntos(_token: string, clienteId?: string): Promise<unknown[]> {
  await delay(200);
  return clienteId ? _movimientos.filter(m => m.clienteId === clienteId) : [..._movimientos];
}

export async function getLeaderboard(_token: string, limit = 10): Promise<unknown[]> {
  await delay(200);
  return [...clientes]
    .sort((a, b) => b.puntosAcumulados - a.puntosAcumulados)
    .slice(0, limit)
    .map(c => ({ clienteId: c.id, nombre: `${c.nombre} ${c.apellido ?? ''}`.trim(), puntos: c.puntosAcumulados }));
}

export async function agregarPuntosPorVisita(clienteId: string, montoCompra: number, _token: string): Promise<unknown> {
  await delay(200);
  const puntos = Math.floor(montoCompra / 100);
  const cli = clientes.find(c => c.id === clienteId);
  if (cli) cli.puntosAcumulados += puntos;
  const mov = { id: nextId('mp'), clienteId, tipo: 'acumulacion', puntos, descripcion: `Visita - $${montoCompra}`, createdAt: new Date().toISOString() };
  _movimientos.push(mov);
  return mov;
}

// Membresías
export interface Membresia {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  beneficios?: unknown;
  activa: boolean;
  _count?: { clientes: number };
}

export interface CreateMembresia {
  nombre: string;
  descripcion?: string;
  precioMensual: number;
  beneficios?: unknown[];
  activa?: boolean;
}

export async function getMembresias(_token: string): Promise<Membresia[]> {
  await delay(200);
  return [..._membresias] as Membresia[];
}

export async function getMembresia(id: string, _token: string): Promise<Membresia> {
  await delay(150);
  const m = _membresias.find(m => m.id === id);
  if (!m) throw new Error('Membresía no encontrada');
  return m as Membresia;
}

export async function createMembresia(data: CreateMembresia, _token: string): Promise<Membresia> {
  await delay(300);
  const nueva: Membresia = { id: nextId('mem'), negocioId: NEGOCIO_ID, ...data, activa: data.activa ?? true, _count: { clientes: 0 } };
  _membresias.push(nueva as typeof _membresias[0]);
  return nueva;
}

export async function updateMembresia(id: string, data: Partial<CreateMembresia>, _token: string): Promise<Membresia> {
  await delay(250);
  const idx = _membresias.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Membresía no encontrada');
  Object.assign(_membresias[idx], data);
  return _membresias[idx] as Membresia;
}

export async function deleteMembresia(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _membresias.findIndex(m => m.id === id);
  if (idx !== -1) _membresias.splice(idx, 1);
  return { message: 'Membresía eliminada' };
}

export async function asignarMembresia(clienteId: string, membresiaId: string, _token: string): Promise<unknown> {
  await delay(200);
  return { clienteId, membresiaId, asignadaAt: new Date().toISOString() };
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

export async function getCupones(_token: string): Promise<Cupon[]> {
  await delay(200);
  return [..._cupones] as Cupon[];
}

export async function getCupon(id: string, _token: string): Promise<Cupon> {
  await delay(150);
  const c = _cupones.find(c => c.id === id);
  if (!c) throw new Error('Cupón no encontrado');
  return c as Cupon;
}

export async function getCuponByCodigo(codigo: string, _token: string): Promise<Cupon> {
  await delay(150);
  const c = _cupones.find(c => c.codigo === codigo.toUpperCase());
  if (!c) throw new Error('Cupón no encontrado');
  return c as Cupon;
}

export async function validarCupon(codigo: string, monto: number, _token: string) {
  await delay(200);
  const c = _cupones.find(c => c.codigo === codigo.toUpperCase() && c.activo);
  if (!c) throw new Error('Cupón inválido');
  const descuento = c.tipoDescuento === 'porcentaje' ? Math.round(monto * c.valor / 100) : c.valor;
  return { cuponId: c.id, codigo: c.codigo, tipoDescuento: c.tipoDescuento, valor: c.valor, descuento, montoFinal: monto - descuento };
}

export async function usarCupon(id: string, _token: string): Promise<Cupon> {
  await delay(150);
  const idx = _cupones.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Cupón no encontrado');
  _cupones[idx] = { ..._cupones[idx], usosActuales: _cupones[idx].usosActuales + 1 };
  return _cupones[idx] as Cupon;
}

export async function createCupon(data: CreateCupon, _token: string): Promise<Cupon> {
  await delay(300);
  const nuevo: Cupon = { id: nextId('cup'), negocioId: NEGOCIO_ID, ...data, usosActuales: 0, activo: data.activo ?? true };
  _cupones.push(nuevo as typeof _cupones[0]);
  return nuevo;
}

export async function updateCupon(id: string, data: Partial<CreateCupon>, _token: string): Promise<Cupon> {
  await delay(250);
  const idx = _cupones.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Cupón no encontrado');
  Object.assign(_cupones[idx], data);
  return _cupones[idx] as Cupon;
}

export async function deleteCupon(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _cupones.findIndex(c => c.id === id);
  if (idx !== -1) _cupones.splice(idx, 1);
  return { message: 'Cupón eliminado' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
