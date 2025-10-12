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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PushNotificationService } from './push-notification.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { TestNotificationDto } from './dto/test-notification.dto';
import { AuthGuard } from '../auth/auth.guard';

/**
 * Controller responsável por gerenciar as notificações push
 * Endpoints para criar/remover subscrições e enviar notificações
 */
@ApiTags('Push Notifications')
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
  @ApiOperation({ summary: 'Obter chave pública VAPID' })
  @ApiResponse({
    status: 200,
    description: 'Chave pública VAPID retornada com sucesso',
    schema: {
      type: 'string',
      example: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
    },
  })
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Registrar subscrição de push notification',
    description: 'Registra ou atualiza uma subscrição de push notification para o usuário autenticado'
  })
  @ApiResponse({
    status: 201,
    description: 'Subscrição criada/atualizada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Remover subscrição de push notification',
    description: 'Remove uma subscrição de push notification do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Subscrição removida com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Listar subscrições do usuário',
    description: 'Retorna todas as subscrições de push notification do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de subscrições retornada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async getSubscriptions(@Req() req: any) {
    return await this.pushNotificationService.getUserSubscriptions(req.user);
  }

  /**
   * Endpoint para enviar notificação para todos os usuários de uma wallet
   * @param sendNotificationDto - Dados da notificação
   */
  @Post('send')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Enviar notificação para wallet',
    description: 'Envia uma notificação push para todos os usuários de uma wallet específica'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificação enviada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
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

  /**
   * Endpoint de teste para enviar notificação para todas as subscrições
   * Envia uma notificação de teste para todas as subscrições ativas no sistema
   * Endpoint PÚBLICO para facilitar testes (não requer autenticação)
   * @param testNotificationDto - Dados customizados da notificação (opcional)
   */
  @Post('test')
  @ApiOperation({ 
    summary: 'Enviar notificação de teste (PÚBLICO)',
    description: 'Envia uma notificação de teste para TODAS as subscrições ativas no sistema. Não requer autenticação. Permite customizar título, mensagem e URL de redirecionamento.'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificação de teste enviada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notificação de teste enviada com sucesso!' },
        total: { type: 'number', example: 5 },
        sent: { type: 'number', example: 5 },
        failed: { type: 'number', example: 0 },
        subscriptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              endpoint: { type: 'string', example: 'https://fcm.googleapis.com/fcm/send/...' },
              userAgent: { type: 'string', example: 'Mozilla/5.0...' },
              createdAt: { type: 'string', example: '2025-10-12T20:30:00.000Z' },
            },
          },
        },
      },
    },
  })
  async testNotification(
    @Body() testNotificationDto: TestNotificationDto,
  ) {
    return await this.pushNotificationService.sendTestNotification(
      testNotificationDto,
    );
  }
}
