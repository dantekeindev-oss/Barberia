import { servicios as _store, NEGOCIO_ID, nextId } from '../mock/data';

export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  colorAgenda: string;
  activo: boolean;
  categoria?: string;
  serviciosEmpleado?: { empleado: { id: string; nombre: string; apellido?: string } }[];
  _count?: { turnoServicios: number };
}

export interface CreateServicio {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  colorAgenda?: string;
  activo?: boolean;
  categoria?: string;
  empleadoIds?: string[];
}

export async function getServicios(_token: string, includeInactive = false): Promise<Servicio[]> {
  await delay(200);
  return (includeInactive ? [..._store] : _store.filter(s => s.activo)) as Servicio[];
}

export async function getServiciosMasVendidos(_token: string, limit = 10): Promise<Servicio[]> {
  await delay(200);
  return [..._store]
    .filter(s => s.activo)
    .sort((a, b) => (b._count?.turnoServicios ?? 0) - (a._count?.turnoServicios ?? 0))
    .slice(0, limit) as Servicio[];
}

export async function getServicio(id: string, _token: string): Promise<Servicio> {
  await delay(150);
  const s = _store.find(s => s.id === id);
  if (!s) throw new Error('Servicio no encontrado');
  return s as Servicio;
}

export async function createServicio(data: CreateServicio, _token: string): Promise<Servicio> {
  await delay(300);
  const nuevo: Servicio = {
    id: nextId('srv'), negocioId: NEGOCIO_ID,
    nombre: data.nombre, descripcion: data.descripcion,
    precio: data.precio, duracionMin: data.duracionMin,
    colorAgenda: data.colorAgenda ?? '#6B7280',
    activo: data.activo ?? true, categoria: data.categoria,
    _count: { turnoServicios: 0 },
  };
  _store.push(nuevo as typeof _store[0]);
  return nuevo;
}

export async function updateServicio(id: string, data: Partial<CreateServicio>, _token: string): Promise<Servicio> {
  await delay(250);
  const idx = _store.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Servicio no encontrado');
  Object.assign(_store[idx], data);
  return _store[idx] as Servicio;
}

export async function deleteServicio(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _store.findIndex(s => s.id === id);
  if (idx !== -1) _store.splice(idx, 1);
  return { message: 'Servicio eliminado' };
}

export async function addEmpleadoToServicio(servicioId: string, _empleadoId: string, _token: string): Promise<Servicio> {
  return getServicio(servicioId, _token);
}

export async function removeEmpleadoFromServicio(_servicioId: string, _empleadoId: string, _token: string): Promise<{ message: string }> {
  await delay(150);
  return { message: 'Empleado removido del servicio' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
