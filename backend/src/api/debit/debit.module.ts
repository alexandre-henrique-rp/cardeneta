import { Module } from '@nestjs/common';
import { DebitService } from './debit.service';
import { DebitController } from './debit.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PushNotificationModule } from '../../push-notification/push-notification.module';

@Module({
  imports: [PrismaModule, PushNotificationModule],
  controllers: [DebitController],
  providers: [DebitService],
})
export class DebitModule {}
