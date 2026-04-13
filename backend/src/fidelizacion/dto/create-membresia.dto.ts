import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateMembresiaDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(0)
  precioMensual: number;

  @IsArray()
  @IsOptional()
  beneficios?: any[];

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
