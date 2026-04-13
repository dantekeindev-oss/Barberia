import { Module } from '@nestjs/common';
import { FidelizacionService } from './fidelizacion.service';
import { FidelizacionController } from './fidelizacion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FidelizacionController],
  providers: [FidelizacionService],
  exports: [FidelizacionService],
})
export class FidelizacionModule {}
