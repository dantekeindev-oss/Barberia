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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
} from './dto/horario-empleado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('empleados')
@UseGuards(JwtAuthGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  create(@Body() createEmpleadoDto: CreateEmpleadoDto, @Request() req) {
    return this.empleadosService.create(createEmpleadoDto, req.user.negocioId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('inactivos') inactivos?: string,
  ) {
    const includeInactive = inactivos === 'true';
    return this.empleadosService.findAll(req.user.negocioId, includeInactive);
  }

  @Get('ranking')
  getRanking(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.empleadosService.getRanking(
      req.user.negocioId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.empleadosService.findOne(id, req.user.negocioId);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id') id: string, @Request() req) {
    return this.empleadosService.getEstadisticas(id, req.user.negocioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @Request() req,
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto, req.user.negocioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.empleadosService.remove(id, req.user.negocioId);
  }

  // Horarios
  @Post(':empleadoId/horarios')
  addHorario(
    @Param('empleadoId') empleadoId: string,
    @Body() createHorarioDto: CreateHorarioEmpleadoDto,
    @Request() req,
  ) {
    return this.empleadosService.addHorario(
      empleadoId,
      createHorarioDto,
      req.user.negocioId,
    );
  }

  @Patch('horarios/:id')
  updateHorario(
    @Param('id') id: string,
    @Body() updateHorarioDto: UpdateHorarioEmpleadoDto,
    @Request() req,
  ) {
    return this.empleadosService.updateHorario(id, updateHorarioDto, req.user.negocioId);
  }

  @Delete('horarios/:id')
  removeHorario(@Param('id') id: string, @Request() req) {
    return this.empleadosService.removeHorario(id, req.user.negocioId);
  }
}
