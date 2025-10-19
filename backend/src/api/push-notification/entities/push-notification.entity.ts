import { ApiProperty } from '@nestjs/swagger';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export class PushNotificationEntity {
  @ApiProperty({
    description: 'ID da notificação',
    example: '12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'ID da subscrição',
    example: '12345678-1234-1234-1234-123456789012',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova transação',
  })
  title: string;

  @ApiProperty({
    description: 'Corpo da notificação',
    example: 'Você recebeu um novo crédito de R$ 100,00',
  })
  body: string;

  @ApiProperty({
    description: 'Dados adicionais da notificação',
    example: { transactionId: 'abc123', amount: 100 },
  })
  data: any;

  @ApiProperty({
    description: 'Data e hora agendada para envio',
    example: '2025-10-20T10:00:00Z',
  })
  scheduledAt: Date | null;

  @ApiProperty({
    description: 'Data e hora de envio',
    example: '2025-10-19T10:00:00Z',
  })
  sentAt: Date | null;

  @ApiProperty({
    description: 'Data e hora de recebimento',
    example: '2025-10-19T10:00:05Z',
  })
  deliveredAt: Date | null;

  @ApiProperty({
    description: 'Status da notificação',
    enum: NotificationStatus,
    example: NotificationStatus.SENT,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'Mensagem de erro (se houver)',
    example: 'Subscription has expired',
  })
  errorMessage: string | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-10-19T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-10-19T10:00:00Z',
  })
  updatedAt: Date;
}
