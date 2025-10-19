import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { PushNotificationEntity } from './entities/push-notification.entity';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { PushNotificationService } from './push-notification.service';

@ApiTags('Push Notifications')
@Controller('push-notifications')
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  // ============================================
  // ROTAS PÚBLICAS (sem autenticação)
  // Necessárias para service workers
  // ============================================

  @Get('vapid-public-key')
  @ApiOperation({
    summary: 'Obter chave pública VAPID',
    description:
      'Retorna a chave pública VAPID necessária para subscrever notificações push no frontend. Esta rota é pública.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chave pública VAPID',
    schema: {
      type: 'object',
      properties: {
        publicKey: {
          type: 'string',
          example: 'BEl62iUYgUivxIkv69yViEuiBIa...',
        },
      },
    },
  })
  async getVapidPublicKey() {
    return this.pushNotificationService.getVapidPublicKey();
  }

  @Patch('notifications/:id/delivered')
  @ApiOperation({
    summary: 'Marcar notificação como recebida (Pública)',
    description:
      'Atualiza o status da notificação para DELIVERED e registra a data de recebimento. Esta rota é pública para permitir que service workers confirmem o recebimento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificação marcada como recebida',
    type: PushNotificationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notificação não encontrada',
  })
  async markAsDelivered(@Param('id') id: string) {
    return this.pushNotificationService.markAsDelivered(id);
  }

  // ============================================
  // ROTAS AUTENTICADAS
  // Requerem Bearer Token JWT
  // ============================================

  @Post('subscriptions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar subscrição de push notification',
    description:
      'Registra uma nova subscrição de push notification para o usuário autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscrição criada com sucesso',
    type: PushSubscriptionEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async createSubscription(
    @Req() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.pushNotificationService.createSubscription(
      req.user.sub,
      createSubscriptionDto,
    );
  }

  @Get('subscriptions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar subscrições do usuário',
    description: 'Retorna todas as subscrições de push notification do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de subscrições',
    type: [PushSubscriptionEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getUserSubscriptions(@Req() req: any) {
    return this.pushNotificationService.getUserSubscriptions(req.user.sub);
  }

  @Delete('subscriptions/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover subscrição',
    description: 'Remove uma subscrição de push notification do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscrição removida com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscrição não encontrada',
  })
  async deleteSubscription(@Req() req: any, @Param('id') id: string) {
    return this.pushNotificationService.deleteSubscription(req.user.sub, id);
  }

  @Post('send')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar notificação push',
    description:
      'Envia uma notificação push para uma subscrição específica. Se scheduledAt for fornecido e for uma data futura, a notificação será agendada.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificação enviada ou agendada com sucesso',
    type: PushNotificationEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao enviar notificação',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscrição não encontrada',
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.pushNotificationService.sendNotification(sendNotificationDto);
  }

  @Get('subscriptions/:subscriptionId/notifications')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar notificações de uma subscrição',
    description: 'Retorna todas as notificações enviadas para uma subscrição',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações',
    type: [PushNotificationEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscrição não encontrada',
  })
  async getSubscriptionNotifications(
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.pushNotificationService.getSubscriptionNotifications(
      subscriptionId,
    );
  }

  @Get('notifications')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todas as notificações do usuário',
    description:
      'Retorna todas as notificações enviadas para o usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações',
    type: [PushNotificationEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async getUserNotifications(@Req() req: any) {
    return this.pushNotificationService.getUserNotifications(req.user.sub);
  }
}
