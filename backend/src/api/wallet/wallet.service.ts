import { Injectable, Logger } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Payload } from 'src/auth/entities/payload.entity';
import { WalletEntity } from './entities/wallet.entity';
import { FindWalletDto } from './dto/find-wallet.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(WalletService.name, { timestamp: true });
  async create(dados: CreateWalletDto, user: Payload): Promise<WalletEntity> {
    if (!user?.id) {
      throw new Error('Usuário não autenticado ou ID do usuário ausente.');
    }

    const carteira = await this.prisma.wallet.create({
      data: {
        name: dados.name, // Mapeamento explícito do campo name
        userWallets: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        userWallets: {
          include: {
            user: true,
          },
        },
      },
    });

    // Mapeia o resultado para a entidade
    return plainToClass(WalletEntity, {
      ...carteira,
      users: carteira.userWallets.map((uw) => uw.user),
    });
  }

  async findOne(id: string, user: Payload, data: FindWalletDto) {
    const { mes, ano } = data;
    // pegar o primeiro dia do mes e o ultimo dia do mes
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0);

    // Verificar se o usuário tem acesso à carteira (exceto para id "0" que busca todas as carteiras do usuário)
    if (id !== '0') {
      const hasAccess = await this.prisma.userWallet.findFirst({
        where: {
          walletId: id,
          userId: user.id,
        },
      });

      if (!hasAccess) {
        throw new Error('Usuário não tem acesso a esta carteira');
      }
    }

    // Se id for "0", buscar ATMs de todas as carteiras do usuário
    const whereCondition =
      id === '0'
        ? {
            userId: user.id,
            status: true,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {
            walletId: id,
            status: true,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          };

    const carteira = await this.prisma.atm.findMany({
      where: whereCondition,
    });

    const currentBalance = carteira.reduce((acc, atm) => {
      if (atm.type === 'Credito') {
        return acc + atm.value;
      } else {
        return acc - atm.value;
      }
    }, 0);

    const dataRetorno = {
      id: id,
      atms: carteira.map((atm) => ({
        id: atm.id,
        name: atm.nome,
        value: atm.value,
        type: atm.type,
        typePayment: atm.typePayment,
        statusPg: atm.statusPg || '',
        createdAt: atm.createdAt.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      })),
      currentBalance,
      timeRange: `${startDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })} - ${endDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`,
    };
    return dataRetorno;
  }

  async update(id: string, updateWalletDto: UpdateWalletDto, user: Payload) {
    await this.prisma.wallet.update({
      where: {
        id,
        userWallets: {
          some: {
            userId: user.id,
          },
        },
      },
      data: updateWalletDto,
    });
  }

  async remove(id: string, user: Payload): Promise<string> {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id,
        userWallets: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    await this.prisma.trash.create({
      data: {
        object: JSON.stringify(wallet),
        userId: user.id,
      },
    });

    await this.prisma.wallet.delete({
      where: {
        id,
        userWallets: {
          some: {
            userId: user.id,
          },
        },
      },
    });
    return 'Carteira deletada com sucesso';
  }
}
