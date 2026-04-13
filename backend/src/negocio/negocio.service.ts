import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';

@Injectable()
export class NegocioService {
  constructor(private prisma: PrismaService) {}

  async create(createNegocioDto: CreateNegocioDto) {
    return this.prisma.negocio.create({
      data: {
        ...createNegocioDto,
        timezone: createNegocioDto.timezone || 'America/Argentina/Buenos_Aires',
        configuracion: createNegocioDto.configuracion
          ? JSON.stringify(createNegocioDto.configuracion)
          : null,
      },
    });
  }

  async findAll() {
    return this.prisma.negocio.findMany({
      include: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            empleados: true,
            turnos: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            empleados: true,
            turnos: true,
            ventas: true,
          },
        },
      },
    });

    if (!negocio) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return negocio;
  }

  async update(id: string, updateNegocioDto: UpdateNegocioDto) {
    await this.findOne(id);

    const data: any = { ...updateNegocioDto };
    if (updateNegocioDto.configuracion) {
      data.configuracion = JSON.stringify(updateNegocioDto.configuracion);
    }

    return this.prisma.negocio.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if negocio has data before deleting
    const counts = await this.prisma.negocio.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            turnos: true,
          },
        },
      },
    });

    const hasData =
      counts!._count.usuarios > 0 ||
      counts!._count.clientes > 0 ||
      counts!._count.turnos > 0;

    if (hasData) {
      throw new Error(
        'No se puede eliminar un negocio con datos. Desactívelo en su lugar.',
      );
    }

    await this.prisma.negocio.delete({
      where: { id },
    });

    return { message: 'Negocio eliminado exitosamente' };
  }

  async getDashboardData(negocioId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalClientes,
      totalEmpleados,
      totalServicios,
      turnosHoy,
      ventasHoy,
      proximosTurnos,
    ] = await Promise.all([
      this.prisma.cliente.count({ where: { negocioId } }),
      this.prisma.empleado.count({ where: { negocioId, activo: true } }),
      this.prisma.servicio.count({ where: { negocioId, activo: true } }),
      this.prisma.turno.count({
        where: {
          negocioId,
          fechaInicio: { gte: today },
        },
      }),
      this.prisma.venta.aggregate({
        where: {
          negocioId,
          createdAt: { gte: today },
        },
        _sum: { total: true },
      }),
      this.prisma.turno.findMany({
        where: {
          negocioId,
          fechaInicio: { gte: today },
          estado: { in: ['pendiente', 'confirmado'] },
        },
        include: {
          cliente: true,
          empleado: true,
          servicios: {
            include: { servicio: true },
          },
        },
        orderBy: { fechaInicio: 'asc' },
        take: 10,
      }),
    ]);

    const facturadoHoy = ventasHoy._sum.total || 0;

    // Get clientes with low points
    const clientesBajoPuntos = await this.prisma.cliente.findMany({
      where: {
        negocioId,
        puntosAcumulados: { lt: 50 },
      },
      orderBy: { puntosAcumulados: 'asc' },
      take: 5,
    });

    // Get productos bajo stock
    const productosBajoStock = await this.prisma.producto.findMany({
      where: {
        negocioId,
        activo: true,
        stockActual: { lte: this.prisma.producto.fields.stockMinimo },
      },
      orderBy: { stockActual: 'asc' },
      take: 5,
    });

    return {
      resumen: {
        totalClientes,
        totalEmpleados,
        totalServicios,
        turnosHoy,
        facturadoHoy,
      },
      proximosTurnos,
      alertas: {
        clientesBajoPuntos,
        productosBajoStock,
      },
    };
  }
}
