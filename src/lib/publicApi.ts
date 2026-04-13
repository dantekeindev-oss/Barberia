const BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public`;

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error en la solicitud');
  }
  return res.json();
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear el turno');
  }
  return res.json();
}

export interface NegocioPublico {
  id: string;
  nombre: string;
  logoUrl?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface ServicioPublico {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  colorAgenda?: string;
}

export interface EmpleadoPublico {
  id: string;
  nombre: string;
  apellido?: string;
  fotoUrl?: string;
  especialidades?: string;
  servicios: { servicioId: string }[];
  horarios: { diaSemana: number; horaInicio: string; horaFin: string }[];
}

export interface TurnoPublico {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  cliente: { nombre: string; apellido?: string; telefono: string };
  empleado: { nombre: string; apellido?: string };
  servicios: {
    servicio: { nombre: string; precio: number; duracionMin: number };
    precioAplicado: number;
  }[];
}

export interface CrearTurnoPublicoPayload {
  nombre: string;
  apellido?: string;
  telefono: string;
  empleadoId: string;
  servicioIds: string[];
  fechaInicio: string;
}

export const publicApi = {
  getInfo: (negocioId: string) =>
    get<NegocioPublico>(`${BASE}/${negocioId}/info`),

  getServicios: (negocioId: string) =>
    get<ServicioPublico[]>(`${BASE}/${negocioId}/servicios`),

  getEmpleados: (negocioId: string, servicioId?: string) => {
    const url = servicioId
      ? `${BASE}/${negocioId}/empleados?servicioId=${servicioId}`
      : `${BASE}/${negocioId}/empleados`;
    return get<EmpleadoPublico[]>(url);
  },

  getSlots: (
    negocioId: string,
    empleadoId: string,
    fecha: string,
    duracion: number,
  ) =>
    get<string[]>(
      `${BASE}/${negocioId}/slots?empleadoId=${empleadoId}&fecha=${fecha}&duracion=${duracion}`,
    ),

  crearTurno: (negocioId: string, payload: CrearTurnoPublicoPayload) =>
    post<TurnoPublico>(`${BASE}/${negocioId}/turnos`, payload),
};
