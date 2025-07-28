import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  UnauthorizedException,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ComprovanteService } from './comprovante.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ComprovanteEntity } from './entities/comprovante.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Payload } from 'src/auth/entities/payload.entity';
import * as fs from 'fs';

@Controller('comprovante')
export class ComprovanteController {
  constructor(private readonly comprovanteService: ComprovanteService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criação de comprovante',
    description: 'rota para criar um registro de comprovante',
    tags: ['Comprovante'],
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ type: ComprovanteEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const User = req.user as Payload;

    if (!file) {
      throw new BadRequestException('Arquivo não enviado.');
    }
    if (!User || !User.id) {
      throw new UnauthorizedException();
    }

    const data = {
      fileName: file.originalname,
      locale: file.path,
      mimeType: file.mimetype,
      userId: User.id,
    };
    console.log('🚀 ~ ComprovanteController ~ create ~ data:', data);

    return await this.comprovanteService.create(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listagem de comprovantes',
    description: 'rota para listar todos os comprovantes',
    tags: ['Comprovante'],
  })
  @ApiOkResponse({ type: ComprovanteEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  findAll(@Req() req: any) {
    return this.comprovanteService.findAll(req.user as Payload);
  }

  @Get('/preview/:id')
  @ApiOperation({
    summary: 'Preview de comprovante',
    description: 'rota para preview de comprovante',
    tags: ['Comprovante'],
  })
  @ApiOkResponse({ type: File })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async preview(@Param('id') id: string, @Res() res: any) {
    const comprovante = await this.comprovanteService.findOne(id);

    const image = fs.readFileSync(comprovante.locale);
    res.writeHead(200, {
      'Content-Type': comprovante.mimeType,
      'Content-Length': image.length,
    });
    return res.end(image);
  }

  @Get('/download/:id')
  @ApiOperation({
    summary: 'Download de comprovante',
    description: 'rota para download de comprovante',
    tags: ['Comprovante'],
  })
  @ApiOkResponse({ type: File })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async download(@Param('id') id: string, @Res() res: any) {
    const comprovante = await this.comprovanteService.findOne(id);

    const fileStream = fs.createReadStream(comprovante.locale);

    res.setHeader('Content-Type', comprovante.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${comprovante.fileName}"`,
    );

    fileStream.pipe(res);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleção de comprovante',
    description: 'rota para deletar um comprovante',
    tags: ['Comprovante'],
  })
  @ApiOkResponse({ type: String })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.comprovanteService.remove(id);
  }
}
