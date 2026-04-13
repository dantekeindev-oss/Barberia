import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto, ClienteSegmento } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, negocioId: string) {
    // Check if telefono already exists for this negocio
    const existing = await this.prisma.cliente.findUnique({
      where: { telefono: createClienteDto.telefono },
    });

    if (existing && existing.negocioId === negocioId) {
      throw new ConflictException('Ya existe un cliente con este teléfono');
    }

    // Check if DNI already exists for this negocio
    if (createClienteDto.dni) {
      const existingDni = await this.prisma.cliente.findUnique({
        where: { dni: createClienteDto.dni },
      });

      if (existingDni && existingDni.negocioId === negocioId) {
        throw new ConflictException('Ya existe un cliente con este DNI');
      }
    }

    return this.prisma.cliente.create({
      data: {
        ...createClienteDto,
        negocioId,
        segmento: createClienteDto.segmento || ClienteSegmento.NUEVO,
        puntosAcumulados: createClienteDto.puntosAcumulados || 0,
      },
    });
  }

  async findAll(negocioId: string, filters?: { busqueda?: string; segmento?: string }) {
    const where: any = { negocioId };

    if (filters?.busqueda) {
      where.OR = [
        { nombre: { contains: filters.busqueda } },
        { apellido: { contains: filters.busqueda } },
        { telefono: { contains: filters.busqueda } },
        { email: { contains: filters.busqueda } },
      ];
    }

    if (filters?.segmento) {
      where.segmento = filters.segmento;
    }

    return this.prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { turnos: true },
        },
      },
    });
  }

  async findOne(id: string, negocioId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        turnos: {
          include: {
            empleado: true,
            servicios: {
              include: {
                servicio: true,
              },
            },
          },
          orderBy: { fechaInicio: 'desc' },
          take: 10,
        },
        movimientosPuntos: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { turnos: true },
        },
      },
    });

    if (!cliente || cliente.negocioId !== negocioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto, negocioId: string) {
    await this.findOne(id, negocioId);

    // Check if telefono already exists for another cliente
    if (updateClienteDto.telefono) {
      const existing = await this.prisma.cliente.findFirst({
        where: {
          telefono: updateClienteDto.telefono,
          negocioId,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe otro cliente con este teléfono');
      }
    }

    // Check if DNI already exists for another cliente
    if (updateClienteDto.dni) {
      const existingDni = await this.prisma.cliente.findFirst({
        where: {
          dni: updateClienteDto.dni,
          negocioId,
          id: { not: id },
        },
      });

      if (existingDni) {
        throw new ConflictException('Ya existe otro cliente con este DNI');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: string, negocioId: string) {
    await this.findOne(id, negocioId);

    await this.prisma.cliente.delete({
      where: { id },
    });

    return { message: 'Cliente eliminado exitosamente' };
  }

  async searchByPhone(telefono: string, negocioId: string) {
    return this.prisma.cliente.findFirst({
      where: {
        telefono,
        negocioId,
      },
    });
  }

  async updateSegmento(id: string, segmento: ClienteSegmento, negocioId: string) {
    await this.findOne(id, negocioId);

    return this.prisma.cliente.update({
      where: { id },
      data: { segmento },
    });
  }

  async getTopClientes(negocioId: string, limit = 10) {
    return this.prisma.cliente.findMany({
      where: { negocioId },
      orderBy: { puntosAcumulados: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { turnos: true },
        },
      },
    });
  }
}
