import { Injectable } from '@nestjs/common';
import { CreateComprovanteDto } from './dto/create-comprovante.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Payload } from 'src/auth/entities/payload.entity';
import { ComprovanteEntity } from './entities/comprovante.entity';
import * as fs from 'fs';

@Injectable()
export class ComprovanteService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dados: CreateComprovanteDto): Promise<ComprovanteEntity> {
    const file = await this.prisma.proof.create({
      data: dados,
    });
    return file as ComprovanteEntity;
  }

  async findAll(user: Payload): Promise<ComprovanteEntity[]> {
    const files = await this.prisma.proof.findMany({
      where: {
        userId: user.id,
      },
    });
    return files as ComprovanteEntity[];
  }

  /**
   * Busca um comprovante específico por ID e usuário
   * @param id - ID do comprovante a ser buscado
   * @param user - Dados do usuário autenticado
   * @returns Promise<ComprovanteEntity> - Comprovante encontrado
   * @throws Error se o usuário não estiver autenticado ou comprovante não for encontrado
   */
  async findOne(id: string): Promise<ComprovanteEntity> {
    // Validação do ID do comprovante
    if (!id || typeof id !== 'string') {
      throw new Error(
        'ID do comprovante é obrigatório e deve ser uma string válida',
      );
    }

    const file = await this.prisma.proof.findUnique({
      where: {
        id,
      },
    });

    // Validação se o comprovante foi encontrado
    if (!file) {
      throw new Error(
        `Comprovante com ID '${id}' não encontrado ou você não tem permissão para acessá-lo`,
      );
    }

    return file as ComprovanteEntity;
  }

  async remove(id: string) {
    const exist = await this.prisma.proof.findUnique({
      where: {
        id,
      },
    });
    if (!exist || !exist.locale) {
      throw new Error('Comprovante nao encontrado');
    }
    //excluir o arquivo
    fs.unlinkSync(exist.locale);
    await this.prisma.proof.delete({
      where: {
        id,
      },
    });
    return 'Comprovante deletado com sucesso';
  }
}
