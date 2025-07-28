import { Module } from '@nestjs/common';
import { DebitService } from './debit.service';
import { DebitController } from './debit.controller';

@Module({
  controllers: [DebitController],
  providers: [DebitService],
})
export class DebitModule {}
