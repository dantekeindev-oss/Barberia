import { api } from '../api-client';

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
  serviciosEmpleado?: {
    empleado: {
      id: string;
      nombre: string;
      apellido?: string;
    };
  }[];
  _count?: {
    turnoServicios: number;
  };
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

export async function getServicios(token: string, includeInactive: boolean = false): Promise<Servicio[]> {
  return api.get<Servicio[]>(`/servicios?inactivos=${includeInactive}`, token);
}

export async function getServiciosMasVendidos(token: string, limit: number = 10): Promise<Servicio[]> {
  return api.get<Servicio[]>(`/servicios/mas-vendidos?limit=${limit}`, token);
}

export async function getServicio(id: string, token: string): Promise<Servicio> {
  return api.get<Servicio>(`/servicios/${id}`, token);
}

export async function createServicio(data: CreateServicio, token: string): Promise<Servicio> {
  return api.post<Servicio>('/servicios', data, token);
}

export async function updateServicio(id: string, data: Partial<CreateServicio>, token: string): Promise<Servicio> {
  return api.patch<Servicio>(`/servicios/${id}`, data, token);
}

export async function deleteServicio(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/servicios/${id}`, token);
}

export async function addEmpleadoToServicio(servicioId: string, empleadoId: string, token: string): Promise<Servicio> {
  return api.post<Servicio>(`/servicios/${servicioId}/empleados/${empleadoId}`, {}, token);
}

export async function removeEmpleadoFromServicio(servicioId: string, empleadoId: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/servicios/${servicioId}/empleados/${empleadoId}`, token);
}
