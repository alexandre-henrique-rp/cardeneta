import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as webPush from 'web-push';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class PushNotificationService {
  constructor(private prisma: PrismaService) {
    // Configurar VAPID keys do web-push
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }
  }

  /**
   * Retorna a chave pública VAPID
   */
  getVapidPublicKey() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      throw new BadRequestException(
        'Chave pública VAPID não configurada. Execute: npx web-push generate-vapid-keys',
      );
    }

    return { publicKey };
  }

  /**
   * Cria uma nova subscrição de push notification para um usuário
   */
  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    // Verificar se já existe uma subscrição com este endpoint
    const existingSubscription = await this.prisma.pushSubscription.findUnique(
      {
        where: { endpoint: dto.endpoint },
      },
    );

    if (existingSubscription) {
      // Se já existe, apenas atualiza
      return this.prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dh: dto.p256dh,
          auth: dto.auth,
          userAgent: dto.userAgent,
        },
      });
    }

    // Criar nova subscrição
    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
        userAgent: dto.userAgent,
      },
    });
  }

  /**
   * Lista todas as subscrições de um usuário
   */
  async getUserSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Remove uma subscrição
   */
  async deleteSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.pushSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscrição não encontrada');
    }

    await this.prisma.pushSubscription.delete({
      where: { id: subscriptionId },
    });

    return { message: 'Subscrição removida com sucesso' };
  }

  /**
   * Envia uma notificação push
   */
  async sendNotification(dto: SendNotificationDto) {
    // Buscar a subscrição
    const subscription = await this.prisma.pushSubscription.findUnique({
      where: { id: dto.subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscrição não encontrada');
    }

    // Criar registro da notificação no banco
    const notification = await this.prisma.pushNotification.create({
      data: {
        subscriptionId: dto.subscriptionId,
        title: dto.title,
        body: dto.body,
        data: dto.data || {},
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        status: 'PENDING',
      },
    });

    // Se tem data agendada, não envia agora
    if (dto.scheduledAt && new Date(dto.scheduledAt) > new Date()) {
      return notification;
    }

    // Enviar notificação imediatamente
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };

      const payload = JSON.stringify({
        title: dto.title,
        body: dto.body,
        data: dto.data,
      });

      await webPush.sendNotification(pushSubscription, payload);

      // Atualizar status como enviado
      return this.prisma.pushNotification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    } catch (error) {
      // Atualizar status como falha
      await this.prisma.pushNotification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw new BadRequestException(`Erro ao enviar notificação: ${error.message}`);
    }
  }

  /**
   * Lista todas as notificações de uma subscrição
   */
  async getSubscriptionNotifications(subscriptionId: string) {
    const subscription = await this.prisma.pushSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscrição não encontrada');
    }

    return this.prisma.pushNotification.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lista todas as notificações de um usuário
   */
  async getUserNotifications(userId: string) {
    return this.prisma.pushNotification.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marca uma notificação como recebida/entregue
   */
  async markAsDelivered(notificationId: string) {
    const notification = await this.prisma.pushNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.pushNotification.update({
      where: { id: notificationId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }
}
