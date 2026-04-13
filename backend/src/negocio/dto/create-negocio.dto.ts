import { IsString, IsOptional } from 'class-validator';

export class CreateNegocioDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsOptional()
  configuracion?: any;
}
