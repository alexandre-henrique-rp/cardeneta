import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CredtService } from './credt.service';
import { CreateCredtDto } from './dto/create-credt.dto';
import { UpdateCredtDto } from './dto/update-credt.dto';
import { Payload } from 'src/auth/entities/payload.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CredtEntity } from './entities/credt.entity';
import { CreditIdEntity } from './entities/credit.id.entity';

@Controller('credt')
export class CredtController {
  constructor(private readonly credtService: CredtService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criação de crédito',
    description: 'rota para criar um registro de crédito',
    tags: ['Credito'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: CredtEntity,
    description: 'Credito criado com sucesso',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  @ApiBody({
    type: CreateCredtDto,
    description: 'Credito a ser criado',
  })
  create(@Body() createCredtDto: CreateCredtDto, @Req() req: any) {
    return this.credtService.create(createCredtDto, req.user as Payload);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listagem de créditos',
    description: 'rota para listar todos os créditos',
    tags: ['Credito'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: [CredtEntity],
    description: 'Credito listado com sucesso',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  findAll(@Req() req: any) {
    return this.credtService.findAll(req.user as Payload);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listagem de créditos',
    description: 'rota para listar um crédito por id',
    tags: ['Credito'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: CreditIdEntity,
    description: 'Credito listado com sucesso',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.credtService.findOne(id, req.user as Payload);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualização de crédito',
    description: 'rota para atualizar um crédito por id',
    tags: ['Credito'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: CredtEntity,
    description: 'Credito atualizado com sucesso',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  @ApiBody({
    type: UpdateCredtDto,
    description: 'Credito a ser atualizado',
  })
  update(@Param('id') id: string, @Body() updateCredtDto: UpdateCredtDto) {
    return this.credtService.update(id, updateCredtDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleção de crédito',
    description: 'rota para deletar um crédito por id',
    tags: ['Credito'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: String,
    description: 'Credito deletado com sucesso',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  remove(@Param('id') id: string) {
    return this.credtService.remove(id);
  }
}
