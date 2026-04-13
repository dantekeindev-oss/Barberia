import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto, negocioId: string) {
    const { empleadoIds, ...servicioData } = createServicioDto;

    const servicio = await this.prisma.servicio.create({
      data: {
        ...servicioData,
        negocioId,
        activo: createServicioDto.activo !== undefined ? createServicioDto.activo : true,
        colorAgenda: createServicioDto.colorAgenda || '#3B82F6',
      },
    });

    // If empleadoIds are provided, create relations
    if (empleadoIds && empleadoIds.length > 0) {
      for (const empleadoId of empleadoIds) {
        await this.prisma.servicioEmpleado.upsert({
          where: {
            empleadoId_servicioId: {
              empleadoId,
              servicioId: servicio.id,
            },
          },
          update: {},
          create: {
            empleadoId,
            servicioId: servicio.id,
          },
        });
      }
    }

    return this.findOne(servicio.id, negocioId);
  }

  async findAll(negocioId: string, includeInactive: boolean = false) {
    const where: any = { negocioId };

    if (!includeInactive) {
      where.activo = true;
    }

    return this.prisma.servicio.findMany({
      where,
      include: {
        serviciosEmpleado: {
          include: {
            empleado: true,
          },
        },
        _count: {
          select: { turnoServicios: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, negocioId: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      include: {
        serviciosEmpleado: {
          include: {
            empleado: true,
          },
        },
        insumosServicio: {
          include: {
            producto: true,
          },
        },
        _count: {
          select: { turnoServicios: true },
        },
      },
    });

    if (!servicio || servicio.negocioId !== negocioId) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return servicio;
  }

  async update(id: string, updateServicioDto: UpdateServicioDto, negocioId: string) {
    await this.findOne(id, negocioId);

    const { empleadoIds, ...servicioData } = updateServicioDto;

    // Update servicio data
    const servicio = await this.prisma.servicio.update({
      where: { id },
      data: servicioData,
    });

    // If empleadoIds are provided, update relations
    if (empleadoIds !== undefined) {
      // Delete existing relations
      await this.prisma.servicioEmpleado.deleteMany({
        where: { servicioId: id },
      });

      // Create new relations
      if (empleadoIds.length > 0) {
        for (const empleadoId of empleadoIds) {
          await this.prisma.servicioEmpleado.create({
            data: {
              empleadoId,
              servicioId: id,
            },
          });
        }
      }
    }

    return this.findOne(id, negocioId);
  }

  async remove(id: string, negocioId: string) {
    await this.findOne(id, negocioId);

    await this.prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Servicio desactivado exitosamente' };
  }

  async addEmpleadoToServicio(
    servicioId: string,
    empleadoId: string,
    negocioId: string,
  ) {
    await this.findOne(servicioId, negocioId);

    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado || empleado.negocioId !== negocioId) {
      throw new NotFoundException('Empleado no encontrado');
    }

    await this.prisma.servicioEmpleado.upsert({
      where: {
        empleadoId_servicioId: {
          empleadoId,
          servicioId,
        },
      },
      update: {},
      create: {
        servicioId,
        empleadoId,
      },
    });

    return this.findOne(servicioId, negocioId);
  }

  async removeEmpleadoFromServicio(
    servicioId: string,
    empleadoId: string,
    negocioId: string,
  ) {
    await this.findOne(servicioId, negocioId);

    await this.prisma.servicioEmpleado.deleteMany({
      where: {
        servicioId,
        empleadoId,
      },
    });

    return { message: 'Empleado removido del servicio exitosamente' };
  }

  async getMasVendidos(negocioId: string, limit: number = 10) {
    const servicios = await this.prisma.servicio.findMany({
      where: { negocioId, activo: true },
      include: {
        _count: {
          select: { turnoServicios: true },
        },
      },
      orderBy: {
        turnoServicios: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: Number(s.precio),
      duracionMin: s.duracionMin,
      colorAgenda: s.colorAgenda,
      categoria: s.categoria,
      vecesVendido: s._count.turnoServicios,
    }));
  }
}
