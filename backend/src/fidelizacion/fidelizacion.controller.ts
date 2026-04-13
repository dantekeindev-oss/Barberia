import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FidelizacionService } from './fidelizacion.service';
import { CreateMembresiaDto } from './dto/create-membresia.dto';
import { UpdateMembresiaDto } from './dto/update-membresia.dto';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { CreateMovimientoPuntosDto } from './dto/movimiento-puntos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fidelizacion')
@UseGuards(JwtAuthGuard)
export class FidelizacionController {
  constructor(private readonly fidelizacionService: FidelizacionService) {}

  // Membresías
  @Post('membresias')
  createMembresia(@Body() createMembresiaDto: CreateMembresiaDto, @Request() req) {
    return this.fidelizacionService.createMembresia(createMembresiaDto, req.user.negocioId);
  }

  @Get('membresias')
  findAllMembresias(@Request() req) {
    return this.fidelizacionService.findAllMembresias(req.user.negocioId);
  }

  @Get('membresias/:id')
  findOneMembresia(@Param('id') id: string, @Request() req) {
    return this.fidelizacionService.findOneMembresia(id, req.user.negocioId);
  }

  @Patch('membresias/:id')
  updateMembresia(
    @Param('id') id: string,
    @Body() updateMembresiaDto: UpdateMembresiaDto,
    @Request() req,
  ) {
    return this.fidelizacionService.updateMembresia(id, updateMembresiaDto, req.user.negocioId);
  }

  @Delete('membresias/:id')
  removeMembresia(@Param('id') id: string, @Request() req) {
    return this.fidelizacionService.removeMembresia(id, req.user.negocioId);
  }

  @Post('membresias/asignar')
  asignarMembresia(
    @Body() data: { clienteId: string; membresiaId: string },
    @Request() req,
  ) {
    return this.fidelizacionService.asignarMembresia(
      data.clienteId,
      data.membresiaId,
      req.user.negocioId,
    );
  }

  // Cupones
  @Post('cupones')
  createCupon(@Body() createCuponDto: CreateCuponDto, @Request() req) {
    return this.fidelizacionService.createCupon(createCuponDto, req.user.negocioId);
  }

  @Get('cupones')
  findAllCupones(@Request() req) {
    return this.fidelizacionService.findAllCupones(req.user.negocioId);
  }

  @Get('cupones/:id')
  findOneCupon(@Param('id') id: string, @Request() req) {
    return this.fidelizacionService.findOneCupon(id, req.user.negocioId);
  }

  @Get('cupones/codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string, @Request() req) {
    return this.fidelizacionService.findByCodigo(codigo, req.user.negocioId);
  }

  @Post('cupones/validar')
  validarCupon(
    @Body() data: { codigo: string; monto: number },
    @Request() req,
  ) {
    return this.fidelizacionService.validarCupon(data.codigo, data.monto, req.user.negocioId);
  }

  @Post('cupones/:id/usar')
  usarCupon(@Param('id') id: string, @Request() req) {
    return this.fidelizacionService.usarCupon(id, req.user.negocioId);
  }

  @Patch('cupones/:id')
  updateCupon(
    @Param('id') id: string,
    @Body() updateCuponDto: UpdateCuponDto,
    @Request() req,
  ) {
    return this.fidelizacionService.updateCupon(id, updateCuponDto, req.user.negocioId);
  }

  @Delete('cupones/:id')
  removeCupon(@Param('id') id: string, @Request() req) {
    return this.fidelizacionService.removeCupon(id, req.user.negocioId);
  }

  // Puntos
  @Post('puntos/movimientos')
  createMovimientoPuntos(@Body() createMovimientoPuntosDto: CreateMovimientoPuntosDto, @Request() req) {
    return this.fidelizacionService.createMovimientoPuntos(createMovimientoPuntosDto, req.user.negocioId);
  }

  @Get('puntos/movimientos')
  findAllMovimientosPuntos(
    @Request() req,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.fidelizacionService.findAllMovimientosPuntos(req.user.negocioId, { clienteId });
  }

  @Get('puntos/leaderboard')
  getLeaderboard(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.fidelizacionService.getLeaderboard(
      req.user.negocioId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Post('puntos/agregar-por-visita')
  agregarPuntosPorVisita(
    @Body() data: { clienteId: string; montoCompra: number },
    @Request() req,
  ) {
    return this.fidelizacionService.agregarPuntosPorVisita(
      data.clienteId,
      data.montoCompra,
      req.user.negocioId,
    );
  }
}
