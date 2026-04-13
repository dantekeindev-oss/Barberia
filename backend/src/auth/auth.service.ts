import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create business and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create business
      const negocio = await tx.negocio.create({
        data: {
          nombre: registerDto.negocioNombre,
          telefono: registerDto.telefono,
          timezone: 'America/Argentina/Buenos_Aires',
        },
      });

      // Create user
      const user = await tx.usuario.create({
        data: {
          email: registerDto.email,
          nombre: registerDto.nombre,
          password: hashedPassword,
          rol: 'ADMIN',
          negocioId: negocio.id,
          activo: true,
        },
        include: { negocio: true },
      });

      return { user, negocio };
    });

    // Generate token
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      rol: result.user.rol,
      negocioId: result.user.negocioId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        nombre: result.user.nombre,
        email: result.user.email,
        rol: result.user.rol,
        negocio: {
          id: result.user.negocio.id,
          nombre: result.user.negocio.nombre,
          logoUrl: result.user.negocio.logoUrl,
        },
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
      include: { negocio: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Update last login
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      negocioId: user.negocioId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        negocio: {
          id: user.negocio.id,
          nombre: user.negocio.nombre,
          logoUrl: user.negocio.logoUrl,
        },
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        negocio: {
          select: {
            id: true,
            nombre: true,
            logoUrl: true,
            direccion: true,
            telefono: true,
          },
        },
      },
    });
  }
}
