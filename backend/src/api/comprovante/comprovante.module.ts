import { Module } from '@nestjs/common';
import { ComprovanteService } from './comprovante.service';
import { ComprovanteController } from './comprovante.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // 1. Define o diretório de destino dos arquivos
        destination: './files', // Certifique-se que este diretório existe

        // 2. Define como o nome do arquivo será gerado
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          const filename = `${uniqueSuffix}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [ComprovanteController],
  providers: [ComprovanteService],
})
export class ComprovanteModule {}
