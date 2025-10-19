import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AtmModule } from './api/atm/atm.module';
import { ComprovanteModule } from './api/comprovante/comprovante.module';
import { CredtModule } from './api/credt/credt.module';
import { DebitModule } from './api/debit/debit.module';
import { PushNotificationModule } from './api/push-notification/push-notification.module';
import { UserModule } from './api/user/user.module';
import { UserService } from './api/user/user.service';
import { WalletModule } from './api/wallet/wallet.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigModule disponível em todos os módulos
      envFilePath: '.env', // Caminho para o arquivo .env
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AtmModule,
    CredtModule,
    DebitModule,
    ComprovanteModule,
    WalletModule,
    PushNotificationModule,
  ],
  providers: [UserService],
})
export class AppModule {}
