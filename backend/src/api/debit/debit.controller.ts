import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { DebitService } from './debit.service';
import { CreateDebitDto } from './dto/create-debit.dto';
import { UpdateDebitDto } from './dto/update-debit.dto';
import { Payload } from 'src/auth/entities/payload.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DebitEntity } from './entities/debit.entity';

@Controller('debit')
export class DebitController {
  constructor(private readonly debitService: DebitService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um novo Débito',
    description: 'Rotas especificas para cadastrar um novo Débito',
    tags: ['Débito'],
  })
  @ApiBody({ type: CreateDebitDto })
  @ApiOkResponse({ type: DebitEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  create(@Body() createDebitDto: CreateDebitDto, @Req() req: any) {
    return this.debitService.create(createDebitDto, req.user as Payload);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os Débitos',
    description: 'Rotas especificas para listar todos os Débitos',
    tags: ['Débito'],
  })
  @ApiOkResponse({ type: DebitEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findAll(@Req() req: any) {
    return this.debitService.findAll(req.user as Payload);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista um Débito',
    description: 'Rotas especificas para listar um Débito',
    tags: ['Débito'],
  })
  @ApiOkResponse({ type: DebitEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.debitService.findOne(id, req.user as Payload);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um Débito',
    description: 'Rotas especificas para atualizar um Débito',
    tags: ['Débito'],
  })
  @ApiOkResponse({ type: DebitEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateDebitDto: UpdateDebitDto) {
    return this.debitService.update(id, updateDebitDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta um Débito',
    description: 'Rotas especificas para deletar um Débito',
    tags: ['Débito'],
  })
  @ApiOkResponse({ type: String })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.debitService.remove(id);
  }
}
