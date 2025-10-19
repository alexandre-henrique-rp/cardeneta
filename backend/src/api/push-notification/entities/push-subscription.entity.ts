import { ApiProperty } from '@nestjs/swagger';

export class PushSubscriptionEntity {
  @ApiProperty({
    description: 'ID da subscrição',
    example: '12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '12345678-1234-1234-1234-123456789012',
  })
  userId: string;

  @ApiProperty({
    description: 'Endpoint da subscrição push',
    example: 'https://fcm.googleapis.com/fcm/send/...',
  })
  endpoint: string;

  @ApiProperty({
    description: 'Chave pública P256DH',
    example: 'BEl62iUYgUivxIkv69yViEuiBIa...',
  })
  p256dh: string;

  @ApiProperty({
    description: 'Chave de autenticação',
    example: 'R9sidzkcdf7h53v8ui9nkf==',
  })
  auth: string;

  @ApiProperty({
    description: 'User Agent do navegador',
    example: 'Mozilla/5.0...',
  })
  userAgent: string | null;

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
