import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

/**
 * DTO para relatório de caixa
 * @property {Date} dataInicio - ex: '2025-01-01' - Data de início
 * @property {Date} dataFim - ex: '2025-01-01' - Data de fim
 */
export class CreateAtmDto {
  @ApiProperty({ example: '2025-01-01', description: 'Data de início' })
  @IsDate()
  dataInicio: Date;

  @ApiProperty({ example: '2025-01-01', description: 'Data de fim' })
  @IsDate()
  dataFim: Date;
}
