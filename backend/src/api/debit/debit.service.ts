import { Injectable, Logger } from '@nestjs/common';
import { CreateDebitDto } from './dto/create-debit.dto';
import { UpdateDebitDto } from './dto/update-debit.dto';
import { Payload } from 'src/auth/entities/payload.entity';
import { DebitEntity } from './entities/debit.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebitIdEntity } from './entities/debit.id.entity';
import { plainToClass } from 'class-transformer';
import { PushNotificationService } from '../../push-notification/push-notification.service';

@Injectable()
export class DebitService {
  private readonly logger = new Logger(DebitService.name, { timestamp: true });

  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) {}
  async create(dados: CreateDebitDto, user: Payload): Promise<DebitEntity> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }

    const debito = await this.prisma.atm.create({
      data: {
        ...dados,
        type: 'Debito',
        userId: user.id,
      },
    });

    // Enviar notificação push para todos os usuários da wallet
    try {
      await this.pushNotificationService.sendNotificationToWalletUsers(
        dados.walletId,
        {
          title: 'Novo Débito Registrado',
          message: `Um novo débito de R$ ${dados.value.toFixed(2)} foi registrado${dados.nome ? ` - ${dados.nome}` : ''}.`,
          redirectUrl: `/conta/${debito.id}`,
          icon: '/pwa-192x192.png',
        },
      );
      this.logger.log(
        `Notificação enviada para wallet ${dados.walletId} sobre novo débito ${debito.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para wallet ${dados.walletId}: ${error.message}`,
      );
      // Não lançar erro para não interromper o fluxo de criação do débito
    }

    return debito as DebitEntity;
  }

  async findAll(user: Payload): Promise<DebitEntity[]> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }
    const debitos = await this.prisma.atm.findMany({
      where: {
        userId: user.id,
        type: 'Debito',
      },
      select: {
        id: true,
        value: true,
        type: true,
        userId: true,
        updatedAt: true,
        statusPg: true,
      },
    });
    return debitos as DebitEntity[];
  }

  async findOne(id: string, user: Payload): Promise<DebitIdEntity> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }
    const debito = await this.prisma.atm.findUnique({
      where: {
        id: id,
        userId: user.id,
        type: 'Debito',
      },
      include: {
        user: true,
      },
    });
    return plainToClass(DebitIdEntity, debito);
  }

  async update(id: string, dados: UpdateDebitDto): Promise<DebitEntity> {
    const debito = await this.prisma.atm.update({
      where: {
        id: id,
      },
      data: dados,
    });
    return plainToClass(DebitEntity, debito);
  }

  async remove(id: string): Promise<string> {
    const exist = await this.prisma.atm.findUnique({
      where: {
        id: id,
      },
    });
    if (!exist) {
      throw new Error('Débito nao encontrado');
    }
    await this.prisma.atm.delete({
      where: {
        id: id,
      },
    });
    return 'Débito deletado com sucesso';
  }
}
