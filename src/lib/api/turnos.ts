import { api } from '../api-client';

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
  cliente: {
    id: string;
    nombre: string;
    apellido?: string;
    telefono: string;
  };
  empleado: {
    id: string;
    nombre: string;
    apellido?: string;
  };
  servicios: {
    id: string;
    servicio: {
      id: string;
      nombre: string;
      precio: number;
      duracionMin: number;
      colorAgenda: string;
    };
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

export async function getTurnos(token: string, filters?: {
  fechaInicio?: string;
  fechaFin?: string;
  empleadoId?: string;
  estado?: string;
}): Promise<Turno[]> {
  const params = new URLSearchParams();
  if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters?.empleadoId) params.append('empleadoId', filters.empleadoId);
  if (filters?.estado) params.append('estado', filters.estado);

  const query = params.toString();
  return api.get<Turno[]>(`/turnos${query ? `?${query}` : ''}`, token);
}

export async function getProximosTurnos(token: string, limit: number = 10): Promise<Turno[]> {
  return api.get<Turno[]>(`/turnos/proximos?limit=${limit}`, token);
}

export async function getTurno(id: string, token: string): Promise<Turno> {
  return api.get<Turno>(`/turnos/${id}`, token);
}

export async function createTurno(data: CreateTurno, token: string): Promise<Turno> {
  return api.post<Turno>('/turnos', data, token);
}

export async function updateTurno(id: string, data: Partial<CreateTurno>, token: string): Promise<Turno> {
  return api.patch<Turno>(`/turnos/${id}`, data, token);
}

export async function updateTurnoEstado(id: string, estado: Turno['estado'], token: string): Promise<Turno> {
  return api.patch<Turno>(`/turnos/${id}/estado`, { estado }, token);
}

export async function deleteTurno(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/turnos/${id}`, token);
}
