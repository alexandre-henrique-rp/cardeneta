import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo Usuario',
    description: 'Rotas especificas para cadastrar um novo usuário',
    tags: ['Usuário'],
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: '{"message": "Unauthorized"}',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    example: '{"message": "Forbidden"}',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os Usuários',
    description: 'Rotas especificas para listar todos os usuários',
    tags: ['Usuário'],
  })
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: '{"message": "Unauthorized"}',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    example: '{"message": "Forbidden"}',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um Usuario',
    description: 'Rotas especificas para buscar um usuário com base no id',
    tags: ['Usuário'],
  })
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: '{"message": "Unauthorized"}',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    example: '{"message": "Forbidden"}',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um Usuario',
    description: 'Rotas especificas para atualizar um usuário com base no id',
    tags: ['Usuário'],
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: '{"message": "Unauthorized"}',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    example: '{"message": "Forbidden"}',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta um Usuario',
    description: 'Rotas especificas para deletar um usuário com base no id',
    tags: ['Usuário'],
  })
  @ApiOkResponse({ type: String })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: '{"message": "Unauthorized"}',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    example: '{"message": "Forbidden"}',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
