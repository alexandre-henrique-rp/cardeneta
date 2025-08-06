import { Injectable } from '@nestjs/common';
import { CreateDebitDto } from './dto/create-debit.dto';
import { UpdateDebitDto } from './dto/update-debit.dto';
import { Payload } from 'src/auth/entities/payload.entity';
import { DebitEntity } from './entities/debit.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebitIdEntity } from './entities/debit.id.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DebitService {
  constructor(private prisma: PrismaService) {}
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
