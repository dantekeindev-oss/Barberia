import { IsInt, IsString, IsBoolean, Min, Max, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHorarioEmpleadoDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number; // 0=Lunes, 6=Domingo

  @IsString()
  horaInicio: string; // HH:MM

  @IsString()
  horaFin: string; // HH:MM

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateHorarioEmpleadoDto extends PartialType(CreateHorarioEmpleadoDto) {}
