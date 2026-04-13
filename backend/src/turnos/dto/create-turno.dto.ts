import { IsString, IsDate, IsEnum, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export enum TurnoEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
  AUSENTE = 'ausente',
}

export enum TurnoOrigen {
  WEB = 'web',
  PRESENCIAL = 'presencial',
  PHONE = 'phone',
}

export class CreateTurnoDto {
  @IsString()
  clienteId: string;

  @IsString()
  empleadoId: string;

  @IsDate()
  fechaInicio: Date;

  @IsDate()
  fechaFin: Date;

  @IsEnum(TurnoEstado)
  @IsOptional()
  estado?: TurnoEstado;

  @IsEnum(TurnoOrigen)
  @IsOptional()
  origen?: TurnoOrigen;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  servicioIds: string[];
}
