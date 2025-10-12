import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO para envio de notificação push
 * Define os dados necessários para enviar uma notificação push para usuários
 */
export class SendNotificationDto {
  @ApiProperty({
    description: 'ID da wallet',
    example: '676767676767676767676767',
    required: true,
  })
  @IsNotEmpty({ message: 'O ID da wallet é obrigatório' })
  @IsString({ message: 'O ID da wallet deve ser uma string' })
  walletId: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Mensagem de teste...',
    required: true,
  })
  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @IsString({ message: 'A mensagem deve ser uma string' })
  message: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Título de teste...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  title?: string;

  @ApiProperty({
    description: 'URL de redirecionamento',
    example: 'https://google.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL de redirecionamento deve ser válida' })
  redirectUrl?: string;

  @ApiProperty({
    description: 'Ícone da notificação',
    example: 'https://google.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O ícone deve ser uma string' })
  icon?: string;
}
