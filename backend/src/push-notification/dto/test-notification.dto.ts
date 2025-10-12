import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para envio de notificação de teste
 * Permite customizar a mensagem de teste (opcional)
 */
export class TestNotificationDto {
  @ApiProperty({
    description: 'Título customizado para a notificação de teste',
    example: '🔔 Notificação de Teste',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  title?: string;

  @ApiProperty({
    description: 'Mensagem customizada para a notificação de teste',
    example: 'Esta é uma notificação de teste do Cardeneta App!',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A mensagem deve ser uma string' })
  message?: string;

  @ApiProperty({
    description: 'URL de redirecionamento ao clicar na notificação',
    example: '/',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A URL deve ser uma string' })
  redirectUrl?: string;
}
