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
import { StockService } from './stock.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateMovimientoStockDto } from './dto/movimiento-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // Productos
  @Post('productos')
  createProducto(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    return this.stockService.createProducto(createProductoDto, req.user.negocioId);
  }

  @Get('productos')
  findAllProductos(
    @Request() req,
    @Query('tipo') tipo?: string,
    @Query('bajoStock') bajoStock?: string,
  ) {
    return this.stockService.findAllProductos(req.user.negocioId, { tipo, bajoStock });
  }

  @Get('productos/bajo-stock')
  getProductosBajoStock(@Request() req) {
    return this.stockService.getProductosBajoStock(req.user.negocioId);
  }

  @Get('productos/:id')
  findOneProducto(@Param('id') id: string, @Request() req) {
    return this.stockService.findOneProducto(id, req.user.negocioId);
  }

  @Patch('productos/:id')
  updateProducto(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @Request() req,
  ) {
    return this.stockService.updateProducto(id, updateProductoDto, req.user.negocioId);
  }

  @Delete('productos/:id')
  removeProducto(@Param('id') id: string, @Request() req) {
    return this.stockService.removeProducto(id, req.user.negocioId);
  }

  // Movimientos
  @Post('movimientos')
  createMovimiento(@Body() createMovimientoDto: CreateMovimientoStockDto, @Request() req) {
    return this.stockService.createMovimiento(
      createMovimientoDto,
      req.user.negocioId,
      req.user.id,
    );
  }

  @Get('movimientos')
  findAllMovimientos(
    @Request() req,
    @Query('productoId') productoId?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.stockService.findAllMovimientos(req.user.negocioId, { productoId, tipo });
  }

  // Proveedores
  @Post('proveedores')
  createProveedor(
    @Body() data: { nombre: string; contacto?: string; telefono?: string; email?: string; notas?: string },
    @Request() req,
  ) {
    return this.stockService.createProveedor(data.nombre, req.user.negocioId, data);
  }

  @Get('proveedores')
  findAllProveedores(@Request() req) {
    return this.stockService.findAllProveedores(req.user.negocioId);
  }

  @Get('proveedores/:id')
  findOneProveedor(@Param('id') id: string, @Request() req) {
    return this.stockService.findOneProveedor(id, req.user.negocioId);
  }

  @Patch('proveedores/:id')
  updateProveedor(
    @Param('id') id: string,
    @Body() data: { nombre?: string; contacto?: string; telefono?: string; email?: string; notas?: string },
    @Request() req,
  ) {
    return this.stockService.updateProveedor(id, data, req.user.negocioId);
  }

  @Delete('proveedores/:id')
  removeProveedor(@Param('id') id: string, @Request() req) {
    return this.stockService.removeProveedor(id, req.user.negocioId);
  }
}
