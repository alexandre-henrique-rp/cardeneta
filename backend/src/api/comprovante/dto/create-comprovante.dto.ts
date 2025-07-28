import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComprovanteDto {
  @ApiProperty({
    example: 'comprovante.png',
    description: 'Nome do arquivo',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'files/comprovante.png',
    description: 'Local do arquivo',
  })
  @IsString()
  locale: string;

  @ApiProperty({
    example: 'image/png',
    description: 'Tipo do arquivo',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do usuário',
  })
  @IsString()
  userId: string;
}
