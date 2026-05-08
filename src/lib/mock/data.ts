// Central in-memory mock store — persists for the duration of the browser session.

export const NEGOCIO_ID = 'neg-001';

export const MOCK_USER = {
  id: 'usr-001',
  nombre: 'Admin',
  email: 'admin@demo.com',
  rol: 'ADMIN',
  negocio: { id: NEGOCIO_ID, nombre: 'Barbería El Clásico' },
};

// ── Date helpers ─────────────────────────────────────────────────────────────

function dt(dayOffset: number, h: number, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function dStr(dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
}

// ── Empleados ─────────────────────────────────────────────────────────────────

export const empleados = [
  {
    id: 'emp-001', negocioId: NEGOCIO_ID,
    nombre: 'Carlos', apellido: 'García', telefono: '1155001122',
    fotoUrl: undefined, comisionPorcentaje: 10, activo: true,
    fechaIngreso: '2022-03-15T00:00:00.000Z',
    especialidades: ['Corte clásico', 'Corte + barba', 'Afeitado con navaja'],
    createdAt: '2022-03-15T00:00:00.000Z',
    horarios: [
      { id: 'hor-001', empleadoId: 'emp-001', diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-002', empleadoId: 'emp-001', diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-003', empleadoId: 'emp-001', diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-004', empleadoId: 'emp-001', diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-005', empleadoId: 'emp-001', diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-006', empleadoId: 'emp-001', diaSemana: 6, horaInicio: '09:00', horaFin: '14:00', activo: true },
    ],
    _count: { turnos: 142 },
  },
  {
    id: 'emp-002', negocioId: NEGOCIO_ID,
    nombre: 'Miguel', apellido: 'Torres', telefono: '1166002233',
    fotoUrl: undefined, comisionPorcentaje: 8, activo: true,
    fechaIngreso: '2023-01-10T00:00:00.000Z',
    especialidades: ['Corte clásico', 'Corte + barba'],
    createdAt: '2023-01-10T00:00:00.000Z',
    horarios: [
      { id: 'hor-007', empleadoId: 'emp-002', diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-008', empleadoId: 'emp-002', diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-009', empleadoId: 'emp-002', diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-010', empleadoId: 'emp-002', diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-011', empleadoId: 'emp-002', diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', activo: true },
      { id: 'hor-012', empleadoId: 'emp-002', diaSemana: 6, horaInicio: '09:00', horaFin: '14:00', activo: true },
    ],
    _count: { turnos: 98 },
  },
  {
    id: 'emp-003', negocioId: NEGOCIO_ID,
    nombre: 'Lucas', apellido: 'Fernández', telefono: '1177003344',
    fotoUrl: undefined, comisionPorcentaje: 6, activo: true,
    fechaIngreso: '2024-06-01T00:00:00.000Z',
    especialidades: ['Corte clásico', 'Corte infantil'],
    createdAt: '2024-06-01T00:00:00.000Z',
    horarios: [
      { id: 'hor-013', empleadoId: 'emp-003', diaSemana: 2, horaInicio: '10:00', horaFin: '18:00', activo: true },
      { id: 'hor-014', empleadoId: 'emp-003', diaSemana: 3, horaInicio: '10:00', horaFin: '18:00', activo: true },
      { id: 'hor-015', empleadoId: 'emp-003', diaSemana: 4, horaInicio: '10:00', horaFin: '18:00', activo: true },
      { id: 'hor-016', empleadoId: 'emp-003', diaSemana: 5, horaInicio: '10:00', horaFin: '18:00', activo: true },
      { id: 'hor-017', empleadoId: 'emp-003', diaSemana: 6, horaInicio: '10:00', horaFin: '14:00', activo: true },
    ],
    _count: { turnos: 54 },
  },
  {
    id: 'emp-004', negocioId: NEGOCIO_ID,
    nombre: 'Valentina', apellido: 'Ruiz', telefono: '1188004455',
    fotoUrl: undefined, comisionPorcentaje: 10, activo: true,
    fechaIngreso: '2023-08-20T00:00:00.000Z',
    especialidades: ['Tintura completa', 'Rayitos/Mechas', 'Tratamiento capilar'],
    createdAt: '2023-08-20T00:00:00.000Z',
    horarios: [
      { id: 'hor-018', empleadoId: 'emp-004', diaSemana: 1, horaInicio: '10:00', horaFin: '19:00', activo: true },
      { id: 'hor-019', empleadoId: 'emp-004', diaSemana: 2, horaInicio: '10:00', horaFin: '19:00', activo: true },
      { id: 'hor-020', empleadoId: 'emp-004', diaSemana: 3, horaInicio: '10:00', horaFin: '19:00', activo: true },
      { id: 'hor-021', empleadoId: 'emp-004', diaSemana: 4, horaInicio: '10:00', horaFin: '19:00', activo: true },
      { id: 'hor-022', empleadoId: 'emp-004', diaSemana: 5, horaInicio: '10:00', horaFin: '19:00', activo: true },
    ],
    _count: { turnos: 76 },
  },
];

// ── Servicios ─────────────────────────────────────────────────────────────────

export const servicios = [
  { id: 'srv-001', negocioId: NEGOCIO_ID, nombre: 'Corte clásico', descripcion: 'Corte de cabello clásico con tijera o máquina', precio: 1500, duracionMin: 30, colorAgenda: '#2563EB', activo: true, categoria: 'corte', _count: { turnoServicios: 287 } },
  { id: 'srv-002', negocioId: NEGOCIO_ID, nombre: 'Corte + barba', descripcion: 'Corte de cabello más perfilado y arreglo de barba', precio: 2200, duracionMin: 45, colorAgenda: '#7C3AED', activo: true, categoria: 'combo', _count: { turnoServicios: 214 } },
  { id: 'srv-003', negocioId: NEGOCIO_ID, nombre: 'Afeitado con navaja', descripcion: 'Afeitado clásico con navaja de barbero', precio: 1000, duracionMin: 30, colorAgenda: '#059669', activo: true, categoria: 'barba', _count: { turnoServicios: 98 } },
  { id: 'srv-004', negocioId: NEGOCIO_ID, nombre: 'Tintura completa', descripcion: 'Aplicación de tinte en todo el cabello', precio: 4500, duracionMin: 90, colorAgenda: '#DC2626', activo: true, categoria: 'color', _count: { turnoServicios: 63 } },
  { id: 'srv-005', negocioId: NEGOCIO_ID, nombre: 'Rayitos/Mechas', descripcion: 'Mechas o rayitos con papel o gorra', precio: 5500, duracionMin: 120, colorAgenda: '#D97706', activo: true, categoria: 'color', _count: { turnoServicios: 41 } },
  { id: 'srv-006', negocioId: NEGOCIO_ID, nombre: 'Tratamiento capilar', descripcion: 'Hidratación profunda y reconstrucción capilar', precio: 2500, duracionMin: 45, colorAgenda: '#0891B2', activo: true, categoria: 'tratamiento', _count: { turnoServicios: 55 } },
  { id: 'srv-007', negocioId: NEGOCIO_ID, nombre: 'Corte infantil', descripcion: 'Corte para niños hasta 12 años', precio: 1200, duracionMin: 25, colorAgenda: '#8B5CF6', activo: true, categoria: 'corte', _count: { turnoServicios: 72 } },
];

// ── Clientes ──────────────────────────────────────────────────────────────────

export const clientes = [
  { id: 'cli-001', negocioId: NEGOCIO_ID, nombre: 'Martín', apellido: 'López', telefono: '1145001234', email: 'martin.lopez@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 450, createdAt: dStr(-120), updatedAt: dStr(-2), _count: { turnos: 18 } },
  { id: 'cli-002', negocioId: NEGOCIO_ID, nombre: 'Juan', apellido: 'Pérez', telefono: '1156002345', email: 'juan.perez@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 320, createdAt: dStr(-200), updatedAt: dStr(-5), _count: { turnos: 14 } },
  { id: 'cli-003', negocioId: NEGOCIO_ID, nombre: 'Diego', apellido: 'Fernández', telefono: '1167003456', email: undefined, segmento: 'nuevo' as const, puntosAcumulados: 50, createdAt: dStr(-15), updatedAt: dStr(-15), _count: { turnos: 2 } },
  { id: 'cli-004', negocioId: NEGOCIO_ID, nombre: 'Pablo', apellido: 'Rodríguez', telefono: '1178004567', email: 'pablo.r@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 780, createdAt: dStr(-365), updatedAt: dStr(-1), _count: { turnos: 32 } },
  { id: 'cli-005', negocioId: NEGOCIO_ID, nombre: 'Agustín', apellido: 'González', telefono: '1189005678', email: undefined, segmento: 'inactivo' as const, puntosAcumulados: 120, createdAt: dStr(-300), updatedAt: dStr(-90), _count: { turnos: 5 } },
  { id: 'cli-006', negocioId: NEGOCIO_ID, nombre: 'Nicolás', apellido: 'Martínez', telefono: '1190006789', email: 'nico.m@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 560, createdAt: dStr(-180), updatedAt: dStr(-3), _count: { turnos: 22 } },
  { id: 'cli-007', negocioId: NEGOCIO_ID, nombre: 'Sebastián', apellido: 'García', telefono: '1101007890', email: undefined, segmento: 'nuevo' as const, puntosAcumulados: 0, createdAt: dStr(-7), updatedAt: dStr(-7), _count: { turnos: 1 } },
  { id: 'cli-008', negocioId: NEGOCIO_ID, nombre: 'Lucas', apellido: 'Herrera', telefono: '1112008901', email: 'lucas.h@mail.com', segmento: 'inactivo' as const, puntosAcumulados: 200, createdAt: dStr(-400), updatedAt: dStr(-120), _count: { turnos: 8 } },
  { id: 'cli-009', negocioId: NEGOCIO_ID, nombre: 'Matías', apellido: 'Morales', telefono: '1123009012', email: 'matias.m@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 340, createdAt: dStr(-250), updatedAt: dStr(-4), _count: { turnos: 16 } },
  { id: 'cli-010', negocioId: NEGOCIO_ID, nombre: 'Tomás', apellido: 'Díaz', telefono: '1134010123', email: undefined, segmento: 'nuevo' as const, puntosAcumulados: 100, createdAt: dStr(-30), updatedAt: dStr(-10), _count: { turnos: 3 } },
  { id: 'cli-011', negocioId: NEGOCIO_ID, nombre: 'Ignacio', apellido: 'Sánchez', telefono: '1145011234', email: 'igna.s@mail.com', segmento: 'frecuente' as const, puntosAcumulados: 420, createdAt: dStr(-160), updatedAt: dStr(-6), _count: { turnos: 19 } },
  { id: 'cli-012', negocioId: NEGOCIO_ID, nombre: 'Facundo', apellido: 'Torres', telefono: '1156012345', email: undefined, segmento: 'nuevo' as const, puntosAcumulados: 0, createdAt: dStr(-3), updatedAt: dStr(-3), _count: { turnos: 1 } },
];

// ── Turnos ────────────────────────────────────────────────────────────────────

const mkTurno = (
  id: string,
  dayOffset: number,
  hIni: number, mIni: number,
  durMin: number,
  empId: string, empNombre: string, empApellido: string,
  cliId: string, cliNombre: string, cliApellido: string, cliTel: string,
  srvId: string, srvNombre: string, srvPrecio: number, srvDur: number, srvColor: string,
  estado: 'pendiente' | 'confirmado' | 'en_curso' | 'finalizado' | 'cancelado' | 'ausente',
  origen: 'web' | 'presencial' | 'phone' = 'presencial',
) => ({
  id, negocioId: NEGOCIO_ID,
  clienteId: cliId, empleadoId: empId,
  fechaInicio: dt(dayOffset, hIni, mIni),
  fechaFin: dt(dayOffset, hIni, mIni + durMin),
  estado, origen, notas: undefined as string | undefined,
  createdAt: dt(dayOffset - 1, 10),
  cliente: { id: cliId, nombre: cliNombre, apellido: cliApellido, telefono: cliTel },
  empleado: { id: empId, nombre: empNombre, apellido: empApellido },
  servicios: [{
    id: `ts-${id}`, servicio: { id: srvId, nombre: srvNombre, precio: srvPrecio, duracionMin: srvDur, colorAgenda: srvColor },
    precioAplicado: srvPrecio, duracionAplicada: srvDur,
  }],
});

export const turnos = [
  // Ayer (finalizados)
  mkTurno('tur-011', -1, 9, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-009', 'Matías', 'Morales', '1123009012', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'finalizado'),
  mkTurno('tur-012', -1, 10, 0, 45, 'emp-002', 'Miguel', 'Torres', 'cli-010', 'Tomás', 'Díaz', '1134010123', 'srv-002', 'Corte + barba', 2200, 45, '#7C3AED', 'finalizado'),
  mkTurno('tur-013', -1, 11, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-011', 'Ignacio', 'Sánchez', '1145011234', 'srv-003', 'Afeitado con navaja', 1000, 30, '#059669', 'finalizado'),
  mkTurno('tur-014', -1, 14, 0, 30, 'emp-003', 'Lucas', 'Fernández', 'cli-012', 'Facundo', 'Torres', '1156012345', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'finalizado'),
  mkTurno('tur-015', -1, 15, 0, 120, 'emp-004', 'Valentina', 'Ruiz', 'cli-001', 'Martín', 'López', '1145001234', 'srv-005', 'Rayitos/Mechas', 5500, 120, '#D97706', 'finalizado'),

  // Hoy
  mkTurno('tur-001', 0, 9, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-001', 'Martín', 'López', '1145001234', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'finalizado'),
  mkTurno('tur-002', 0, 9, 30, 45, 'emp-002', 'Miguel', 'Torres', 'cli-002', 'Juan', 'Pérez', '1156002345', 'srv-002', 'Corte + barba', 2200, 45, '#7C3AED', 'finalizado'),
  mkTurno('tur-003', 0, 10, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-003', 'Diego', 'Fernández', '1167003456', 'srv-003', 'Afeitado con navaja', 1000, 30, '#059669', 'finalizado'),
  mkTurno('tur-004', 0, 10, 30, 30, 'emp-003', 'Lucas', 'Fernández', 'cli-004', 'Pablo', 'Rodríguez', '1178004567', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'confirmado'),
  mkTurno('tur-005', 0, 11, 0, 45, 'emp-001', 'Carlos', 'García', 'cli-005', 'Agustín', 'González', '1189005678', 'srv-002', 'Corte + barba', 2200, 45, '#7C3AED', 'confirmado'),
  mkTurno('tur-006', 0, 11, 30, 30, 'emp-002', 'Miguel', 'Torres', 'cli-006', 'Nicolás', 'Martínez', '1190006789', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'en_curso'),
  mkTurno('tur-007', 0, 14, 0, 90, 'emp-001', 'Carlos', 'García', 'cli-007', 'Sebastián', 'García', '1101007890', 'srv-004', 'Tintura completa', 4500, 90, '#DC2626', 'pendiente'),
  mkTurno('tur-008', 0, 15, 0, 120, 'emp-004', 'Valentina', 'Ruiz', 'cli-008', 'Lucas', 'Herrera', '1112008901', 'srv-005', 'Rayitos/Mechas', 5500, 120, '#D97706', 'pendiente'),
  mkTurno('tur-009', 0, 16, 0, 25, 'emp-003', 'Lucas', 'Fernández', 'cli-009', 'Matías', 'Morales', '1123009012', 'srv-007', 'Corte infantil', 1200, 25, '#8B5CF6', 'pendiente'),

  // Mañana
  mkTurno('tur-016', 1, 9, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-002', 'Juan', 'Pérez', '1156002345', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'pendiente', 'web'),
  mkTurno('tur-017', 1, 10, 0, 45, 'emp-002', 'Miguel', 'Torres', 'cli-003', 'Diego', 'Fernández', '1167003456', 'srv-002', 'Corte + barba', 2200, 45, '#7C3AED', 'pendiente'),
  mkTurno('tur-018', 1, 11, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-004', 'Pablo', 'Rodríguez', '1178004567', 'srv-003', 'Afeitado con navaja', 1000, 30, '#059669', 'pendiente'),
  mkTurno('tur-019', 1, 15, 0, 90, 'emp-004', 'Valentina', 'Ruiz', 'cli-005', 'Agustín', 'González', '1189005678', 'srv-004', 'Tintura completa', 4500, 90, '#DC2626', 'pendiente', 'web'),

  // Pasado mañana
  mkTurno('tur-020', 2, 9, 0, 30, 'emp-001', 'Carlos', 'García', 'cli-006', 'Nicolás', 'Martínez', '1190006789', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'pendiente'),
  mkTurno('tur-021', 2, 10, 30, 45, 'emp-002', 'Miguel', 'Torres', 'cli-007', 'Sebastián', 'García', '1101007890', 'srv-002', 'Corte + barba', 2200, 45, '#7C3AED', 'pendiente'),
  mkTurno('tur-022', 2, 14, 0, 30, 'emp-003', 'Lucas', 'Fernández', 'cli-010', 'Tomás', 'Díaz', '1134010123', 'srv-001', 'Corte clásico', 1500, 30, '#2563EB', 'pendiente'),
];

// ── Caja y Ventas ─────────────────────────────────────────────────────────────

export const cajas = [
  {
    id: 'caj-001', negocioId: NEGOCIO_ID, fecha: new Date().toISOString().split('T')[0],
    usuarioAperturaId: 'usr-001', montoInicial: 5000, estado: 'abierta' as const,
    abiertaAt: dt(0, 8, 0),
  },
  {
    id: 'caj-002', negocioId: NEGOCIO_ID, fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    usuarioAperturaId: 'usr-001', montoInicial: 5000, estado: 'cerrada' as const,
    montoContadoCierre: 28500, montoSistemaCierre: 28500, diferencia: 0,
    abiertaAt: dt(-1, 8, 0), cerradaAt: dt(-1, 18, 0),
  },
];

export const ventas = [
  {
    id: 'ven-001', cajaId: 'caj-001', negocioId: NEGOCIO_ID, clienteId: 'cli-001', turnoId: 'tur-001',
    tipo: 'servicio' as const, subtotal: 1500, descuento: 0, total: 1500, createdAt: dt(0, 9, 35),
    items: [{ id: 'vi-001', tipo: 'servicio', referenciaId: 'srv-001', descripcion: 'Corte clásico', cantidad: 1, precioUnitario: 1500, subtotal: 1500 }],
    pagos: [{ id: 'pag-001', medioPago: 'efectivo', monto: 1500 }],
  },
  {
    id: 'ven-002', cajaId: 'caj-001', negocioId: NEGOCIO_ID, clienteId: 'cli-002', turnoId: 'tur-002',
    tipo: 'servicio' as const, subtotal: 2200, descuento: 0, total: 2200, createdAt: dt(0, 10, 20),
    items: [{ id: 'vi-002', tipo: 'servicio', referenciaId: 'srv-002', descripcion: 'Corte + barba', cantidad: 1, precioUnitario: 2200, subtotal: 2200 }],
    pagos: [{ id: 'pag-002', medioPago: 'tarjeta_debito', monto: 2200 }],
  },
  {
    id: 'ven-003', cajaId: 'caj-001', negocioId: NEGOCIO_ID, clienteId: 'cli-003', turnoId: 'tur-003',
    tipo: 'servicio' as const, subtotal: 1000, descuento: 0, total: 1000, createdAt: dt(0, 10, 35),
    items: [{ id: 'vi-003', tipo: 'servicio', referenciaId: 'srv-003', descripcion: 'Afeitado con navaja', cantidad: 1, precioUnitario: 1000, subtotal: 1000 }],
    pagos: [{ id: 'pag-003', medioPago: 'qr', monto: 1000 }],
  },
  {
    id: 'ven-004', cajaId: 'caj-001', negocioId: NEGOCIO_ID, clienteId: 'cli-002', turnoId: undefined,
    tipo: 'producto' as const, subtotal: 2700, descuento: 0, total: 2700, createdAt: dt(0, 11, 15),
    items: [
      { id: 'vi-004', tipo: 'producto', referenciaId: 'prod-003', descripcion: 'Gel Fijador Manen\'s', cantidad: 2, precioUnitario: 800, subtotal: 1600 },
      { id: 'vi-005', tipo: 'producto', referenciaId: 'prod-004', descripcion: 'Cera Mate Got2b', cantidad: 1, precioUnitario: 1100, subtotal: 1100 },
    ],
    pagos: [{ id: 'pag-004', medioPago: 'efectivo', monto: 2700 }],
  },
];

export const movimientosCaja = [
  { id: 'mov-001', cajaId: 'caj-001', tipo: 'ingreso' as const, concepto: 'Adelanto efectivo', descripcion: 'Cliente pagó por adelantado próximo turno', monto: 2000, medioPago: 'efectivo', createdAt: dt(0, 9, 0) },
  { id: 'mov-002', cajaId: 'caj-001', tipo: 'egreso' as const, concepto: 'Limpieza y productos', descripcion: 'Compra detergente y escoba', monto: 850, medioPago: 'efectivo', createdAt: dt(0, 10, 0) },
  { id: 'mov-003', cajaId: 'caj-001', tipo: 'egreso' as const, concepto: 'Pago parcial alquiler', descripcion: 'Seña mensual', monto: 15000, medioPago: 'transferencia', createdAt: dt(0, 11, 30) },
];

// ── Productos y Proveedores ───────────────────────────────────────────────────

export const proveedores = [
  { id: 'prov-001', negocioId: NEGOCIO_ID, nombre: 'Distribuidora Cabello SA', contacto: 'Roberto Díaz', telefono: '1160001111', email: 'ventas@cabellosa.com', notas: 'Entrega los miércoles', _count: { productos: 3 } },
  { id: 'prov-002', negocioId: NEGOCIO_ID, nombre: 'Productos Peluquería López', contacto: 'Ana López', telefono: '1170002222', email: 'ana@lopezpelu.com', notas: undefined, _count: { productos: 4 } },
  { id: 'prov-003', negocioId: NEGOCIO_ID, nombre: 'Mayorista Belleza Total', contacto: 'Carlos Vega', telefono: '1180003333', email: undefined, notas: 'Precios mayoristas', _count: { productos: 1 } },
];

export const productos = [
  { id: 'prod-001', negocioId: NEGOCIO_ID, nombre: 'Wella Color Touch Castaño', descripcion: 'Tinte semipermanente castaño 5/0', tipo: 'insumo' as const, costoCompra: 1800, stockActual: 5, stockMinimo: 3, unidad: 'unidad', activo: true, proveedorId: 'prov-001', _count: { movimientos: 8 } },
  { id: 'prod-002', negocioId: NEGOCIO_ID, nombre: "L'Oréal Tinte Rubio", descripcion: 'Tinte permanente rubio 8/0', tipo: 'insumo' as const, costoCompra: 2100, stockActual: 2, stockMinimo: 3, unidad: 'unidad', activo: true, proveedorId: 'prov-001', _count: { movimientos: 6 } },
  { id: 'prod-003', negocioId: NEGOCIO_ID, nombre: "Gel Fijador Manen's", descripcion: 'Fijador extra fuerte 250ml', tipo: 'venta' as const, precioVenta: 800, costoCompra: 400, stockActual: 10, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 15 } },
  { id: 'prod-004', negocioId: NEGOCIO_ID, nombre: 'Cera Mate Got2b', descripcion: 'Cera mate modeladora 100ml', tipo: 'venta' as const, precioVenta: 1100, costoCompra: 600, stockActual: 15, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 22 } },
  { id: 'prod-005', negocioId: NEGOCIO_ID, nombre: 'Pomada Brillantina', descripcion: 'Pomada con brillo natural 80g', tipo: 'venta' as const, precioVenta: 900, costoCompra: 450, stockActual: 8, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 10 } },
  { id: 'prod-006', negocioId: NEGOCIO_ID, nombre: 'Shampoo Men Expert', descripcion: 'Shampoo anticaspa 400ml', tipo: 'venta' as const, precioVenta: 1500, costoCompra: 750, stockActual: 12, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-003', _count: { movimientos: 7 } },
  { id: 'prod-007', negocioId: NEGOCIO_ID, nombre: 'Hojas Gillette (pack 5)', descripcion: 'Hojas de afeitar premium', tipo: 'insumo' as const, costoCompra: 600, stockActual: 20, stockMinimo: 10, unidad: 'pack', activo: true, proveedorId: 'prov-002', _count: { movimientos: 12 } },
  { id: 'prod-008', negocioId: NEGOCIO_ID, nombre: 'Aftershave Nivea Men', descripcion: 'Aftershave sensitive 100ml', tipo: 'venta' as const, precioVenta: 1800, costoCompra: 900, stockActual: 3, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 9 } },
  { id: 'prod-009', negocioId: NEGOCIO_ID, nombre: 'Oxidante en crema 20vol', descripcion: 'Oxidante para tintes 20 volúmenes', tipo: 'insumo' as const, costoCompra: 900, stockActual: 4, stockMinimo: 4, unidad: 'unidad', activo: true, proveedorId: 'prov-001', _count: { movimientos: 10 } },
  { id: 'prod-010', negocioId: NEGOCIO_ID, nombre: 'Crema de afeitar Barbería', descripcion: 'Crema profesional para afeitado en barra', tipo: 'insumo' as const, costoCompra: 1200, stockActual: 7, stockMinimo: 3, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 5 } },
  { id: 'prod-011', negocioId: NEGOCIO_ID, nombre: 'Talco para barbería', descripcion: 'Talco neutro para finalizar el corte', tipo: 'insumo' as const, costoCompra: 400, stockActual: 3, stockMinimo: 5, unidad: 'unidad', activo: true, proveedorId: 'prov-002', _count: { movimientos: 4 } },
  { id: 'prod-012', negocioId: NEGOCIO_ID, nombre: 'Máscara hidratante capilar', descripcion: 'Tratamiento intensivo de hidratación', tipo: 'insumo' as const, costoCompra: 2800, stockActual: 6, stockMinimo: 3, unidad: 'unidad', activo: true, proveedorId: 'prov-001', _count: { movimientos: 6 } },
];

export const movimientosStock = [
  { id: 'ms-001', productoId: 'prod-001', tipo: 'entrada' as const, cantidad: 5, stockAnterior: 0, stockNuevo: 5, motivo: 'Compra a proveedor', createdAt: dStr(-30) },
  { id: 'ms-002', productoId: 'prod-003', tipo: 'salida' as const, cantidad: 2, stockAnterior: 12, stockNuevo: 10, motivo: 'Venta', createdAt: dStr(-1) },
  { id: 'ms-003', productoId: 'prod-004', tipo: 'entrada' as const, cantidad: 10, stockAnterior: 5, stockNuevo: 15, motivo: 'Reposición', createdAt: dStr(-7) },
  { id: 'ms-004', productoId: 'prod-002', tipo: 'salida' as const, cantidad: 1, stockAnterior: 3, stockNuevo: 2, motivo: 'Uso en servicio de tintura', createdAt: dStr(-2) },
  { id: 'ms-005', productoId: 'prod-007', tipo: 'salida' as const, cantidad: 3, stockAnterior: 23, stockNuevo: 20, motivo: 'Uso en servicio de afeitado', createdAt: dStr(-1) },
  { id: 'ms-006', productoId: 'prod-009', tipo: 'entrada' as const, cantidad: 6, stockAnterior: 0, stockNuevo: 6, motivo: 'Compra a proveedor', createdAt: dStr(-14) },
  { id: 'ms-007', productoId: 'prod-009', tipo: 'salida' as const, cantidad: 2, stockAnterior: 6, stockNuevo: 4, motivo: 'Uso en servicio de tintura', createdAt: dStr(-3) },
  { id: 'ms-008', productoId: 'prod-012', tipo: 'entrada' as const, cantidad: 6, stockAnterior: 0, stockNuevo: 6, motivo: 'Compra a proveedor', createdAt: dStr(-20) },
];

// ── Insumos por Servicio ───────────────────────────────────────────────────────

export const insumosServicio = [
  { id: 'is-001', servicioId: 'srv-001', productoId: 'prod-007', cantidadPorServicio: 2, unidad: 'hoja' },   // Corte → Hojas
  { id: 'is-002', servicioId: 'srv-001', productoId: 'prod-011', cantidadPorServicio: 1, unidad: 'aplicación' }, // Corte → Talco
  { id: 'is-003', servicioId: 'srv-002', productoId: 'prod-007', cantidadPorServicio: 3, unidad: 'hoja' },   // Corte+barba → Hojas
  { id: 'is-004', servicioId: 'srv-002', productoId: 'prod-010', cantidadPorServicio: 1, unidad: 'aplicación' }, // Corte+barba → Crema
  { id: 'is-005', servicioId: 'srv-002', productoId: 'prod-011', cantidadPorServicio: 1, unidad: 'aplicación' }, // Corte+barba → Talco
  { id: 'is-006', servicioId: 'srv-003', productoId: 'prod-007', cantidadPorServicio: 5, unidad: 'hoja' },   // Afeitado → Hojas
  { id: 'is-007', servicioId: 'srv-003', productoId: 'prod-010', cantidadPorServicio: 2, unidad: 'aplicación' }, // Afeitado → Crema
  { id: 'is-008', servicioId: 'srv-004', productoId: 'prod-001', cantidadPorServicio: 1, unidad: 'unidad' },  // Tintura → Wella
  { id: 'is-009', servicioId: 'srv-004', productoId: 'prod-009', cantidadPorServicio: 1, unidad: 'unidad' },  // Tintura → Oxidante
  { id: 'is-010', servicioId: 'srv-005', productoId: 'prod-002', cantidadPorServicio: 1, unidad: 'unidad' },  // Rayitos → L'Oréal
  { id: 'is-011', servicioId: 'srv-005', productoId: 'prod-009', cantidadPorServicio: 1, unidad: 'unidad' },  // Rayitos → Oxidante
  { id: 'is-012', servicioId: 'srv-006', productoId: 'prod-012', cantidadPorServicio: 1, unidad: 'unidad' },  // Tratamiento → Máscara
  { id: 'is-013', servicioId: 'srv-007', productoId: 'prod-007', cantidadPorServicio: 1, unidad: 'hoja' },   // Corte niño → Hojas
  { id: 'is-014', servicioId: 'srv-007', productoId: 'prod-011', cantidadPorServicio: 1, unidad: 'aplicación' }, // Corte niño → Talco
];

// ── Fidelización ──────────────────────────────────────────────────────────────

export const membresias = [
  { id: 'mem-001', negocioId: NEGOCIO_ID, nombre: 'Básica', descripcion: '2 cortes por mes + 10% de descuento en servicios', precioMensual: 3500, beneficios: '2 cortes incluidos, 10% descuento', activa: true, _count: { clientes: 8 } },
  { id: 'mem-002', negocioId: NEGOCIO_ID, nombre: 'Premium', descripcion: '4 cortes por mes + 20% de descuento + 1 tratamiento capilar', precioMensual: 7000, beneficios: '4 cortes incluidos, 20% descuento, 1 tratamiento gratis', activa: true, _count: { clientes: 3 } },
];

export const cupones = [
  { id: 'cup-001', negocioId: NEGOCIO_ID, codigo: 'BIENVENIDO', descripcion: 'Descuento de bienvenida para nuevos clientes', tipoDescuento: 'porcentaje' as const, valor: 15, usosMax: undefined, usosActuales: 12, fechaDesde: dStr(-60), fechaHasta: dStr(30), activo: true },
  { id: 'cup-002', negocioId: NEGOCIO_ID, codigo: 'PROMO10', descripcion: 'Ahorro fijo en cualquier servicio', tipoDescuento: 'monto_fijo' as const, valor: 1000, usosMax: 50, usosActuales: 23, fechaDesde: dStr(-30), fechaHasta: dStr(15), activo: true },
  { id: 'cup-003', negocioId: NEGOCIO_ID, codigo: 'VIP20', descripcion: 'Descuento exclusivo para clientes VIP', tipoDescuento: 'porcentaje' as const, valor: 20, usosMax: 100, usosActuales: 5, fechaDesde: dStr(-10), fechaHasta: dStr(60), activo: true },
];

export const movimientosPuntos = [
  { id: 'mp-001', clienteId: 'cli-001', tipo: 'acumulacion', puntos: 150, descripcion: 'Visita - Corte + barba', createdAt: dStr(-2) },
  { id: 'mp-002', clienteId: 'cli-004', tipo: 'acumulacion', puntos: 220, descripcion: 'Visita - Tintura completa', createdAt: dStr(-3) },
  { id: 'mp-003', clienteId: 'cli-006', tipo: 'acumulacion', puntos: 150, descripcion: 'Visita - Corte clásico', createdAt: dStr(-4) },
  { id: 'mp-004', clienteId: 'cli-004', tipo: 'canje', puntos: -500, descripcion: 'Canje por descuento $500', createdAt: dStr(-5) },
  { id: 'mp-005', clienteId: 'cli-001', tipo: 'acumulacion', puntos: 100, descripcion: 'Visita - Corte clásico', createdAt: dStr(-7) },
  { id: 'mp-006', clienteId: 'cli-009', tipo: 'acumulacion', puntos: 150, descripcion: 'Visita - Corte + barba', createdAt: dStr(-8) },
  { id: 'mp-007', clienteId: 'cli-011', tipo: 'acumulacion', puntos: 120, descripcion: 'Visita - Afeitado con navaja', createdAt: dStr(-10) },
];

// ── ID counter ────────────────────────────────────────────────────────────────

let _counter = 100;
export function nextId(prefix: string): string {
  return `${prefix}-${++_counter}`;
}
