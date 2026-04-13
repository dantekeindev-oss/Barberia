import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { CrearTurnoPublicoDto } from './dto/crear-turno-publico.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':negocioId/info')
  getInfo(@Param('negocioId') negocioId: string) {
    return this.publicService.getInfo(negocioId);
  }

  @Get(':negocioId/servicios')
  getServicios(@Param('negocioId') negocioId: string) {
    return this.publicService.getServicios(negocioId);
  }

  @Get(':negocioId/empleados')
  getEmpleados(
    @Param('negocioId') negocioId: string,
    @Query('servicioId') servicioId?: string,
  ) {
    return this.publicService.getEmpleados(negocioId, servicioId);
  }

  @Get(':negocioId/slots')
  getSlots(
    @Param('negocioId') negocioId: string,
    @Query('empleadoId') empleadoId: string,
    @Query('fecha') fecha: string,
    @Query('duracion', new DefaultValuePipe(30), ParseIntPipe) duracion: number,
  ) {
    return this.publicService.getSlotsDisponibles(negocioId, empleadoId, fecha, duracion);
  }

  @Post(':negocioId/turnos')
  crearTurno(
    @Param('negocioId') negocioId: string,
    @Body() dto: CrearTurnoPublicoDto,
  ) {
    return this.publicService.crearTurno(negocioId, dto);
  }
}
