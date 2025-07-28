import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class DebitEntity {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do débito',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'R$ 100,00',
    description: 'Valor do débito',
  })
  @IsNumber()
  @Transform(({ value }) =>
    Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  )
  value: number;

  @ApiProperty({
    example: 'Debito',
    description: 'Tipo do débito',
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
    description: 'Data de atualização',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    example: 'Pendente',
    description: 'Status do débito',
  })
  @IsString()
  statusPg: string;

  constructor(partial: Partial<DebitEntity>) {
    Object.assign(this, partial);
  }
}
