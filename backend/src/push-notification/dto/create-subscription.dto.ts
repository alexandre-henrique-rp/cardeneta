import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO para criação de subscrição de push notification
 * Contém os dados necessários para registrar um dispositivo para receber notificações push
 */
export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Endpoint da subscrição',
    example: 'https://fcm.googleapis.com/fcm/send/...',
    required: true,
  })
  @IsNotEmpty({ message: 'O endpoint é obrigatório' })
  @IsString({ message: 'O endpoint deve ser uma string' })
  endpoint: string;

  @ApiProperty({
    description: 'Chave p256dh da subscrição',
    example: '...',
    required: true,
  })
  @IsNotEmpty({ message: 'A chave p256dh é obrigatória' })
  @IsString({ message: 'A chave p256dh deve ser uma string' })
  p256dh: string;

  @ApiProperty({
    description: 'Chave auth da subscrição',
    example: '...',
    required: true,
  })
  @IsNotEmpty({ message: 'A chave auth é obrigatória' })
  @IsString({ message: 'A chave auth deve ser uma string' })
  auth: string;

  @ApiProperty({
    description: 'User agent da subscrição',
    example: '...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O userAgent deve ser uma string' })
  userAgent?: string;
}
