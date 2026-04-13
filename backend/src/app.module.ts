import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TurnosModule } from './turnos/turnos.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ServiciosModule } from './servicios/servicios.module';
import { StockModule } from './stock/stock.module';
import { CajaModule } from './caja/caja.module';
import { FidelizacionModule } from './fidelizacion/fidelizacion.module';
import { NegocioModule } from './negocio/negocio.module';
import { PublicModule } from './public/public.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TurnosModule,
    ClientesModule,
    EmpleadosModule,
    ServiciosModule,
    StockModule,
    CajaModule,
    FidelizacionModule,
    NegocioModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

