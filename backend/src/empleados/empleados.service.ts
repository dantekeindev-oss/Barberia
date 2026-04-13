import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
} from './dto/horario-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpleadoDto: CreateEmpleadoDto, negocioId: string) {
    // If usuarioId is provided, verify it exists and belongs to negocio
    if (createEmpleadoDto.usuarioId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createEmpleadoDto.usuarioId },
      });

      if (!usuario || usuario.negocioId !== negocioId) {
        throw new NotFoundException('Usuario no encontrado');
      }
    }

    return this.prisma.empleado.create({
      data: {
        ...createEmpleadoDto,
        negocioId,
        comisionPorcentaje: createEmpleadoDto.comisionPorcentaje || 0,
        activo: createEmpleadoDto.activo !== undefined ? createEmpleadoDto.activo : true,
        especialidades: createEmpleadoDto.especialidades?.join(',') || '',
      },
    });
  }

  async findAll(negocioId: string, includeInactive: boolean = false) {
    const where: any = { negocioId };

    if (!includeInactive) {
      where.activo = true;
    }

    return this.prisma.empleado.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            rol: true,
          },
        },
        horarios: {
          orderBy: { diaSemana: 'asc' },
        },
        _count: {
          select: { turnos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, negocioId: string) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            rol: true,
          },
        },
        horarios: {
          orderBy: { diaSemana: 'asc' },
        },
        serviciosEmpleado: {
          include: {
            servicio: true,
          },
        },
        turnos: {
          where: {
            fechaInicio: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
          include: {
            servicios: {
              include: {
                servicio: true,
              },
            },
          },
          orderBy: { fechaInicio: 'desc' },
          take: 20,
        },
        _count: {
          select: { turnos: true },
        },
      },
    });

    if (!empleado || empleado.negocioId !== negocioId) {
      throw new NotFoundException('Empleado no encontrado');
    }

    return empleado;
  }

  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto, negocioId: string) {
    await this.findOne(id, negocioId);

    const data: any = { ...updateEmpleadoDto };
    if (updateEmpleadoDto.especialidades) {
      data.especialidades = updateEmpleadoDto.especialidades.join(',');
    }

    return this.prisma.empleado.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, negocioId: string) {
    await this.findOne(id, negocioId);

    await this.prisma.empleado.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Empleado desactivado exitosamente' };
  }

  // Horarios
  async addHorario(
    empleadoId: string,
    createHorarioDto: CreateHorarioEmpleadoDto,
    negocioId: string,
  ) {
    await this.findOne(empleadoId, negocioId);

    return this.prisma.horarioEmpleado.create({
      data: {
        empleadoId,
        ...createHorarioDto,
        activo: createHorarioDto.activo !== undefined ? createHorarioDto.activo : true,
      },
    });
  }

  async updateHorario(
    id: string,
    updateHorarioDto: UpdateHorarioEmpleadoDto,
    negocioId: string,
  ) {
    const horario = await this.prisma.horarioEmpleado.findUnique({
      where: { id },
      include: { empleado: true },
    });

    if (!horario || horario.empleado.negocioId !== negocioId) {
      throw new NotFoundException('Horario no encontrado');
    }

    return this.prisma.horarioEmpleado.update({
      where: { id },
      data: updateHorarioDto,
    });
  }

  async removeHorario(id: string, negocioId: string) {
    const horario = await this.prisma.horarioEmpleado.findUnique({
      where: { id },
      include: { empleado: true },
    });

    if (!horario || horario.empleado.negocioId !== negocioId) {
      throw new NotFoundException('Horario no encontrado');
    }

    await this.prisma.horarioEmpleado.delete({
      where: { id },
    });

    return { message: 'Horario eliminado exitosamente' };
  }

  async getEstadisticas(empleadoId: string, negocioId: string) {
    await this.findOne(empleadoId, negocioId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const turnosMes = await this.prisma.turno.findMany({
      where: {
        empleadoId,
        fechaInicio: { gte: startOfMonth },
        estado: 'finalizado',
      },
      include: {
        servicios: {
          include: { servicio: true },
        },
      },
    });

    const ingresosGenerados = turnosMes.reduce((acc, t) => {
      return (
        acc +
        t.servicios.reduce((sum, ts) => sum + Number(ts.precioAplicado), 0)
      );
    }, 0);

    const totalComision = ingresosGenerados * 0.2; // 20% comisión (puede ser configurable)

    const serviciosPorTipo = turnosMes.reduce((acc, t) => {
      t.servicios.forEach((ts) => {
        const nombre = ts.servicio.nombre;
        acc[nombre] = (acc[nombre] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      turnosMes: turnosMes.length,
      ingresosGenerados,
      totalComision,
      serviciosPorTipo,
    };
  }

  async getRanking(negocioId: string, limit: number = 10) {
    const empleados = await this.prisma.empleado.findMany({
      where: { negocioId, activo: true },
      include: {
        _count: {
          select: { turnos: true },
        },
      },
      orderBy: {
        turnos: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return empleados.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      fotoUrl: e.fotoUrl,
      totalTurnos: e._count.turnos,
      comisionPorcentaje: Number(e.comisionPorcentaje),
    }));
  }
}
