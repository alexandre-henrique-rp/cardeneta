import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class RelatorioEntity {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do relatório',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: '100',
    description: 'Valor do relatório',
  })
  @IsNumber()
  @Transform(({ value }) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  )
  value: number;

  @ApiProperty({
    example: 'Credito',
    description: 'Tipo do transação',
  })
  @IsString()
  type: TypeAtm;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Ultima data de atualização',
  })
  @IsDate()
  updatedAt: Date;
}

export enum TypeAtm {
  Credito = 'Credito',
  Debito = 'Debito',
}
