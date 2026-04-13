import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  comisionPorcentaje?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsDateString()
  fechaIngreso: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  especialidades?: string[];

  @IsString()
  @IsOptional()
  usuarioId?: string;
}
