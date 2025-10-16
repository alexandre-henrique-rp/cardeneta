import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './api/user/user.service';
import { UserModule } from './api/user/user.module';
import { AtmModule } from './api/atm/atm.module';
import { CredtModule } from './api/credt/credt.module';
import { DebitModule } from './api/debit/debit.module';
import { ComprovanteModule } from './api/comprovante/comprovante.module';
import { WalletModule } from './api/wallet/wallet.module';
import { PushNotificationModule } from './push-notification/push-notification.module';

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
