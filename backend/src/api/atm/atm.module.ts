import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AtmService } from './atm.service';
import { AtmController } from './atm.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AtmController],
  providers: [AtmService],
})
export class AtmModule {}
