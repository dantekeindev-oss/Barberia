import { cajas as _cajas, ventas as _ventas, movimientosCaja as _movimientos, NEGOCIO_ID, nextId } from '../mock/data';

export interface Caja {
  id: string;
  negocioId: string;
  fecha: string;
  usuarioAperturaId?: string;
  montoInicial: number;
  estado: 'abierta' | 'cerrada';
  montoContadoCierre?: number;
  montoSistemaCierre?: number;
  diferencia?: number;
  observacionesCierre?: string;
  abiertaAt: string;
  cerradaAt?: string;
}

export interface AbrirCaja { montoInicial: number }
export interface CerrarCaja { montoContadoCierre: number; observacionesCierre?: string }

export interface Venta {
  id: string;
  cajaId: string;
  negocioId: string;
  clienteId?: string;
  turnoId?: string;
  tipo: 'servicio' | 'producto' | 'mixta';
  subtotal: number;
  descuento: number;
  total: number;
  createdAt: string;
  items: { id: string; tipo: string; referenciaId: string; descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  pagos: { id: string; medioPago: string; monto: number; referenciaExterna?: string }[];
}

export interface CreateVenta {
  cajaId: string;
  tipo: Venta['tipo'];
  clienteId?: string;
  turnoId?: string;
  subtotal: number;
  descuento: number;
  total: number;
  cuponIds?: string[];
  items: { tipo: 'servicio' | 'producto'; referenciaId: string; descripcion: string; cantidad: number; precioUnitario: number }[];
  pagos: { medioPago: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr' | 'otro'; monto: number; referenciaExterna?: string }[];
}

export interface MovimientoCaja {
  id: string;
  cajaId: string;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  descripcion?: string;
  monto: number;
  medioPago?: string;
  createdAt: string;
}

export async function getCajaActual(_token: string): Promise<Caja & { ventas: Venta[]; movimientos: MovimientoCaja[]; resumen: unknown }> {
  await delay(300);
  const caja = _cajas.find(c => c.estado === 'abierta') ?? _cajas[0];
  const ventasHoy = _ventas.filter(v => v.cajaId === caja.id);
  const movsHoy = _movimientos.filter(m => m.cajaId === caja.id);
  const totalVentas = ventasHoy.reduce((s, v) => s + v.total, 0);
  const totalIngresos = movsHoy.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = movsHoy.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
  return {
    ...(caja as Caja),
    ventas: ventasHoy as Venta[],
    movimientos: movsHoy as MovimientoCaja[],
    resumen: { totalVentas, totalIngresos, totalEgresos, saldoActual: (caja.montoInicial + totalVentas + totalIngresos) - totalEgresos },
  };
}

export async function abrirCaja(data: AbrirCaja, _token: string): Promise<Caja> {
  await delay(300);
  const nueva: Caja = {
    id: nextId('caj'), negocioId: NEGOCIO_ID,
    fecha: new Date().toISOString().split('T')[0],
    usuarioAperturaId: 'usr-001',
    montoInicial: data.montoInicial, estado: 'abierta',
    abiertaAt: new Date().toISOString(),
  };
  _cajas.push(nueva as typeof _cajas[0]);
  return nueva;
}

export async function cerrarCaja(id: string, data: CerrarCaja, _token: string): Promise<Caja> {
  await delay(300);
  const idx = _cajas.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Caja no encontrada');
  const ventasCaja = _ventas.filter(v => v.cajaId === id);
  const totalSistema = ventasCaja.reduce((s, v) => s + v.total, 0) + _cajas[idx].montoInicial;
  Object.assign(_cajas[idx], {
    estado: 'cerrada', montoContadoCierre: data.montoContadoCierre,
    montoSistemaCierre: totalSistema, diferencia: data.montoContadoCierre - totalSistema,
    observacionesCierre: data.observacionesCierre, cerradaAt: new Date().toISOString(),
  });
  return _cajas[idx] as Caja;
}

export async function getCajas(_token: string, _filters?: { fechaInicio?: string; fechaFin?: string }): Promise<Caja[]> {
  await delay(200);
  return [..._cajas].reverse() as Caja[];
}

export async function getCaja(id: string, _token: string): Promise<Caja> {
  await delay(150);
  const c = _cajas.find(c => c.id === id);
  if (!c) throw new Error('Caja no encontrada');
  return c as Caja;
}

export async function getReporteDiario(_token: string, _fecha?: string) {
  await delay(200);
  const totalVentas = _ventas.reduce((s, v) => s + v.total, 0);
  return { totalVentas, cantidadVentas: _ventas.length, ventasPorTipo: { servicio: 3, producto: 1 } };
}

export async function getVentas(_token: string, filters?: { fechaInicio?: string; fechaFin?: string; tipo?: Venta['tipo']; clienteId?: string }): Promise<Venta[]> {
  await delay(250);
  let result = [..._ventas];
  if (filters?.tipo) result = result.filter(v => v.tipo === filters.tipo);
  if (filters?.clienteId) result = result.filter(v => v.clienteId === filters.clienteId);
  return result as Venta[];
}

export async function getVenta(id: string, _token: string): Promise<Venta> {
  await delay(150);
  const v = _ventas.find(v => v.id === id);
  if (!v) throw new Error('Venta no encontrada');
  return v as Venta;
}

export async function createVenta(data: CreateVenta, _token: string): Promise<Venta> {
  await delay(300);
  const nueva: Venta = {
    id: nextId('ven'), cajaId: data.cajaId, negocioId: NEGOCIO_ID,
    clienteId: data.clienteId, turnoId: data.turnoId,
    tipo: data.tipo, subtotal: data.subtotal, descuento: data.descuento, total: data.total,
    createdAt: new Date().toISOString(),
    items: data.items.map((item, i) => ({ id: nextId('vi'), ...item, subtotal: item.cantidad * item.precioUnitario })),
    pagos: data.pagos.map((p, i) => ({ id: nextId('pag'), ...p })),
  };
  _ventas.push(nueva as typeof _ventas[0]);
  return nueva;
}

export async function getMovimientosCaja(_token: string, filters?: { cajaId?: string; fechaInicio?: string; fechaFin?: string }): Promise<MovimientoCaja[]> {
  await delay(200);
  let result = [..._movimientos];
  if (filters?.cajaId) result = result.filter(m => m.cajaId === filters.cajaId);
  return result as MovimientoCaja[];
}

export async function createMovimiento(data: { cajaId: string; tipo: 'ingreso' | 'egreso'; concepto: string; descripcion?: string; monto: number; medioPago?: string }, _token: string): Promise<MovimientoCaja> {
  await delay(250);
  const nuevo: MovimientoCaja = { id: nextId('mov'), ...data, createdAt: new Date().toISOString() };
  _movimientos.push(nuevo as typeof _movimientos[0]);
  return nuevo;
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
