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
import { ClientesService } from './clientes.service';
import { CreateClienteDto, ClienteSegmento } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto, @Request() req) {
    return this.clientesService.create(createClienteDto, req.user.negocioId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('busqueda') busqueda?: string,
    @Query('segmento') segmento?: string,
  ) {
    return this.clientesService.findAll(req.user.negocioId, { busqueda, segmento });
  }

  @Get('top')
  getTopClientes(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.clientesService.getTopClientes(
      req.user.negocioId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('search')
  searchByPhone(
    @Request() req,
    @Query('telefono') telefono: string,
  ) {
    return this.clientesService.searchByPhone(telefono, req.user.negocioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientesService.findOne(id, req.user.negocioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @Request() req,
  ) {
    return this.clientesService.update(id, updateClienteDto, req.user.negocioId);
  }

  @Patch(':id/segmento')
  updateSegmento(
    @Param('id') id: string,
    @Body('segmento') segmento: ClienteSegmento,
    @Request() req,
  ) {
    return this.clientesService.updateSegmento(id, segmento, req.user.negocioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.clientesService.remove(id, req.user.negocioId);
  }
}
