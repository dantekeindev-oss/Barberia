import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NegocioService } from './negocio.service';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('negocio')
export class NegocioController {
  constructor(private readonly negocioService: NegocioService) {}

  @Post()
  create(@Body() createNegocioDto: CreateNegocioDto) {
    return this.negocioService.create(createNegocioDto);
  }

  @Get()
  findAll() {
    return this.negocioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.negocioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNegocioDto: UpdateNegocioDto,
  ) {
    return this.negocioService.update(id, updateNegocioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.negocioService.remove(id);
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboardData(@Param('id') id: string, @Request() req) {
    if (id !== req.user.negocioId) {
      throw new Error('No autorizado');
    }
    return this.negocioService.getDashboardData(id);
  }
}
