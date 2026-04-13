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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('servicios')
@UseGuards(JwtAuthGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  create(@Body() createServicioDto: CreateServicioDto, @Request() req) {
    return this.serviciosService.create(createServicioDto, req.user.negocioId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('inactivos') inactivos?: string,
  ) {
    const includeInactive = inactivos === 'true';
    return this.serviciosService.findAll(req.user.negocioId, includeInactive);
  }

  @Get('mas-vendidos')
  getMasVendidos(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.serviciosService.getMasVendidos(
      req.user.negocioId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.serviciosService.findOne(id, req.user.negocioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
    @Request() req,
  ) {
    return this.serviciosService.update(id, updateServicioDto, req.user.negocioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.serviciosService.remove(id, req.user.negocioId);
  }

  // Empleados
  @Post(':servicioId/empleados/:empleadoId')
  addEmpleado(
    @Param('servicioId') servicioId: string,
    @Param('empleadoId') empleadoId: string,
    @Request() req,
  ) {
    return this.serviciosService.addEmpleadoToServicio(
      servicioId,
      empleadoId,
      req.user.negocioId,
    );
  }

  @Delete(':servicioId/empleados/:empleadoId')
  removeEmpleado(
    @Param('servicioId') servicioId: string,
    @Param('empleadoId') empleadoId: string,
    @Request() req,
  ) {
    return this.serviciosService.removeEmpleadoFromServicio(
      servicioId,
      empleadoId,
      req.user.negocioId,
    );
  }
}
