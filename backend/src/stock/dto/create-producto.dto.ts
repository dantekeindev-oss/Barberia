import {
  IsString,
  IsBoolean,
  IsInt,
  IsDecimal,
  Min,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum ProductoTipo {
  VENTA = 'venta',
  INSUMO = 'insumo',
}

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(ProductoTipo)
  tipo: ProductoTipo;

  @IsInt()
  @Min(0)
  @IsOptional()
  precioVenta?: number;

  @IsInt()
  @Min(0)
  costoCompra: number;

  @IsInt()
  @Min(0)
  stockActual: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  proveedorId?: string;
}
