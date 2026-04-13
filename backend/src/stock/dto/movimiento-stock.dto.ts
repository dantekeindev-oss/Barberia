import { IsString, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export enum MovimientoStockTipo {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

export class CreateMovimientoStockDto {
  @IsString()
  productoId: string;

  @IsEnum(MovimientoStockTipo)
  tipo: MovimientoStockTipo;

  @IsInt()
  cantidad: number;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  referenciaId?: string;
}
