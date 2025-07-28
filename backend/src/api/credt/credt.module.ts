import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CredtService } from './credt.service';
import { CredtController } from './credt.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CredtController],
  providers: [CredtService],
})
export class CredtModule {}
