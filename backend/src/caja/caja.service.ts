import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirCajaDto, CerrarCajaDto } from './dto/caja.dto';
import { CreateVentaDto, VentaTipo } from './dto/venta.dto';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  // Caja
  async abrirCaja(abrirCajaDto: AbrirCajaDto, negocioId: string, usuarioId: string) {
    // Check if there's already an open caja for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingOpen = await this.prisma.caja.findFirst({
      where: {
        negocioId,
        fecha: today,
        estado: 'abierta',
      },
    });

    if (existingOpen) {
      throw new BadRequestException('Ya hay una caja abierta para hoy');
    }

    return this.prisma.caja.create({
      data: {
        negocioId,
        fecha: today,
        usuarioAperturaId: usuarioId,
        montoInicial: abrirCajaDto.montoInicial,
        estado: 'abierta',
      },
    });
  }

  async getCajaActual(negocioId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const caja = await this.prisma.caja.findFirst({
      where: {
        negocioId,
        fecha: today,
        estado: 'abierta',
      },
      include: {
        ventas: {
          include: {
            items: true,
            pagos: true,
          },
        },
        movimientos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!caja) {
      throw new NotFoundException('No hay caja abierta para hoy');
    }

    // Calculate totals
    const totalVentas = caja.ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalIngresos = caja.movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + Number(m.monto), 0);
    const totalEgresos = caja.movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    return {
      ...caja,
      resumen: {
        totalVentas,
        totalIngresos,
        totalEgresos,
        montoEsperado: Number(caja.montoInicial) + totalVentas + totalIngresos - totalEgresos,
      },
    };
  }

  async cerrarCaja(cajaId: string, cerrarCajaDto: CerrarCajaDto, negocioId: string) {
    const caja = await this.prisma.caja.findUnique({
      where: { id: cajaId },
      include: {
        ventas: true,
        movimientos: true,
      },
    });

    if (!caja || caja.negocioId !== negocioId) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (caja.estado !== 'abierta') {
      throw new BadRequestException('La caja ya está cerrada');
    }

    const totalVentas = caja.ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalIngresos = caja.movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + Number(m.monto), 0);
    const totalEgresos = caja.movimientos
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const montoSistemaCierre = Number(caja.montoInicial) + totalVentas + totalIngresos - totalEgresos;
    const diferencia = cerrarCajaDto.montoContadoCierre - montoSistemaCierre;

    return this.prisma.caja.update({
      where: { id: cajaId },
      data: {
        estado: 'cerrada',
        montoContadoCierre: cerrarCajaDto.montoContadoCierre,
        montoSistemaCierre,
        diferencia,
        observacionesCierre: cerrarCajaDto.observacionesCierre,
        cerradaAt: new Date(),
      },
    });
  }

  async findAllCajas(negocioId: string, filters?: { fechaInicio?: string; fechaFin?: string }) {
    const where: any = { negocioId };

    if (filters?.fechaInicio || filters?.fechaFin) {
      where.fecha = {};
      if (filters.fechaInicio) where.fecha.gte = new Date(filters.fechaInicio);
      if (filters.fechaFin) where.fecha.lte = new Date(filters.fechaFin);
    }

    return this.prisma.caja.findMany({
      where,
      include: {
        _count: {
          select: { ventas: true, movimientos: true },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOneCaja(id: string, negocioId: string) {
    const caja = await this.prisma.caja.findUnique({
      where: { id },
      include: {
        ventas: {
          include: {
            cliente: true,
            turnos: true,
            items: true,
            pagos: true,
          },
        },
        movimientos: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!caja || caja.negocioId !== negocioId) {
      throw new NotFoundException('Caja no encontrada');
    }

    return caja;
  }

  // Ventas
  async createVenta(createVentaDto: CreateVentaDto, negocioId: string, usuarioId?: string) {
    // Verify caja exists and is open
    const caja = await this.prisma.caja.findUnique({
      where: { id: createVentaDto.cajaId },
    });

    if (!caja || caja.negocioId !== negocioId) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (caja.estado !== 'abierta') {
      throw new BadRequestException('La caja está cerrada');
    }

    // Verify cliente if provided
    if (createVentaDto.clienteId) {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: createVentaDto.clienteId },
      });

      if (!cliente || cliente.negocioId !== negocioId) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }

    // Verify turno if provided
    if (createVentaDto.turnoId) {
      const turno = await this.prisma.turno.findUnique({
        where: { id: createVentaDto.turnoId },
      });

      if (!turno || turno.negocioId !== negocioId) {
        throw new NotFoundException('Turno no encontrado');
      }
    }

    // Validate total matches items
    const itemsTotal = createVentaDto.items.reduce(
      (sum, item) => sum + item.cantidad * item.precioUnitario,
      0,
    );

    if (itemsTotal - createVentaDto.descuento !== createVentaDto.total) {
      throw new BadRequestException('El total no coincide con los items menos el descuento');
    }

    // Validate payments total
    const pagosTotal = createVentaDto.pagos.reduce((sum, pago) => sum + pago.monto, 0);
    if (pagosTotal !== createVentaDto.total) {
      throw new BadRequestException('El total de pagos no coincide con el total de la venta');
    }

    // Create venta
    const venta = await this.prisma.venta.create({
      data: {
        cajaId: createVentaDto.cajaId,
        negocioId,
        clienteId: createVentaDto.clienteId,
        turnoId: createVentaDto.turnoId,
        tipo: createVentaDto.tipo,
        subtotal: createVentaDto.subtotal,
        descuento: createVentaDto.descuento,
        total: createVentaDto.total,
        createdBy: usuarioId,
        items: {
          create: createVentaDto.items.map((item) => ({
            tipo: item.tipo,
            referenciaId: item.referenciaId,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })),
        },
        pagos: {
          create: createVentaDto.pagos.map((pago) => ({
            medioPago: pago.medioPago,
            monto: pago.monto,
            referenciaExterna: pago.referenciaExterna,
          })),
        },
      },
    });

    // If it's a product sale, update stock
    for (const item of createVentaDto.items) {
      if (item.tipo === 'producto') {
        await this.prisma.movimientoStock.create({
          data: {
            productoId: item.referenciaId,
            tipo: 'salida',
            cantidad: item.cantidad,
            motivo: `Venta #${venta.id}`,
            referenciaId: venta.id,
            createdBy: usuarioId,
          },
        });

        // Update product stock
        const producto = await this.prisma.producto.findUnique({
          where: { id: item.referenciaId },
        });
        if (producto) {
          await this.prisma.producto.update({
            where: { id: item.referenciaId },
            data: { stockActual: Number(producto.stockActual) - item.cantidad },
          });
        }
      }
    }

    return this.findOneVenta(venta.id, negocioId);
  }

  async findOneVenta(id: string, negocioId: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        caja: true,
        cliente: true,
        turnos: true,
        items: true,
        pagos: true,
      },
    });

    if (!venta || venta.negocioId !== negocioId) {
      throw new NotFoundException('Venta no encontrada');
    }

    return venta;
  }

  async findAllVentas(negocioId: string, filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: VentaTipo;
    clienteId?: string;
  }) {
    const where: any = { negocioId };

    if (filters?.fechaInicio || filters?.fechaFin) {
      where.createdAt = {};
      if (filters.fechaInicio) where.createdAt.gte = new Date(filters.fechaInicio);
      if (filters.fechaFin) where.createdAt.lte = new Date(filters.fechaFin);
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.clienteId) {
      where.clienteId = filters.clienteId;
    }

    return this.prisma.venta.findMany({
      where,
      include: {
        caja: true,
        cliente: true,
        turnos: true,
        items: true,
        pagos: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Movimientos de Caja
  async createMovimiento(
    data: {
      cajaId: string;
      tipo: 'ingreso' | 'egreso';
      concepto: string;
      monto: number;
      medioPago?: string;
    },
    negocioId: string,
    usuarioId?: string,
  ) {
    const caja = await this.prisma.caja.findUnique({
      where: { id: data.cajaId },
    });

    if (!caja || caja.negocioId !== negocioId) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (caja.estado !== 'abierta') {
      throw new BadRequestException('La caja está cerrada');
    }

    return this.prisma.movimientoCaja.create({
      data: {
        cajaId: data.cajaId,
        negocioId,
        tipo: data.tipo,
        concepto: data.concepto,
        monto: data.monto,
        medioPago: data.medioPago,
        createdBy: usuarioId,
      },
    });
  }

  async getReporteDiario(negocioId: string, fecha?: string) {
    const date = fecha ? new Date(fecha) : new Date();
    date.setHours(0, 0, 0, 0);

    const cajas = await this.prisma.caja.findMany({
      where: {
        negocioId,
        fecha: date,
      },
      include: {
        ventas: {
          include: { items: true, pagos: true },
        },
        movimientos: true,
      },
    });

    if (cajas.length === 0) {
      return { fecha: date, totalVentas: 0, totalIngresos: 0, totalEgresos: 0, cajas: [] };
    }

    const totalVentas = cajas.reduce((sum, c) => sum + c.ventas.reduce((s, v) => s + Number(v.total), 0), 0);
    const totalIngresos = cajas.reduce(
      (sum, c) => sum + c.movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0),
      0,
    );
    const totalEgresos = cajas.reduce(
      (sum, c) => sum + c.movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + Number(m.monto), 0),
      0,
    );

    return {
      fecha: date,
      totalVentas,
      totalIngresos,
      totalEgresos,
      neto: totalVentas + totalIngresos - totalEgresos,
      cajas,
    };
  }
}
