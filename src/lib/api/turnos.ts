import { turnos as _store, clientes, empleados, servicios, NEGOCIO_ID, nextId } from '../mock/data';

export interface Turno {
  id: string;
  negocioId: string;
  clienteId: string;
  empleadoId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'confirmado' | 'en_curso' | 'finalizado' | 'cancelado' | 'ausente';
  origen: 'web' | 'presencial' | 'phone';
  notas?: string;
  createdAt: string;
  cliente: { id: string; nombre: string; apellido?: string; telefono: string };
  empleado: { id: string; nombre: string; apellido?: string };
  servicios: {
    id: string;
    servicio: { id: string; nombre: string; precio: number; duracionMin: number; colorAgenda: string };
    precioAplicado: number;
    duracionAplicada: number;
  }[];
}

export interface CreateTurno {
  clienteId: string;
  empleadoId: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: Turno['estado'];
  origen?: Turno['origen'];
  notas?: string;
  servicioIds: string[];
}

function isoDate(s: string) {
  return s.split('T')[0];
}

export async function getTurnos(_token: string, filters?: { fechaInicio?: string; fechaFin?: string; empleadoId?: string; estado?: string }): Promise<Turno[]> {
  await delay(250);
  let result = [..._store];
  if (filters?.fechaInicio) result = result.filter(t => isoDate(t.fechaInicio) >= isoDate(filters.fechaInicio!));
  if (filters?.fechaFin)    result = result.filter(t => isoDate(t.fechaInicio) <= isoDate(filters.fechaFin!));
  if (filters?.empleadoId)  result = result.filter(t => t.empleadoId === filters.empleadoId);
  if (filters?.estado)      result = result.filter(t => t.estado === filters.estado);
  return result as Turno[];
}

export async function getProximosTurnos(_token: string, limit = 10): Promise<Turno[]> {
  await delay(200);
  const now = new Date().toISOString();
  return _store
    .filter(t => t.fechaInicio >= now && (t.estado === 'pendiente' || t.estado === 'confirmado'))
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .slice(0, limit) as Turno[];
}

export async function getTurno(id: string, _token: string): Promise<Turno> {
  await delay(150);
  const t = _store.find(t => t.id === id);
  if (!t) throw new Error('Turno no encontrado');
  return t as Turno;
}

export async function createTurno(data: CreateTurno, _token: string): Promise<Turno> {
  await delay(300);
  const cli = clientes.find(c => c.id === data.clienteId);
  const emp = empleados.find(e => e.id === data.empleadoId);
  const srvList = data.servicioIds.map(sId => {
    const s = servicios.find(s => s.id === sId);
    return {
      id: nextId('ts'),
      servicio: { id: s?.id ?? sId, nombre: s?.nombre ?? 'Servicio', precio: s?.precio ?? 0, duracionMin: s?.duracionMin ?? 30, colorAgenda: s?.colorAgenda ?? '#6B7280' },
      precioAplicado: s?.precio ?? 0, duracionAplicada: s?.duracionMin ?? 30,
    };
  });

  const nuevo: Turno = {
    id: nextId('tur'), negocioId: NEGOCIO_ID,
    clienteId: data.clienteId, empleadoId: data.empleadoId,
    fechaInicio: data.fechaInicio, fechaFin: data.fechaFin,
    estado: data.estado ?? 'pendiente', origen: data.origen ?? 'presencial',
    notas: data.notas, createdAt: new Date().toISOString(),
    cliente: { id: cli?.id ?? data.clienteId, nombre: cli?.nombre ?? 'Cliente', apellido: cli?.apellido, telefono: cli?.telefono ?? '' },
    empleado: { id: emp?.id ?? data.empleadoId, nombre: emp?.nombre ?? 'Empleado', apellido: emp?.apellido },
    servicios: srvList,
  };
  _store.push(nuevo as typeof _store[0]);
  return nuevo;
}

export async function updateTurno(id: string, data: Partial<CreateTurno>, _token: string): Promise<Turno> {
  await delay(250);
  const idx = _store.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Turno no encontrado');
  Object.assign(_store[idx], data);
  return _store[idx] as Turno;
}

export async function updateTurnoEstado(id: string, estado: Turno['estado'], _token: string): Promise<Turno> {
  await delay(200);
  const idx = _store.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Turno no encontrado');
  _store[idx] = { ..._store[idx], estado };
  return _store[idx] as Turno;
}

export async function deleteTurno(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _store.findIndex(t => t.id === id);
  if (idx !== -1) _store.splice(idx, 1);
  return { message: 'Turno eliminado' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
