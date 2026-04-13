import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { CreateCuponDto, CuponTipoDescuento } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { CreateMovimientoPuntosDto, MovimientoPuntosTipo } from './dto/movimiento-puntos.dto';

@Injectable()
export class FidelizacionService {
  constructor(private prisma: PrismaService) {}

  // Membresías
  async createMembresia(createMembresiaDto: CreateMembresiaDto, negocioId: string) {
    return this.prisma.membresia.create({
      data: {
        ...createMembresiaDto,
        negocioId,
        activa: createMembresiaDto.activa !== undefined ? createMembresiaDto.activa : true,
        beneficios: createMembresiaDto.beneficios ? JSON.stringify(createMembresiaDto.beneficios) : null,
      },
    });
  }

  async findAllMembresias(negocioId: string) {
    return this.prisma.membresia.findMany({
      where: { negocioId },
      include: {
        _count: {
          select: { clientes: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOneMembresia(id: string, negocioId: string) {
    const membresia = await this.prisma.membresia.findUnique({
      where: { id },
      include: {
        clientes: {
          include: {
            cliente: true,
          },
        },
      },
    });

    if (!membresia || membresia.negocioId !== negocioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    return membresia;
  }

  async updateMembresia(id: string, updateMembresiaDto: UpdateMembresiaDto, negocioId: string) {
    await this.findOneMembresia(id, negocioId);

    const data: any = { ...updateMembresiaDto };
    if (updateMembresiaDto.beneficios) {
      data.beneficios = JSON.stringify(updateMembresiaDto.beneficios);
    }

    return this.prisma.membresia.update({
      where: { id },
      data,
    });
  }

  async removeMembresia(id: string, negocioId: string) {
    await this.findOneMembresia(id, negocioId);

    await this.prisma.membresia.update({
      where: { id },
      data: { activa: false },
    });

    return { message: 'Membresía desactivada exitosamente' };
  }

  // Asignar membresía a cliente
  async asignarMembresia(clienteId: string, membresiaId: string, negocioId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente || cliente.negocioId !== negocioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const membresia = await this.prisma.membresia.findUnique({
      where: { id: membresiaId },
    });

    if (!membresia || membresia.negocioId !== negocioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // Check if cliente already has an active membresia
    const existing = await this.prisma.clienteMembresia.findFirst({
      where: {
        clienteId,
        activa: true,
      },
    });

    if (existing) {
      // Deactivate old membership
      await this.prisma.clienteMembresia.update({
        where: { id: existing.id },
        data: { activa: false, fechaFin: new Date() },
      });
    }

    // Create new membership
    return this.prisma.clienteMembresia.create({
      data: {
        clienteId,
        membresiaId,
        fechaInicio: new Date(),
        activa: true,
      },
    });
  }

  // Cupones
  async createCupon(createCuponDto: CreateCuponDto, negocioId: string) {
    // Check if codigo already exists
    const existing = await this.prisma.cupon.findFirst({
      where: {
        codigo: createCuponDto.codigo,
        negocioId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un cupón con ese código');
    }

    return this.prisma.cupon.create({
      data: {
        ...createCuponDto,
        negocioId,
        activo: createCuponDto.activo !== undefined ? createCuponDto.activo : true,
        usosActuales: 0,
      },
    });
  }

  async findAllCupones(negocioId: string) {
    return this.prisma.cupon.findMany({
      where: { negocioId },
      orderBy: { codigo: 'asc' },
    });
  }

  async findOneCupon(id: string, negocioId: string) {
    const cupon = await this.prisma.cupon.findUnique({
      where: { id },
    });

    if (!cupon || cupon.negocioId !== negocioId) {
      throw new NotFoundException('Cupón no encontrado');
    }

    return cupon;
  }

  async findByCodigo(codigo: string, negocioId: string) {
    const cupon = await this.prisma.cupon.findFirst({
      where: {
        codigo,
        negocioId,
        activo: true,
      },
    });

    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado o inactivo');
    }

    // Check if still valid
    const now = new Date();
    if (cupon.fechaDesde && new Date(cupon.fechaDesde) > now) {
      throw new BadRequestException('El cupón aún no está vigente');
    }

    if (cupon.fechaHasta && new Date(cupon.fechaHasta) < now) {
      throw new BadRequestException('El cupón ha expirado');
    }

    // Check usage limit
    if (cupon.usosMax && cupon.usosActuales >= cupon.usosMax) {
      throw new BadRequestException('El cupón ha alcanzado su límite de usos');
    }

    return cupon;
  }

  async validarCupon(codigo: string, monto: number, negocioId: string) {
    const cupon = await this.findByCodigo(codigo, negocioId);

    let descuento = 0;
    if (cupon.tipoDescuento === CuponTipoDescuento.PORCENTAJE) {
      descuento = monto * (Number(cupon.valor) / 100);
    } else {
      descuento = Number(cupon.valor);
    }

    if (descuento > monto) {
      descuento = monto;
    }

    return {
      cuponId: cupon.id,
      codigo: cupon.codigo,
      tipoDescuento: cupon.tipoDescuento,
      valor: Number(cupon.valor),
      descuento,
      montoFinal: monto - descuento,
    };
  }

  async usarCupon(id: string, negocioId: string) {
    const cupon = await this.findOneCupon(id, negocioId);

    return this.prisma.cupon.update({
      where: { id },
      data: {
        usosActuales: cupon.usosActuales + 1,
      },
    });
  }

  async updateCupon(id: string, updateCuponDto: UpdateCuponDto, negocioId: string) {
    await this.findOneCupon(id, negocioId);

    return this.prisma.cupon.update({
      where: { id },
      data: updateCuponDto,
    });
  }

  async removeCupon(id: string, negocioId: string) {
    await this.findOneCupon(id, negocioId);

    await this.prisma.cupon.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Cupón desactivado exitosamente' };
  }

  // Puntos
  async createMovimientoPuntos(
    createMovimientoPuntosDto: CreateMovimientoPuntosDto,
    negocioId: string,
  ) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createMovimientoPuntosDto.clienteId },
    });

    if (!cliente || cliente.negocioId !== negocioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const saldoActual = cliente.puntosAcumulados;
    let saldoNuevo: number;
    const puntos = createMovimientoPuntosDto.puntos;

    if (createMovimientoPuntosDto.tipo === MovimientoPuntosTipo.CANJE) {
      if (saldoActual < puntos) {
        throw new BadRequestException('Puntos insuficientes');
      }
      saldoNuevo = saldoActual - puntos;
    } else {
      saldoNuevo = saldoActual + puntos;
    }

    await this.prisma.$transaction([
      // Update cliente points
      this.prisma.cliente.update({
        where: { id: createMovimientoPuntosDto.clienteId },
        data: { puntosAcumulados: saldoNuevo },
      }),
      // Create movimiento
      this.prisma.movimientoPuntos.create({
        data: {
          clienteId: createMovimientoPuntosDto.clienteId,
          negocioId,
          tipo: createMovimientoPuntosDto.tipo,
          puntos,
          saldoPost: saldoNuevo,
          concepto: createMovimientoPuntosDto.concepto,
          referenciaId: createMovimientoPuntosDto.referenciaId,
        },
      }),
    ]);

    return this.prisma.movimientoPuntos.findFirst({
      where: {
        clienteId: createMovimientoPuntosDto.clienteId,
        negocioId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllMovimientosPuntos(negocioId: string, filters?: { clienteId?: string }) {
    const where: any = { negocioId };

    if (filters?.clienteId) {
      where.clienteId = filters.clienteId;
    }

    return this.prisma.movimientoPuntos.findMany({
      where,
      include: {
        cliente: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getLeaderboard(negocioId: string, limit: number = 10) {
    return this.prisma.cliente.findMany({
      where: {
        negocioId,
        puntosAcumulados: { gt: 0 },
      },
      orderBy: { puntosAcumulados: 'desc' },
      take: limit,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        puntosAcumulados: true,
        _count: {
          select: { turnos: true },
        },
      },
    });
  }

  // Puntos por visita (método de ayuda)
  async agregarPuntosPorVisita(clienteId: string, montoCompra: number, negocioId: string) {
    // 1 punto por cada $100 gastados
    const puntos = Math.floor(montoCompra / 100);

    if (puntos > 0) {
      return this.createMovimientoPuntos(
        {
          clienteId,
          tipo: MovimientoPuntosTipo.ACUMULA,
          puntos,
          concepto: `Puntos por visita`,
        },
        negocioId,
      );
    }

    return null;
  }
}
