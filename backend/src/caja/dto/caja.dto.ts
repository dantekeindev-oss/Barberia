import { IsInt, Min, IsOptional, IsDateString, IsString } from 'class-validator';

export class AbrirCajaDto {
  @IsInt()
  @Min(0)
  montoInicial: number;
}

export class CerrarCajaDto {
  @IsInt()
  @Min(0)
  montoContadoCierre: number;

  @IsString()
  @IsOptional()
  observacionesCierre?: string;
}
