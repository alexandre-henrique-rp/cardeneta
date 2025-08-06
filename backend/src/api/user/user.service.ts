import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(UserService.name, { timestamp: true });

  async create(dados: CreateUserDto): Promise<UserEntity> {
    const exist = await this.existsEmail(dados.email);
    if (exist) {
      this.logger.debug('Email ja cadastrado');
      throw new HttpException('Email ja cadastrado', 400);
    }
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const user = await this.prisma.user.create({
      data: {
        ...dados,
        senhaHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return plainToClass(UserEntity, user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map((user) => plainToClass(UserEntity, user));
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userWallets: {
          include: {
            wallet: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: {
            wallet: {
              createdAt: 'asc',
            },
          },
        },
      },
    });
    if (!user) {
      this.logger.debug('Usuario nao encontrado');
      throw new HttpException('Usuario nao encontrado', 404);
    }
    const dataReturn = {
      ...user,
      Wallets: user.userWallets.map((wallet) => wallet.wallet),
    };
    return plainToClass(UserEntity, dataReturn);
  }

  async update(id: string, dados: UpdateUserDto): Promise<UserEntity> {
    const user = await this.existsId(id);
    if (!user) {
      this.logger.debug('Usuario nao encontrado');
      throw new HttpException('Usuario nao encontrado', 404);
    }
    const { NewWalletId, ...rest } = dados;
    if (NewWalletId) {
      await this.prisma.userWallet.create({
        data: {
          userId: id,
          walletId: NewWalletId,
        },
      });
    }
    if (!rest) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return plainToClass(UserEntity, user);
    }
    const userUpdate = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.senha && {
          senhaHash: await bcrypt.hash(rest.senha, 10),
          senha: rest.senha,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return plainToClass(UserEntity, userUpdate);
  }

  async remove(id: string): Promise<string> {
    const user = await this.existsId(id);
    if (!user) {
      this.logger.debug('Usuario nao encontrado');
      throw new HttpException('Usuario nao encontrado', 404);
    }
    await this.prisma.user.delete({ where: { id } });
    return 'Usuario deletado com sucesso';
  }

  async existsId(id: string): Promise<boolean> {
    return (await this.prisma.user.count({ where: { id } })) > 0;
  }

  async existsEmail(email: string): Promise<boolean> {
    return (await this.prisma.user.count({ where: { email } })) > 0;
  }

  async getEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: { userWallets: { include: { wallet: true } } },
      });
    } catch {
      this.logger.debug('Usuario nao encontrado');
      throw new HttpException('Usuário não encontrado', 404);
    }
  }
}
