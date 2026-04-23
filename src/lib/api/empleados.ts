import { empleados as _store, NEGOCIO_ID, nextId, turnos } from '../mock/data';

export interface Empleado {
  id: string;
  negocioId: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  fotoUrl?: string;
  comisionPorcentaje: number;
  activo: boolean;
  fechaIngreso: string;
  especialidades: string;
  createdAt: string;
  usuario?: { id: string; email: string; rol: string };
  horarios: { id: string; diaSemana: number; horaInicio: string; horaFin: string; activo: boolean }[];
  _count?: { turnos: number };
}

export interface CreateEmpleado {
  nombre: string;
  apellido?: string;
  telefono?: string;
  fotoUrl?: string;
  comisionPorcentaje?: number;
  activo?: boolean;
  fechaIngreso: string;
  especialidades?: string[];
  usuarioId?: string;
}

export async function getEmpleados(_token: string, includeInactive = false): Promise<Empleado[]> {
  await delay(200);
  const result = includeInactive ? [..._store] : _store.filter(e => e.activo);
  return result.map(e => ({ ...e, especialidades: Array.isArray(e.especialidades) ? (e.especialidades as string[]).join(', ') : e.especialidades })) as Empleado[];
}

export async function getEmpleadosRanking(_token: string, limit = 10): Promise<Empleado[]> {
  await delay(200);
  return _store
    .filter(e => e.activo)
    .sort((a, b) => (b._count?.turnos ?? 0) - (a._count?.turnos ?? 0))
    .slice(0, limit)
    .map(e => ({ ...e, especialidades: Array.isArray(e.especialidades) ? (e.especialidades as string[]).join(', ') : e.especialidades })) as Empleado[];
}

export async function getEmpleado(id: string, _token: string): Promise<Empleado> {
  await delay(150);
  const e = _store.find(e => e.id === id);
  if (!e) throw new Error('Empleado no encontrado');
  return { ...e, especialidades: Array.isArray(e.especialidades) ? (e.especialidades as string[]).join(', ') : e.especialidades } as Empleado;
}

export async function getEmpleadoEstadisticas(id: string, _token: string) {
  await delay(200);
  const emp = _store.find(e => e.id === id);
  const turnosMes = turnos.filter(t => t.empleadoId === id && t.estado === 'finalizado').length;
  const ingresos = turnos
    .filter(t => t.empleadoId === id && t.estado === 'finalizado')
    .reduce((sum, t) => sum + t.servicios.reduce((s, sv) => s + sv.precioAplicado, 0), 0);
  const comision = ingresos * ((emp?.comisionPorcentaje ?? 0) / 100);
  return { turnosMes, ingresosGenerados: ingresos, totalComision: comision, serviciosPorTipo: { 'Corte': turnosMes } };
}

export async function createEmpleado(data: CreateEmpleado, _token: string): Promise<Empleado> {
  await delay(300);
  const nuevo = {
    id: nextId('emp'), negocioId: NEGOCIO_ID,
    nombre: data.nombre, apellido: data.apellido, telefono: data.telefono,
    fotoUrl: data.fotoUrl, comisionPorcentaje: data.comisionPorcentaje ?? 8,
    activo: data.activo ?? true, fechaIngreso: data.fechaIngreso,
    especialidades: (data.especialidades ?? []) as unknown as string,
    createdAt: new Date().toISOString(), horarios: [], _count: { turnos: 0 },
  };
  _store.push(nuevo as unknown as typeof _store[0]);
  return { ...nuevo, especialidades: (data.especialidades ?? []).join(', ') };
}

export async function updateEmpleado(id: string, data: Partial<CreateEmpleado>, _token: string): Promise<Empleado> {
  await delay(250);
  const idx = _store.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Empleado no encontrado');
  Object.assign(_store[idx], data);
  return { ..._store[idx], especialidades: Array.isArray(_store[idx].especialidades) ? (_store[idx].especialidades as unknown as string[]).join(', ') : _store[idx].especialidades } as Empleado;
}

export async function deleteEmpleado(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _store.findIndex(e => e.id === id);
  if (idx !== -1) _store.splice(idx, 1);
  return { message: 'Empleado eliminado' };
}

export async function addHorario(empleadoId: string, data: { diaSemana: number; horaInicio: string; horaFin: string; activo?: boolean }, _token: string) {
  await delay(200);
  const emp = _store.find(e => e.id === empleadoId);
  if (!emp) throw new Error('Empleado no encontrado');
  const horario = { id: nextId('hor'), empleadoId, diaSemana: data.diaSemana, horaInicio: data.horaInicio, horaFin: data.horaFin, activo: data.activo ?? true };
  emp.horarios.push(horario);
  return horario;
}

export async function updateHorario(id: string, data: Record<string, unknown>, _token: string) {
  await delay(150);
  for (const emp of _store) {
    const h = emp.horarios.find(h => h.id === id);
    if (h) { Object.assign(h, data); return h; }
  }
  throw new Error('Horario no encontrado');
}

export async function deleteHorario(id: string, _token: string): Promise<{ message: string }> {
  await delay(150);
  for (const emp of _store) {
    const idx = emp.horarios.findIndex(h => h.id === id);
    if (idx !== -1) { emp.horarios.splice(idx, 1); return { message: 'Horario eliminado' }; }
  }
  return { message: 'Horario eliminado' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
