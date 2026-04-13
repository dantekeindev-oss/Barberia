import { api } from '../api-client';

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
  usuario?: {
    id: string;
    email: string;
    rol: string;
  };
  horarios: {
    id: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
  }[];
  _count?: {
    turnos: number;
  };
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

export async function getEmpleados(token: string, includeInactive: boolean = false): Promise<Empleado[]> {
  return api.get<Empleado[]>(`/empleados?inactivos=${includeInactive}`, token);
}

export async function getEmpleadosRanking(token: string, limit: number = 10): Promise<Empleado[]> {
  return api.get<Empleado[]>(`/empleados/ranking?limit=${limit}`, token);
}

export async function getEmpleado(id: string, token: string): Promise<Empleado> {
  return api.get<Empleado>(`/empleados/${id}`, token);
}

export async function getEmpleadoEstadisticas(id: string, token: string): Promise<{
  turnosMes: number;
  ingresosGenerados: number;
  totalComision: number;
  serviciosPorTipo: Record<string, number>;
}> {
  return api.get<any>(`/empleados/${id}/estadisticas`, token);
}

export async function createEmpleado(data: CreateEmpleado, token: string): Promise<Empleado> {
  return api.post<Empleado>('/empleados', data, token);
}

export async function updateEmpleado(id: string, data: Partial<CreateEmpleado>, token: string): Promise<Empleado> {
  return api.patch<Empleado>(`/empleados/${id}`, data, token);
}

export async function deleteEmpleado(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/empleados/${id}`, token);
}

export async function addHorario(empleadoId: string, data: {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo?: boolean;
}, token: string): Promise<any> {
  return api.post<any>(`/empleados/${empleadoId}/horarios`, data, token);
}

export async function updateHorario(id: string, data: any, token: string): Promise<any> {
  return api.patch<any>(`/empleados/horarios/${id}`, data, token);
}

export async function deleteHorario(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/empleados/horarios/${id}`, token);
}
