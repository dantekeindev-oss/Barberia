import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearTurnoPublicoDto } from './dto/crear-turno-publico.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getInfo(negocioId: string) {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id: negocioId },
      select: {
        id: true,
        nombre: true,
        logoUrl: true,
        direccion: true,
        telefono: true,
        email: true,
      },
    });

    if (!negocio) throw new NotFoundException('Negocio no encontrado');
    return negocio;
  }

  async getServicios(negocioId: string) {
    return this.prisma.servicio.findMany({
      where: { negocioId, activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        duracionMin: true,
        colorAgenda: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getEmpleados(negocioId: string, servicioId?: string) {
    const where: any = { negocioId, activo: true };

    if (servicioId) {
      where.servicios = {
        some: { servicioId },
      };
    }

    return this.prisma.empleado.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoUrl: true,
        especialidades: true,
        servicios: {
          select: {
            servicioId: true,
          },
        },
        horarios: {
          where: { activo: true },
          select: {
            diaSemana: true,
            horaInicio: true,
            horaFin: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async getSlotsDisponibles(
    negocioId: string,
    empleadoId: string,
    fecha: string,
    duracionMin: number,
  ) {
    // Verify employee belongs to this negocio
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleadoId },
    });
    if (!empleado || empleado.negocioId !== negocioId) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const date = new Date(fecha + 'T00:00:00');
    const jsDayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
    // Schema: 0=Lunes, 6=Domingo
    const diaSemana = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1;

    const horario = await this.prisma.horarioEmpleado.findFirst({
      where: { empleadoId, diaSemana, activo: true },
    });

    if (!horario) return [];

    const dayStart = new Date(fecha + 'T00:00:00');
    const dayEnd = new Date(fecha + 'T23:59:59');

    const [turnos, bloqueos] = await Promise.all([
      this.prisma.turno.findMany({
        where: {
          empleadoId,
          fechaInicio: { gte: dayStart, lte: dayEnd },
          estado: { notIn: ['cancelado', 'ausente'] },
        },
        select: { fechaInicio: true, fechaFin: true },
      }),
      this.prisma.bloqueHorario.findMany({
        where: {
          empleadoId,
          fechaInicio: { lt: dayEnd },
          fechaFin: { gt: dayStart },
        },
        select: { fechaInicio: true, fechaFin: true },
      }),
    ]);

    const [startH, startM] = horario.horaInicio.split(':').map(Number);
    const [endH, endM] = horario.horaFin.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Build occupied ranges in minutes from midnight
    const occupied: { start: number; end: number }[] = [];

    for (const turno of turnos) {
      const tStart = new Date(turno.fechaInicio);
      const tEnd = new Date(turno.fechaFin);
      occupied.push({
        start: tStart.getHours() * 60 + tStart.getMinutes(),
        end: tEnd.getHours() * 60 + tEnd.getMinutes(),
      });
    }

    for (const bloqueo of bloqueos) {
      const bStart = new Date(bloqueo.fechaInicio);
      const bEnd = new Date(bloqueo.fechaFin);
      occupied.push({
        start: Math.max(bStart.getHours() * 60 + bStart.getMinutes(), startMinutes),
        end: Math.min(bEnd.getHours() * 60 + bEnd.getMinutes(), endMinutes),
      });
    }

    const now = new Date();
    const isToday = fecha === now.toISOString().split('T')[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots: string[] = [];
    const interval = 30;

    for (let m = startMinutes; m + duracionMin <= endMinutes; m += interval) {
      if (isToday && m <= nowMinutes) continue;

      const slotEnd = m + duracionMin;
      const isOccupied = occupied.some((o) => m < o.end && slotEnd > o.start);

      if (!isOccupied) {
        const h = Math.floor(m / 60).toString().padStart(2, '0');
        const min = (m % 60).toString().padStart(2, '0');
        slots.push(`${h}:${min}`);
      }
    }

    return slots;
  }

  async crearTurno(negocioId: string, dto: CrearTurnoPublicoDto) {
    // Find or create cliente by phone
    let cliente = await this.prisma.cliente.findFirst({
      where: { negocioId, telefono: dto.telefono },
    });

    if (!cliente) {
      cliente = await this.prisma.cliente.create({
        data: {
          negocioId,
          nombre: dto.nombre,
          apellido: dto.apellido,
          telefono: dto.telefono,
          segmento: 'nuevo',
        },
      });
    }

    // Verify employee
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleadoId },
    });
    if (!empleado || empleado.negocioId !== negocioId) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Get services and compute total duration
    const servicios = await this.prisma.servicio.findMany({
      where: { id: { in: dto.servicioIds }, negocioId, activo: true },
    });

    if (servicios.length !== dto.servicioIds.length) {
      throw new BadRequestException('Algunos servicios no están disponibles');
    }

    const totalDuracion = servicios.reduce((acc, s) => acc + s.duracionMin, 0);
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(fechaInicio.getTime() + totalDuracion * 60 * 1000);

    const turno = await this.prisma.turno.create({
      data: {
        negocioId,
        clienteId: cliente.id,
        empleadoId: dto.empleadoId,
        fechaInicio,
        fechaFin,
        estado: 'pendiente',
        origen: 'web',
        servicios: {
          create: servicios.map((s) => ({
            servicioId: s.id,
            precioAplicado: s.precio,
            duracionAplicada: s.duracionMin,
          })),
        },
      },
      include: {
        cliente: { select: { id: true, nombre: true, apellido: true, telefono: true } },
        empleado: { select: { id: true, nombre: true, apellido: true } },
        servicios: {
          include: {
            servicio: { select: { id: true, nombre: true, precio: true, duracionMin: true } },
          },
        },
      },
    });

    return turno;
  }
}
