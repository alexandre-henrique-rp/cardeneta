import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindWalletDto {
  @ApiProperty({
    example: 1,
    description: 'Mês',
  })
  @IsNumber({}, { message: 'Mês deve ser um número' })
  mes: number;

  @ApiProperty({
    example: 2022,
    description: 'Ano',
  })
  @IsNumber({}, { message: 'Ano deve ser um número' })
  ano: number;
}
