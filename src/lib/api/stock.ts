import { productos as _productos, proveedores as _proveedores, movimientosStock as _movimientos, insumosServicio as _insumosServicio, servicios, NEGOCIO_ID, nextId } from '../mock/data';

export interface Producto {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  tipo: 'venta' | 'insumo';
  precioVenta?: number;
  costoCompra: number;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  activo: boolean;
  proveedorId?: string;
  proveedor?: { id: string; nombre: string; contacto?: string; telefono?: string; email?: string };
  movimientos?: unknown[];
  _count?: { movimientos: number };
}

export interface CreateProducto {
  nombre: string;
  descripcion?: string;
  tipo: Producto['tipo'];
  precioVenta?: number;
  costoCompra: number;
  stockActual: number;
  stockMinimo?: number;
  unidad?: string;
  activo?: boolean;
  proveedorId?: string;
}

export interface CreateMovimientoStock {
  productoId: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo?: string;
  referenciaId?: string;
}

export interface Proveedor {
  id: string;
  negocioId: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  _count?: { productos: number };
}

function withProveedor(p: typeof _productos[0]): Producto {
  const prov = p.proveedorId ? _proveedores.find(pr => pr.id === p.proveedorId) : undefined;
  return { ...(p as Producto), proveedor: prov ? { id: prov.id, nombre: prov.nombre, contacto: prov.contacto, telefono: prov.telefono, email: prov.email } : undefined };
}

export async function getProductos(_token: string, filters?: { tipo?: string; bajoStock?: string }): Promise<Producto[]> {
  await delay(250);
  let result = [..._productos];
  if (filters?.tipo) result = result.filter(p => p.tipo === filters.tipo);
  if (filters?.bajoStock === 'true') result = result.filter(p => p.stockActual <= p.stockMinimo);
  return result.map(withProveedor);
}

export async function getProductosBajoStock(_token: string): Promise<Producto[]> {
  await delay(200);
  return _productos.filter(p => p.stockActual <= p.stockMinimo).map(withProveedor);
}

export async function getProducto(id: string, _token: string): Promise<Producto> {
  await delay(150);
  const p = _productos.find(p => p.id === id);
  if (!p) throw new Error('Producto no encontrado');
  return withProveedor(p);
}

export async function createProducto(data: CreateProducto, _token: string): Promise<Producto> {
  await delay(300);
  const nuevo = {
    id: nextId('prod'), negocioId: NEGOCIO_ID,
    nombre: data.nombre, descripcion: data.descripcion,
    tipo: data.tipo, precioVenta: data.precioVenta, costoCompra: data.costoCompra,
    stockActual: data.stockActual, stockMinimo: data.stockMinimo ?? 0,
    unidad: data.unidad ?? 'unidad', activo: data.activo ?? true,
    proveedorId: data.proveedorId, _count: { movimientos: 0 },
  };
  _productos.push(nuevo as typeof _productos[0]);
  return withProveedor(nuevo as typeof _productos[0]);
}

export async function updateProducto(id: string, data: Partial<CreateProducto>, _token: string): Promise<Producto> {
  await delay(250);
  const idx = _productos.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado');
  Object.assign(_productos[idx], data);
  return withProveedor(_productos[idx]);
}

export async function deleteProducto(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _productos.findIndex(p => p.id === id);
  if (idx !== -1) _productos.splice(idx, 1);
  return { message: 'Producto eliminado' };
}

export interface InsumoServicio {
  id: string;
  servicioId: string;
  productoId: string;
  cantidadPorServicio: number;
  unidad: string;
  servicio?: { id: string; nombre: string; colorAgenda: string };
  producto?: { id: string; nombre: string; unidad: string };
}

export async function getMovimientosStock(_token: string, filters?: { productoId?: string; tipo?: string }): Promise<unknown[]> {
  await delay(200);
  let result = [..._movimientos];
  if (filters?.productoId) result = result.filter(m => m.productoId === filters.productoId);
  if (filters?.tipo) result = result.filter(m => m.tipo === filters.tipo);
  return result.map(m => {
    const prod = _productos.find(p => p.id === m.productoId);
    return { ...m, fecha: m.createdAt, producto: prod ? { nombre: prod.nombre, unidad: prod.unidad } : undefined };
  });
}

export async function getInsumosServicio(_token: string, filters?: { servicioId?: string; productoId?: string }): Promise<InsumoServicio[]> {
  await delay(150);
  let result = [..._insumosServicio];
  if (filters?.servicioId) result = result.filter(i => i.servicioId === filters.servicioId);
  if (filters?.productoId) result = result.filter(i => i.productoId === filters.productoId);
  return result.map(i => {
    const srv = servicios.find(s => s.id === i.servicioId);
    const prod = _productos.find(p => p.id === i.productoId);
    return {
      ...i,
      servicio: srv ? { id: srv.id, nombre: srv.nombre, colorAgenda: srv.colorAgenda } : undefined,
      producto: prod ? { id: prod.id, nombre: prod.nombre, unidad: prod.unidad } : undefined,
    };
  });
}

export async function createMovimientoStock(data: CreateMovimientoStock, _token: string): Promise<Producto> {
  await delay(250);
  const idx = _productos.findIndex(p => p.id === data.productoId);
  if (idx === -1) throw new Error('Producto no encontrado');
  const anterior = _productos[idx].stockActual;
  if (data.tipo === 'entrada') _productos[idx].stockActual += data.cantidad;
  else if (data.tipo === 'salida') _productos[idx].stockActual -= data.cantidad;
  else _productos[idx].stockActual = data.cantidad;
  _movimientos.push({ id: nextId('ms'), productoId: data.productoId, tipo: data.tipo, cantidad: data.cantidad, stockAnterior: anterior, stockNuevo: _productos[idx].stockActual, motivo: data.motivo ?? '', createdAt: new Date().toISOString() } as typeof _movimientos[0]);
  return withProveedor(_productos[idx]);
}

export async function getProveedores(_token: string): Promise<Proveedor[]> {
  await delay(200);
  return [..._proveedores] as Proveedor[];
}

export async function getProveedor(id: string, _token: string): Promise<Proveedor> {
  await delay(150);
  const p = _proveedores.find(p => p.id === id);
  if (!p) throw new Error('Proveedor no encontrado');
  return p as Proveedor;
}

export async function createProveedor(data: { nombre: string; contacto?: string; telefono?: string; email?: string; notas?: string }, _token: string): Promise<Proveedor> {
  await delay(300);
  const nuevo = { id: nextId('prov'), negocioId: NEGOCIO_ID, ...data, _count: { productos: 0 } };
  _proveedores.push(nuevo as typeof _proveedores[0]);
  return nuevo as Proveedor;
}

export async function updateProveedor(id: string, data: { nombre?: string; contacto?: string; telefono?: string; email?: string; notas?: string }, _token: string): Promise<Proveedor> {
  await delay(250);
  const idx = _proveedores.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Proveedor no encontrado');
  Object.assign(_proveedores[idx], data);
  return _proveedores[idx] as Proveedor;
}

export async function deleteProveedor(id: string, _token: string): Promise<{ message: string }> {
  await delay(200);
  const idx = _proveedores.findIndex(p => p.id === id);
  if (idx !== -1) _proveedores.splice(idx, 1);
  return { message: 'Proveedor eliminado' };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
