import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DebitController } from './debit.controller';
import { DebitService } from './debit.service';

@Module({
  imports: [PrismaModule],
  controllers: [DebitController],
  providers: [DebitService],
})
export class DebitModule {}
