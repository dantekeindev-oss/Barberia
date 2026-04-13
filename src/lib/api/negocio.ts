import { api } from '../api-client';

export interface Negocio {
  id: string;
  nombre: string;
  logoUrl?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  timezone: string;
  configuracion?: any;
  _count?: {
    usuarios: number;
    clientes: number;
    empleados: number;
    turnos: number;
    ventas: number;
  };
}

export interface DashboardData {
  resumen: {
    totalClientes: number;
    totalEmpleados: number;
    totalServicios: number;
    turnosHoy: number;
    facturadoHoy: number;
  };
  proximosTurnos: any[];
  alertas: {
    clientesBajoPuntos: any[];
    productosBajoStock: any[];
  };
}

export async function getDashboard(negocioId: string, token: string): Promise<DashboardData> {
  return api.get<DashboardData>(`/negocio/${negocioId}/dashboard`, token);
}

export async function updateNegocio(id: string, data: Partial<Negocio>, token: string): Promise<Negocio> {
  return api.patch<Negocio>(`/negocio/${id}`, data, token);
}
