import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ComprovanteEntity {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do comprovante',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'comprovante.pdf',
    description: 'Nome do arquivo do comprovante',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'comprovante.pdf',
    description: 'Nome do arquivo do comprovante',
  })
  @IsString()
  locale: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'Tipo do arquivo do comprovante',
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
