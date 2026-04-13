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
import { CajaService } from './caja.service';
import { AbrirCajaDto, CerrarCajaDto } from './dto/caja.dto';
import { CreateVentaDto } from './dto/venta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('caja')
@UseGuards(JwtAuthGuard)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  // Caja
  @Post('abrir')
  abrirCaja(@Body() abrirCajaDto: AbrirCajaDto, @Request() req) {
    return this.cajaService.abrirCaja(abrirCajaDto, req.user.negocioId, req.user.id);
  }

  @Get('actual')
  getCajaActual(@Request() req) {
    return this.cajaService.getCajaActual(req.user.negocioId);
  }

  @Patch('cerrar/:id')
  cerrarCaja(
    @Param('id') id: string,
    @Body() cerrarCajaDto: CerrarCajaDto,
    @Request() req,
  ) {
    return this.cajaService.cerrarCaja(id, cerrarCajaDto, req.user.negocioId);
  }

  @Get('cajas')
  findAllCajas(
    @Request() req,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.cajaService.findAllCajas(req.user.negocioId, { fechaInicio, fechaFin });
  }

  @Get('cajas/:id')
  findOneCaja(@Param('id') id: string, @Request() req) {
    return this.cajaService.findOneCaja(id, req.user.negocioId);
  }

  @Get('reporte-diario')
  getReporteDiario(
    @Request() req,
    @Query('fecha') fecha?: string,
  ) {
    return this.cajaService.getReporteDiario(req.user.negocioId, fecha);
  }

  // Ventas
  @Post('ventas')
  createVenta(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    return this.cajaService.createVenta(createVentaDto, req.user.negocioId, req.user.id);
  }

  @Get('ventas')
  findAllVentas(
    @Request() req,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: string,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.cajaService.findAllVentas(req.user.negocioId, {
      fechaInicio,
      fechaFin,
      tipo: tipo as any,
      clienteId,
    });
  }

  @Get('ventas/:id')
  findOneVenta(@Param('id') id: string, @Request() req) {
    return this.cajaService.findOneVenta(id, req.user.negocioId);
  }

  // Movimientos
  @Post('movimientos')
  createMovimiento(
    @Body() data: {
      cajaId: string;
      tipo: 'ingreso' | 'egreso';
      concepto: string;
      monto: number;
      medioPago?: string;
    },
    @Request() req,
  ) {
    return this.cajaService.createMovimiento(data, req.user.negocioId, req.user.id);
  }
}
