import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';

export class CrearTurnoPublicoDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @MinLength(6)
  telefono: string;

  @IsString()
  empleadoId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  servicioIds: string[];

  @IsString()
  fechaInicio: string; // ISO datetime string
}
