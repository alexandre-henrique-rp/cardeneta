import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UserService } from 'src/api/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  async login(dados: CreateAuthDto) {
    const user = await this.userService.getEmail(dados.email);
    if (!user || !user.name) {
      this.logger.error('Usuario nao encontrado');
      throw new HttpException('Usuario nao encontrado ou não cadastrado', 401);
    }
    const senhaValida = await bcrypt.compare(dados.senha, user.senhaHash);
    if (!senhaValida) {
      this.logger.error('Senha invalida');
      throw new HttpException('Usuario ou senha inválidos', 401);
    }
    const token = this.jwtService.sign({ id: user.id });

    // data e hora que expira o token
    const expiresAtTimestamp = this.jwtService.decode(token).exp;
    const expiresAt = new Date(expiresAtTimestamp * 1000);
    this.logger.warn('Token expira em:', expiresAt);

    const userWallets = await this.prisma.wallet.findMany({
      where: {
        userWallets: {
          some: {
            userId: user.id,
          },
        },
      },
    });
    const DataRetorno = {
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        Wallets: userWallets,
      },
    };
    console.log('🚀 ~ AuthService ~ login ~ DataRetorno:', DataRetorno);

    return DataRetorno;
  }
}
