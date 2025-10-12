import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CredtService } from './credt.service';
import { CredtController } from './credt.controller';
import { PushNotificationModule } from '../../push-notification/push-notification.module';

@Module({
  imports: [PrismaModule, PushNotificationModule],
  controllers: [CredtController],
  providers: [CredtService],
})
export class CredtModule {}
