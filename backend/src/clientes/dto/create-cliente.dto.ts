import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export enum ClienteSegmento {
  NUEVO = 'nuevo',
  FRECUENTE = 'frecuente',
  INACTIVO = 'inactivo',
}

export class CreateClienteDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  telefono: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsString()
  @IsOptional()
  preferencias?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsEnum(ClienteSegmento)
  @IsOptional()
  segmento?: ClienteSegmento;

  @IsInt()
  @Min(0)
  @IsOptional()
  puntosAcumulados?: number;
}
