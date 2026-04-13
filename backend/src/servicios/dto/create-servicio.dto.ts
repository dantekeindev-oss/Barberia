import {
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export class CreateServicioDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(5)
  duracionMin: number;

  @IsString()
  @IsOptional()
  colorAgenda?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  empleadoIds?: string[];
}
