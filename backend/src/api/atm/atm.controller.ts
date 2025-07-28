import { Controller, Get, Post, Body, Req, Param, Patch, Delete } from '@nestjs/common';
import { AtmService } from './atm.service';
import { CreateAtmDto } from './dto/create-atm.dto';
import { UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RelatorioEntity } from './entities/relatorio.entity';
import { Payload } from 'src/auth/entities/payload.entity';
import { SaldoEntity } from './entities/saldo.entity';

@Controller('atm')
export class AtmController {
  constructor(private readonly atmService: AtmService) {}

  @Post('relatorio')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Relatório de Caixa',
    description: 'Relatorio de movimentação por período',
    tags: ['Caixa'],
  })
  @ApiBody({
    description: 'período inicial e final, para gerar relatório',
    type: CreateAtmDto,
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: [RelatorioEntity],
    description: 'Relatório de Caixa',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  relatorio(
    @Body() dados: CreateAtmDto,
    @Req() req: any,
  ): Promise<RelatorioEntity[]> {
    return this.atmService.Relatorio(dados, req.user as Payload);
  }

  @Get('saldo')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Saldo do caixa',
    description: 'Saldo do caixa',
    tags: ['Caixa'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: SaldoEntity,
    description: 'Saldo do caixa',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  saldo(@Req() req: any): Promise<SaldoEntity> {
    return this.atmService.saldo(req.user as Payload);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Saldo do caixa',
    description: 'Saldo do caixa',
    tags: ['Caixa'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: SaldoEntity,
    description: 'Saldo do caixa',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  atmGetById(@Param('id') id: string) {
    return this.atmService.atmGetById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Saldo do caixa',
    description: 'Saldo do caixa',
    tags: ['Caixa'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: SaldoEntity,
    description: 'Saldo do caixa',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  atmPatchById(@Param('id') id: string, @Body() data: any) {
    return this.atmService.atmPatchById(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Saldo do caixa',
    description: 'Saldo do caixa',
    tags: ['Caixa'],
  })
  @ApiUnauthorizedResponse({
    type: Error,
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    type: SaldoEntity,
    description: 'Saldo do caixa',
  })
  @ApiForbiddenResponse({
    type: Error,
    description: 'Forbidden',
  })
  atmDeleteById(@Param('id') id: string) {
    return this.atmService.atmDeleteById(id);
  }
}
