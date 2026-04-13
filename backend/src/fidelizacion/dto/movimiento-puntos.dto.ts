import { IsString, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export enum MovimientoPuntosTipo {
  ACUMULA = 'acumula',
  CANJE = 'canje',
}

export class CreateMovimientoPuntosDto {
  @IsString()
  clienteId: string;

  @IsEnum(MovimientoPuntosTipo)
  tipo: MovimientoPuntosTipo;

  @IsInt()
  @Min(1)
  puntos: number;

  @IsString()
  @IsOptional()
  concepto?: string;

  @IsString()
  @IsOptional()
  referenciaId?: string;
}
