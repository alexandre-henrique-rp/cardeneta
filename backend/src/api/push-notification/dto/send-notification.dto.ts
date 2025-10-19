import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    description: 'ID da subscrição para enviar a notificação',
    example: '12345678-1234-1234-1234-123456789012',
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova transação',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Corpo da notificação',
    example: 'Você recebeu um novo crédito de R$ 100,00',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Dados adicionais da notificação (JSON)',
    example: { transactionId: 'abc123', amount: 100 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  @Type(() => Object)
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Data e hora agendada para envio (ISO 8601)',
    example: '2025-10-20T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
