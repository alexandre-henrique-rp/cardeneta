import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaldoEntity {
  @ApiProperty({
    example: 'R$ 100',
    description: 'Saldo do caixa',
  })
  @IsNumber()
  @Transform(({ value }) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  )
  saldo: number;
}
