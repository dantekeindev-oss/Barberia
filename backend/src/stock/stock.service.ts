import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto, ProductoTipo } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import {
  CreateMovimientoStockDto,
  MovimientoStockTipo,
} from './dto/movimiento-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createProducto(createProductoDto: CreateProductoDto, negocioId: string) {
    // If proveedorId is provided, verify it exists
    if (createProductoDto.proveedorId) {
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: createProductoDto.proveedorId },
      });

      if (!proveedor || proveedor.negocioId !== negocioId) {
        throw new NotFoundException('Proveedor no encontrado');
      }
    }

    return this.prisma.producto.create({
      data: {
        ...createProductoDto,
        negocioId,
        activo: createProductoDto.activo !== undefined ? createProductoDto.activo : true,
        unidad: createProductoDto.unidad || 'unidad',
      },
    });
  }

  async findAllProductos(negocioId: string, filters?: { tipo?: string; bajoStock?: string }) {
    const where: any = { negocioId };

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.bajoStock === 'true') {
      where.stockActual = { lte: this.prisma.producto.fields.stockMinimo };
    }

    return this.prisma.producto.findMany({
      where,
      include: {
        proveedor: true,
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { movimientos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneProducto(id: string, negocioId: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        proveedor: true,
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        insumos: {
          include: {
            servicio: true,
          },
        },
        _count: {
          select: { movimientos: true },
        },
      },
    });

    if (!producto || producto.negocioId !== negocioId) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async updateProducto(id: string, updateProductoDto: UpdateProductoDto, negocioId: string) {
    await this.findOneProducto(id, negocioId);

    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
    });
  }

  async removeProducto(id: string, negocioId: string) {
    await this.findOneProducto(id, negocioId);

    await this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Producto desactivado exitosamente' };
  }

  // Movimientos de Stock
  async createMovimiento(
    createMovimientoDto: CreateMovimientoStockDto,
    negocioId: string,
    userId?: string,
  ) {
    const producto = await this.prisma.producto.findUnique({
      where: { id: createMovimientoDto.productoId },
    });

    if (!producto || producto.negocioId !== negocioId) {
      throw new NotFoundException('Producto no encontrado');
    }

    const stockAnterior = Number(producto.stockActual);
    let stockNuevo: number;
    const cantidad = Math.abs(createMovimientoDto.cantidad);

    switch (createMovimientoDto.tipo) {
      case MovimientoStockTipo.ENTRADA:
        stockNuevo = stockAnterior + cantidad;
        break;
      case MovimientoStockTipo.SALIDA:
        if (stockAnterior < cantidad) {
          throw new BadRequestException('Stock insuficiente');
        }
        stockNuevo = stockAnterior - cantidad;
        break;
      case MovimientoStockTipo.AJUSTE:
        stockNuevo = cantidad;
        break;
    }

    await this.prisma.$transaction([
      // Update producto stock
      this.prisma.producto.update({
        where: { id: createMovimientoDto.productoId },
        data: { stockActual: stockNuevo },
      }),
      // Create movimiento
      this.prisma.movimientoStock.create({
        data: {
          productoId: createMovimientoDto.productoId,
          tipo: createMovimientoDto.tipo,
          cantidad: createMovimientoDto.tipo === MovimientoStockTipo.AJUSTE
            ? stockNuevo - stockAnterior
            : cantidad,
          stockAnterior,
          stockNuevo,
          motivo: createMovimientoDto.motivo,
          referenciaId: createMovimientoDto.referenciaId,
          createdBy: userId,
        },
      }),
    ]);

    return this.findOneProducto(createMovimientoDto.productoId, negocioId);
  }

  async findAllMovimientos(negocioId: string, filters?: { productoId?: string; tipo?: string }) {
    const where: any = {
      producto: { negocioId },
    };

    if (filters?.productoId) {
      where.productoId = filters.productoId;
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    return this.prisma.movimientoStock.findMany({
      where,
      include: {
        producto: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getProductosBajoStock(negocioId: string) {
    return this.prisma.producto.findMany({
      where: {
        negocioId,
        activo: true,
        stockActual: { lte: this.prisma.producto.fields.stockMinimo },
      },
      orderBy: [
        { stockActual: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  // Proveedores
  async createProveedor(
    nombre: string,
    negocioId: string,
    datos?: {
      contacto?: string;
      telefono?: string;
      email?: string;
      notas?: string;
    },
  ) {
    return this.prisma.proveedor.create({
      data: {
        negocioId,
        nombre,
        ...datos,
      },
    });
  }

  async findAllProveedores(negocioId: string) {
    return this.prisma.proveedor.findMany({
      where: { negocioId },
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneProveedor(id: string, negocioId: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        productos: {
          where: { activo: true },
        },
      },
    });

    if (!proveedor || proveedor.negocioId !== negocioId) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return proveedor;
  }

  async updateProveedor(
    id: string,
    data: { nombre?: string; contacto?: string; telefono?: string; email?: string; notas?: string },
    negocioId: string,
  ) {
    await this.findOneProveedor(id, negocioId);

    return this.prisma.proveedor.update({
      where: { id },
      data,
    });
  }

  async removeProveedor(id: string, negocioId: string) {
    await this.findOneProveedor(id, negocioId);

    await this.prisma.proveedor.delete({
      where: { id },
    });

    return { message: 'Proveedor eliminado exitosamente' };
  }
}
