import { clientes as _store, NEGOCIO_ID, nextId, movimientosPuntos, turnos } from '../mock/data';

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
  _count?: { turnos: number };
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

export async function getClientes(_token: string, filters?: { busqueda?: string; segmento?: string }): Promise<Cliente[]> {
  await delay(250);
  let result = [..._store];
  if (filters?.segmento) result = result.filter(c => c.segmento === filters.segmento);
  if (filters?.busqueda) {
    const q = filters.busqueda.toLowerCase();
    result = result.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      (c.apellido?.toLowerCase().includes(q) ?? false) ||
      c.telefono.includes(q),
    );
  }
  return result as Cliente[];
}

export async function getTopClientes(_token: string, limit = 10): Promise<Cliente[]> {
  await delay(200);
  return [..._store]
    .sort((a, b) => b.puntosAcumulados - a.puntosAcumulados)
    .slice(0, limit) as Cliente[];
}

export async function searchByPhone(telefono: string, _token: string): Promise<Cliente | null> {
  await delay(150);
  return (_store.find(c => c.telefono === telefono) ?? null) as Cliente | null;
}

export async function getCliente(id: string, _token: string): Promise<Cliente & { turnos: unknown[]; movimientosPuntos: unknown[] }> {
  await delay(200);
  const c = _store.find(c => c.id === id);
  if (!c) throw new Error('Cliente no encontrado');
  const clienteTurnos = turnos.filter(t => t.clienteId === id);
  const puntos = movimientosPuntos.filter(m => m.clienteId === id);
  return { ...(c as Cliente), turnos: clienteTurnos, movimientosPuntos: puntos };
}

export async function createCliente(data: CreateCliente, _token: string): Promise<Cliente> {
  await delay(300);
  const nuevo: Cliente = {
    id: nextId('cli'), negocioId: NEGOCIO_ID,
    nombre: data.nombre, apellido: data.apellido, telefono: data.telefono,
    email: data.email, fechaNacimiento: data.fechaNacimiento, dni: data.dni,
    preferencias: data.preferencias, observaciones: data.observaciones,
    segmento: data.segmento ?? 'nuevo', puntosAcumulados: data.puntosAcumulados ?? 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    _count: { turnos: 0 },
  };
  _store.push(nuevo as typeof _store[0]);
  return nuevo;
}

export async function updateCliente(id: string, data: Partial<CreateCliente>, _token: string): Promise<Cliente> {
  await delay(250);
  const idx = _store.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Cliente no encontrado');
  Object.assign(_store[idx], data, { updatedAt: new Date().toISOString() });
  return _store[idx] as Cliente;
}

export async function updateSegmento(id: string, segmento: Cliente['segmento'], _token: string): Promise<Cliente> {
  return updateCliente(id, { segmento }, _token);
}

export async function deleteCliente(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _store.findIndex(c => c.id === id);
  if (idx !== -1) _store.splice(idx, 1);
  return { message: 'Cliente eliminado' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
