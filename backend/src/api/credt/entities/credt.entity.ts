import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CredtEntity {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do crédito',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: '100',
    description: 'Valor do crédito',
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: 'Credito',
    description: 'Tipo do crédito',
  })
  @IsString()
  type: 'Credito' | 'Debito';

  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do usuário',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de criação',
  })
  @IsDate()
  @Exclude()
  createdAt: Date;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de atualização',
  })
  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<CredtEntity>) {
    Object.assign(this, partial);
  }
}
