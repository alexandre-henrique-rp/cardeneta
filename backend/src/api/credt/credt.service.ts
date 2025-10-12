import { Injectable, Logger } from '@nestjs/common';
import { CreateCredtDto } from './dto/create-credt.dto';
import { UpdateCredtDto } from './dto/update-credt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Payload } from 'src/auth/entities/payload.entity';
import { CredtEntity } from './entities/credt.entity';
import { CreditIdEntity } from './entities/credit.id.entity';
import { plainToClass } from 'class-transformer';
import { PushNotificationService } from '../../push-notification/push-notification.service';

@Injectable()
export class CredtService {
  private readonly logger = new Logger(CredtService.name, { timestamp: true });

  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async create(dados: CreateCredtDto, user: Payload): Promise<CredtEntity> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }

    const credito = await this.prisma.atm.create({
      data: {
        ...dados,
        type: 'Credito',
        userId: user.id,
      },
    });

    // Enviar notificação push para todos os usuários da wallet
    try {
      await this.pushNotificationService.sendNotificationToWalletUsers(
        dados.walletId,
        {
          title: 'Novo Crédito Registrado',
          message: `Um novo crédito de R$ ${dados.value.toFixed(2)} foi registrado${dados.nome ? ` - ${dados.nome}` : ''}.`,
          redirectUrl: `/conta/${credito.id}`,
          icon: '/pwa-192x192.png',
        },
      );
      this.logger.log(
        `Notificação enviada para wallet ${dados.walletId} sobre novo crédito ${credito.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para wallet ${dados.walletId}: ${error.message}`,
      );
      // Não lançar erro para não interromper o fluxo de criação do crédito
    }

    return plainToClass(CredtEntity, credito);
  }

  async findAll(user: Payload): Promise<CredtEntity[]> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }
    const creditos = await this.prisma.atm.findMany({
      where: {
        userId: user.id,
        type: 'Credito',
      },
      select: {
        id: true,
        value: true,
        type: true,
        userId: true,
        updatedAt: true,
      },
    });
    return creditos as CredtEntity[];
  }

  async findOne(id: string, user: Payload): Promise<CreditIdEntity> {
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }
    const credito = await this.prisma.atm.findUnique({
      where: {
        id: id,
        userId: user.id,
        type: 'Credito',
      },
      include: {
        user: true,
      },
    });
    return plainToClass(CreditIdEntity, credito);
  }

  async update(
    id: string,
    updateCredtDto: UpdateCredtDto,
  ): Promise<CredtEntity> {
    const UpdateCredt = await this.prisma.atm.update({
      where: {
        id: id,
      },
      data: updateCredtDto,
    });
    return plainToClass(CredtEntity, UpdateCredt);
  }

  async remove(id: string): Promise<string> {
    const exist = await this.prisma.atm.findUnique({
      where: {
        id: id,
      },
    });
    if (!exist) {
      throw new Error('Credito nao encontrado');
    }
    await this.prisma.atm.delete({
      where: {
        id: id,
      },
    });
    return 'Credito deletado com sucesso';
  }
}
