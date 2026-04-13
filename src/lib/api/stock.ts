import { api } from '../api-client';

// Productos
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
  proveedor?: {
    id: string;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
  };
  movimientos?: any[];
  _count?: {
    movimientos: number;
  };
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

export async function getProductos(token: string, filters?: {
  tipo?: string;
  bajoStock?: string;
}): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (filters?.tipo) params.append('tipo', filters.tipo);
  if (filters?.bajoStock) params.append('bajoStock', filters.bajoStock);

  const query = params.toString();
  return api.get<Producto[]>(`/stock/productos${query ? `?${query}` : ''}`, token);
}

export async function getProductosBajoStock(token: string): Promise<Producto[]> {
  return api.get<Producto[]>('/stock/productos/bajo-stock', token);
}

export async function getProducto(id: string, token: string): Promise<Producto> {
  return api.get<Producto>(`/stock/productos/${id}`, token);
}

export async function createProducto(data: CreateProducto, token: string): Promise<Producto> {
  return api.post<Producto>('/stock/productos', data, token);
}

export async function updateProducto(id: string, data: Partial<CreateProducto>, token: string): Promise<Producto> {
  return api.patch<Producto>(`/stock/productos/${id}`, data, token);
}

export async function deleteProducto(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/stock/productos/${id}`, token);
}

// Movimientos de Stock
export interface CreateMovimientoStock {
  productoId: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo?: string;
  referenciaId?: string;
}

export async function getMovimientosStock(token: string, filters?: {
  productoId?: string;
  tipo?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.productoId) params.append('productoId', filters.productoId);
  if (filters?.tipo) params.append('tipo', filters.tipo);

  const query = params.toString();
  return api.get<any[]>(`/stock/movimientos${query ? `?${query}` : ''}`, token);
}

export async function createMovimientoStock(data: CreateMovimientoStock, token: string): Promise<Producto> {
  return api.post<Producto>('/stock/movimientos', data, token);
}

// Proveedores
export interface Proveedor {
  id: string;
  negocioId: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  _count?: {
    productos: number;
  };
}

export async function getProveedores(token: string): Promise<Proveedor[]> {
  return api.get<Proveedor[]>('/stock/proveedores', token);
}

export async function getProveedor(id: string, token: string): Promise<Proveedor> {
  return api.get<Proveedor>(`/stock/proveedores/${id}`, token);
}

export async function createProveedor(data: {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  notas?: string;
}, token: string): Promise<Proveedor> {
  return api.post<Proveedor>('/stock/proveedores', data, token);
}

export async function updateProveedor(id: string, data: {
  nombre?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  notas?: string;
}, token: string): Promise<Proveedor> {
  return api.patch<Proveedor>(`/stock/proveedores/${id}`, data, token);
}

export async function deleteProveedor(id: string, token: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/stock/proveedores/${id}`, token);
}
