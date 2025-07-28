import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAtmDto } from './dto/create-atm.dto';
import { RelatorioEntity } from './entities/relatorio.entity';

import { Payload } from 'src/auth/entities/payload.entity';
import { SaldoEntity } from './entities/saldo.entity';

@Injectable()
export class AtmService {
  constructor(private prisma: PrismaService) {}

  async Relatorio(
    dados: CreateAtmDto,
    user: Payload,
  ): Promise<RelatorioEntity[]> {
    const relatorio = await this.prisma.atm.findMany({
      where: {
        updatedAt: {
          gte: dados.dataInicio,
          lte: dados.dataFim,
        },
        userId: user.id,
      },
      select: {
        id: true,
        value: true,
        type: true,
        updatedAt: true,
      },
    });
    return relatorio as RelatorioEntity[];
  }

  async saldo(user: Payload): Promise<SaldoEntity> {
    const saldo = await this.prisma.atm.findMany({
      where: {
        userId: user.id,
      },
      select: {
        value: true,
        type: true,
      },
    });
    const saldoTotal = saldo.reduce((acc, atm) => {
      if (atm.type === 'Credito') {
        return acc + atm.value;
      } else {
        return acc - atm.value;
      }
    }, 0);

    return { saldo: saldoTotal } as SaldoEntity;
  }

  async atmGetById(id: string) {
    const atm = await this.prisma.atm.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        wallet: true,
        proof: true,
      },
    });
    return atm;
  }

  async atmPatchById(id: string, data: any) {
    const atm = await this.prisma.atm.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
    });
    return atm;
  }

  async atmDeleteById(id: string) {
    await this.prisma.atm.delete({
      where: {
        id: id,
      },
    });
    return 'Atm deletado com sucesso';
  }
}
