import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { AuthGuard } from '../auth/auth.guard';

/**
 * Controller responsável por gerenciar as notificações push
 * Endpoints para criar/remover subscrições e enviar notificações
 */
@Controller('push-notification')
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Endpoint para obter a chave pública VAPID
   * Necessária para o frontend criar subscrições
   * Não requer autenticação pois é uma chave pública
   */
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.pushNotificationService.getVapidPublicKey();
  }

  /**
   * Endpoint para criar uma nova subscrição de push notification
   * @param createSubscriptionDto - Dados da subscrição
   * @param req - Request contendo dados do usuário autenticado
   */
  @Post('subscribe')
  @UseGuards(AuthGuard)
  async subscribe(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
  ) {
    return await this.pushNotificationService.createSubscription(
      createSubscriptionDto,
      req.user,
    );
  }

  /**
   * Endpoint para remover uma subscrição de push notification
   * @param endpoint - Endpoint da subscrição a ser removida
   * @param req - Request contendo dados do usuário autenticado
   */
  @Delete('unsubscribe/:endpoint')
  @UseGuards(AuthGuard)
  async unsubscribe(@Param('endpoint') endpoint: string, @Req() req: any) {
    return await this.pushNotificationService.removeSubscription(
      decodeURIComponent(endpoint),
      req.user,
    );
  }

  /**
   * Endpoint para obter todas as subscrições do usuário
   * @param req - Request contendo dados do usuário autenticado
   */
  @Get('subscriptions')
  @UseGuards(AuthGuard)
  async getSubscriptions(@Req() req: any) {
    return await this.pushNotificationService.getUserSubscriptions(req.user);
  }

  /**
   * Endpoint para enviar notificação para todos os usuários de uma wallet
   * @param sendNotificationDto - Dados da notificação
   */
  @Post('send')
  @UseGuards(AuthGuard)
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return await this.pushNotificationService.sendNotificationToWalletUsers(
      sendNotificationDto.walletId,
      {
        title: sendNotificationDto.title || 'Cardeneta App',
        message: sendNotificationDto.message,
        redirectUrl: sendNotificationDto.redirectUrl,
        icon: sendNotificationDto.icon,
      },
    );
  }
}
