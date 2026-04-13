import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum CuponTipoDescuento {
  PORCENTAJE = 'porcentaje',
  MONTO_FIJO = 'monto_fijo',
}

export class CreateCuponDto {
  @IsString()
  codigo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(CuponTipoDescuento)
  tipoDescuento: CuponTipoDescuento;

  @IsInt()
  @Min(0)
  valor: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  usosMax?: number;

  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @IsDateString()
  @IsOptional()
  fechaHasta?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
