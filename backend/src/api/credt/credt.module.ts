import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CredtController } from './credt.controller';
import { CredtService } from './credt.service';

@Module({
  imports: [PrismaModule],
  controllers: [CredtController],
  providers: [CredtService],
})
export class CredtModule {}
