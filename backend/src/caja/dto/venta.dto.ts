import {
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';

export enum VentaTipo {
  SERVICIO = 'servicio',
  PRODUCTO = 'producto',
  MIXTA = 'mixta',
}

export class VentaItemDto {
  @IsEnum(['servicio', 'producto'])
  tipo: 'servicio' | 'producto';

  @IsString()
  referenciaId: string; // ID del servicio o producto

  @IsString()
  descripcion: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsInt()
  @Min(0)
  precioUnitario: number;
}

export class PagoVentaDto {
  @IsEnum(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'qr', 'otro'])
  medioPago: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr' | 'otro';

  @IsInt()
  @Min(0)
  monto: number;

  @IsString()
  @IsOptional()
  referenciaExterna?: string;
}

export class CreateVentaDto {
  @IsString()
  cajaId: string;

  @IsEnum(VentaTipo)
  tipo: VentaTipo;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsString()
  @IsOptional()
  turnoId?: string;

  @IsInt()
  @Min(0)
  subtotal: number;

  @IsInt()
  @Min(0)
  descuento: number;

  @IsInt()
  @Min(0)
  total: number;

  @IsArray()
  @IsString({ each: true })
  cuponIds?: string[];

  @IsArray()
  items: VentaItemDto[];

  @IsArray()
  pagos: PagoVentaDto[];
}
