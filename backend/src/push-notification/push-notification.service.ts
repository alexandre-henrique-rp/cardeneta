import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import * as webpush from 'web-push';
import { Payload } from 'src/auth/entities/payload.entity';

/**
 * Interface para definir os dados de uma notificação push
 */
interface PushNotificationData {
  title: string;
  message: string;
  redirectUrl?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name, {
    timestamp: true,
  });

  constructor(private prisma: PrismaService) {
    // Configurar VAPID keys (você deve gerar essas chaves e armazená-las em variáveis de ambiente)
    const vapidPublicKey =
      process.env.VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    const vapidPrivateKey =
      process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';
    const vapidSubject =
      process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org';

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  /**
   * Cria ou atualiza uma subscrição de push notification para um usuário
   * @param dados - Dados da subscrição (endpoint, chaves p256dh e auth)
   * @param user - Dados do usuário autenticado
   * @returns A subscrição criada ou atualizada
   */
  async createSubscription(dados: CreateSubscriptionDto, user: Payload) {
    try {
      // Validar que o userId existe
      if (!user.id) {
        throw new Error('ID do usuário não encontrado');
      }

      // Verificar se já existe uma subscrição com este endpoint
      const existingSubscription =
        await this.prisma.pushSubscription.findUnique({
          where: { endpoint: dados.endpoint },
        });

      if (existingSubscription) {
        // Atualizar subscrição existente
        return await this.prisma.pushSubscription.update({
          where: { endpoint: dados.endpoint },
          data: {
            p256dh: dados.p256dh,
            auth: dados.auth,
            userAgent: dados.userAgent || null,
            userId: user.id,
          },
        });
      }

      // Criar nova subscrição
      return await this.prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: dados.endpoint,
          p256dh: dados.p256dh,
          auth: dados.auth,
          userAgent: dados.userAgent || null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Erro ao criar subscrição: ${error.message}`,
        error.stack,
      );
      throw new Error('Erro ao criar subscrição de notificação');
    }
  }

  /**
   * Remove uma subscrição de push notification
   * @param endpoint - Endpoint da subscrição a ser removida
   * @param user - Dados do usuário autenticado
   */
  async removeSubscription(endpoint: string, user: Payload) {
    try {
      await this.prisma.pushSubscription.deleteMany({
        where: {
          endpoint,
          userId: user.id,
        },
      });
      return { message: 'Subscrição removida com sucesso' };
    } catch (error) {
      this.logger.error(
        `Erro ao remover subscrição: ${error.message}`,
        error.stack,
      );
      throw new Error('Erro ao remover subscrição de notificação');
    }
  }

  /**
   * Função genérica para enviar notificações push
   * Pode ser reutilizada em diferentes contextos do sistema
   * 
   * @param walletId - ID da wallet para identificar os usuários que devem receber a notificação
   * @param notificationData - Dados da notificação (título, mensagem, URL de redirecionamento, etc)
   * @returns Objeto com estatísticas do envio (total, sucessos, falhas)
   */
  async sendNotificationToWalletUsers(
    walletId: string,
    notificationData: PushNotificationData,
  ) {
    try {
      // Buscar todos os usuários associados à wallet
      const userWallets = await this.prisma.userWallet.findMany({
        where: { walletId },
        include: {
          user: {
            include: {
              pushSubscriptions: true,
            },
          },
        },
      });

      if (userWallets.length === 0) {
        this.logger.warn(
          `Nenhum usuário encontrado para a wallet ${walletId}`,
        );
        return {
          total: 0,
          success: 0,
          failed: 0,
        };
      }

      // Coletar todas as subscrições de todos os usuários
      const subscriptions = userWallets.flatMap(
        (uw) => uw.user.pushSubscriptions,
      );

      if (subscriptions.length === 0) {
        this.logger.warn(
          `Nenhuma subscrição encontrada para usuários da wallet ${walletId}`,
        );
        return {
          total: 0,
          success: 0,
          failed: 0,
        };
      }

      // Preparar payload da notificação
      const payload = JSON.stringify({
        title: notificationData.title || 'Cardeneta App',
        body: notificationData.message,
        icon: notificationData.icon || '/pwa-192x192.png',
        badge: notificationData.badge || '/pwa-192x192.png',
        data: {
          url: notificationData.redirectUrl || '/',
          ...notificationData.data,
        },
      });

      // Enviar notificações para todas as subscrições
      let successCount = 0;
      let failedCount = 0;

      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
          successCount++;
          this.logger.log(
            `Notificação enviada com sucesso para ${subscription.endpoint}`,
          );
        } catch (error) {
          failedCount++;
          this.logger.error(
            `Erro ao enviar notificação para ${subscription.endpoint}: ${error.message}`,
          );

          // Se o erro for 410 (Gone), remover a subscrição
          if (error.statusCode === 410) {
            await this.prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
            this.logger.log(
              `Subscrição removida (endpoint não mais válido): ${subscription.endpoint}`,
            );
          }
        }
      });

      await Promise.all(sendPromises);

      return {
        total: subscriptions.length,
        success: successCount,
        failed: failedCount,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificações: ${error.message}`,
        error.stack,
      );
      throw new Error('Erro ao enviar notificações push');
    }
  }

  /**
   * Obtém todas as subscrições de um usuário
   * @param user - Dados do usuário autenticado
   * @returns Lista de subscrições do usuário
   */
  async getUserSubscriptions(user: Payload) {
    return await this.prisma.pushSubscription.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        endpoint: true,
        userAgent: true,
        createdAt: true,
      },
    });
  }

  /**
   * Obtém a chave pública VAPID para o frontend
   * @returns Chave pública VAPID
   */
  getVapidPublicKey(): string {
    return (
      process.env.VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
    );
  }
}
