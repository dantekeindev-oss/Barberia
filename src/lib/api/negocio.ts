import { turnos, clientes, empleados, servicios, productos, NEGOCIO_ID } from '../mock/data';

export interface Negocio {
  id: string;
  nombre: string;
  logoUrl?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  timezone: string;
  configuracion?: unknown;
  _count?: { usuarios: number; clientes: number; empleados: number; turnos: number; ventas: number };
}

export interface DashboardData {
  resumen: {
    totalClientes: number;
    totalEmpleados: number;
    totalServicios: number;
    turnosHoy: number;
    facturadoHoy: number;
  };
  proximosTurnos: unknown[];
  alertas: {
    clientesBajoPuntos: unknown[];
    productosBajoStock: unknown[];
  };
}

const NEGOCIO_DATA: Negocio = {
  id: NEGOCIO_ID,
  nombre: 'Barbería El Clásico',
  logoUrl: undefined,
  direccion: 'Av. Corrientes 1234, CABA',
  telefono: '+54 11 4567-8900',
  email: 'info@elclasico.com',
  timezone: 'America/Argentina/Buenos_Aires',
};

export async function getDashboard(_negocioId: string, _token: string): Promise<DashboardData> {
  await delay(350);
  const todayStr = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fechaInicio.startsWith(todayStr));
  const finalizadosHoy = turnosHoy.filter(t => t.estado === 'finalizado');
  const facturadoHoy = finalizadosHoy.reduce((sum, t) => sum + t.servicios.reduce((s, sv) => s + sv.precioAplicado, 0), 0);
  const now = new Date().toISOString();
  const proximos = turnos
    .filter(t => t.fechaInicio >= now && (t.estado === 'pendiente' || t.estado === 'confirmado'))
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .slice(0, 5);
  const productosBajoStock = productos.filter(p => p.stockActual <= p.stockMinimo);
  const clientesBajoPuntos = clientes.filter(c => c.puntosAcumulados < 100 && c.segmento !== 'nuevo');

  return {
    resumen: {
      totalClientes: clientes.length,
      totalEmpleados: empleados.filter(e => e.activo).length,
      totalServicios: servicios.filter(s => s.activo).length,
      turnosHoy: turnosHoy.length,
      facturadoHoy,
    },
    proximosTurnos: proximos,
    alertas: { clientesBajoPuntos, productosBajoStock },
  };
}

export async function updateNegocio(_id: string, data: Partial<Negocio>, _token: string): Promise<Negocio> {
  await delay(300);
  Object.assign(NEGOCIO_DATA, data);
  return { ...NEGOCIO_DATA };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
