import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto, TurnoEstado } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@Injectable()
export class TurnosService {
  constructor(private prisma: PrismaService) {}

  async create(createTurnoDto: CreateTurnoDto, negocioId: string) {
    // Verify cliente belongs to negocio
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createTurnoDto.clienteId },
    });

    if (!cliente || cliente.negocioId !== negocioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verify empleado belongs to negocio
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: createTurnoDto.empleadoId },
    });

    if (!empleado || empleado.negocioId !== negocioId) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Verify servicios and get prices
    const servicios = await this.prisma.servicio.findMany({
      where: {
        id: { in: createTurnoDto.servicioIds },
        negocioId,
        activo: true,
      },
    });

    if (servicios.length !== createTurnoDto.servicioIds.length) {
      throw new NotFoundException('Algunos servicios no fueron encontrados');
    }

    // Create turno
    const turno = await this.prisma.turno.create({
      data: {
        negocioId,
        clienteId: createTurnoDto.clienteId,
        empleadoId: createTurnoDto.empleadoId,
        fechaInicio: createTurnoDto.fechaInicio,
        fechaFin: createTurnoDto.fechaFin,
        estado: createTurnoDto.estado || TurnoEstado.PENDIENTE,
        origen: createTurnoDto.origen || 'presencial',
        notas: createTurnoDto.notas,
        servicios: {
          create: servicios.map((s) => ({
            servicioId: s.id,
            precioAplicado: s.precio,
            duracionAplicada: s.duracionMin,
          })),
        },
      },
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
    });

    return turno;
  }

  async findAll(negocioId: string, filters?: { fechaInicio?: Date; fechaFin?: Date; empleadoId?: string; estado?: string }) {
    const where: any = { negocioId };

    if (filters?.fechaInicio || filters?.fechaFin) {
      where.fechaInicio = {};
      if (filters.fechaInicio) where.fechaInicio.gte = filters.fechaInicio;
      if (filters.fechaFin) where.fechaFin.lte = filters.fechaFin;
    }

    if (filters?.empleadoId) {
      where.empleadoId = filters.empleadoId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    return this.prisma.turno.findMany({
      where,
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async findOne(id: string, negocioId: string) {
    const turno = await this.prisma.turno.findUnique({
      where: { id },
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
    });

    if (!turno || turno.negocioId !== negocioId) {
      throw new NotFoundException('Turno no encontrado');
    }

    return turno;
  }

  async update(id: string, updateTurnoDto: UpdateTurnoDto, negocioId: string) {
    const turno = await this.findOne(id, negocioId);

    // Update services if provided
    const data: any = { ...updateTurnoDto };
    delete data.servicioIds;

    if (updateTurnoDto.servicioIds) {
      const servicios = await this.prisma.servicio.findMany({
        where: {
          id: { in: updateTurnoDto.servicioIds },
          negocioId,
          activo: true,
        },
      });

      if (servicios.length !== updateTurnoDto.servicioIds.length) {
        throw new NotFoundException('Algunos servicios no fueron encontrados');
      }

      // Delete old servicios
      await this.prisma.turnoServicio.deleteMany({
        where: { turnoId: id },
      });

      // Create new servicios
      data.servicios = {
        create: servicios.map((s) => ({
          servicioId: s.id,
          precioAplicado: s.precio,
          duracionAplicada: s.duracionMin,
        })),
      };
    }

    return this.prisma.turno.update({
      where: { id },
      data,
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
    });
  }

  async remove(id: string, negocioId: string) {
    await this.findOne(id, negocioId);

    await this.prisma.turno.delete({
      where: { id },
    });

    return { message: 'Turno eliminado exitosamente' };
  }

  async updateEstado(id: string, estado: TurnoEstado, negocioId: string) {
    await this.findOne(id, negocioId);

    return this.prisma.turno.update({
      where: { id },
      data: { estado },
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
    });
  }

  async getProximosTurnos(negocioId: string, limit = 10) {
    return this.prisma.turno.findMany({
      where: {
        negocioId,
        fechaInicio: { gte: new Date() },
        estado: { in: [TurnoEstado.PENDIENTE, TurnoEstado.CONFIRMADO] },
      },
      include: {
        cliente: true,
        empleado: true,
        servicios: {
          include: {
            servicio: true,
          },
        },
      },
      orderBy: { fechaInicio: 'asc' },
      take: limit,
    });
  }
}
