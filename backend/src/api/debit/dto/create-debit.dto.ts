import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDebitDto {
  @ApiProperty({
    example: 'nome',
    description: 'Nome do crédito',
  })
  @IsString()
  @Type(() => String)
  @Transform(({ value }) => value.trim())
  nome: string;

  @ApiProperty({
    example: 100.01,
    description: 'Valor do crédito',
  })
  @IsNumber({}, { message: 'Valor do crédito deve ser um número' })
  @Min(0, { message: 'Valor do crédito deve ser maior que 0' })
  value: number;

  @ApiProperty({
    example: 'walletId',
    description: 'ID da carteira',
  })
  @IsString()
  @Type(() => String)
  walletId: string;

  @ApiProperty({
    example: 'açpiuypubçapibpiuyiu',
    description: 'ID da prova',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  proofId: string;

  @ApiProperty({
    example: 'dinheiro | cartão | pix | boleto | transferência',
    description: 'Tipo de pagamento',
  })
  @IsString()
  @Type(() => String)
  @Transform(({ value }) => value.trim().toUpperCase())
  typePayment: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de criação',
  })
  @IsDate()
  @Type(() => Date)
  createdPg: Date;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de vencimento',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDueDate: Date;

  @ApiProperty({
    example: '{ lat: -23.55052, lng: -46.63332 }',
    description: 'Localização',
  })
  @IsOptional()
  @Type(() => Object)
  @Transform(({ value }) => JSON.stringify(value))
  gps: any;

  @ApiProperty({
    example: 'America/Sao_Paulo',
    description: 'Fuso horário',
  })
  @IsString()
  @Type(() => String)
  @Transform(({ value }) => value.trim().toUpperCase())
  timezone: string;
}
