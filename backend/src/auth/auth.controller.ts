import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthEntity } from './entities/auth.entity';
import {
  ApiOperation,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Autenticação de usuário',
    description: 'Rotas especificas para autenticar um usuário',
    tags: ['Auth'],
  })
  @ApiBody({
    description: 'Autenticação de usuário',
    type: CreateAuthDto,
  })
  @ApiOkResponse({
    description: 'Autenticação realizada com sucesso',
    type: AuthEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
    type: Error,
  })
  async login(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.login(createAuthDto);
  }
}
