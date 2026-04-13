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
import { TurnosService } from './turnos.service';
import { CreateTurnoDto, TurnoEstado } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('turnos')
@UseGuards(JwtAuthGuard)
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() createTurnoDto: CreateTurnoDto, @Request() req) {
    return this.turnosService.create(createTurnoDto, req.user.negocioId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('empleadoId') empleadoId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.turnosService.findAll(req.user.negocioId, {
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      empleadoId,
      estado,
    });
  }

  @Get('proximos')
  getProximosTurnos(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.turnosService.getProximosTurnos(
      req.user.negocioId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.turnosService.findOne(id, req.user.negocioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTurnoDto: UpdateTurnoDto,
    @Request() req,
  ) {
    return this.turnosService.update(id, updateTurnoDto, req.user.negocioId);
  }

  @Patch(':id/estado')
  updateEstado(
    @Param('id') id: string,
    @Body('estado') estado: TurnoEstado,
    @Request() req,
  ) {
    return this.turnosService.updateEstado(id, estado, req.user.negocioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.turnosService.remove(id, req.user.negocioId);
  }
}
