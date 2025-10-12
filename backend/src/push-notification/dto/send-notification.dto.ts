import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

/**
 * DTO para envio de notificação push
 * Define os dados necessários para enviar uma notificação push para usuários
 */
export class SendNotificationDto {
  @IsNotEmpty({ message: 'O ID da wallet é obrigatório' })
  @IsString({ message: 'O ID da wallet deve ser uma string' })
  walletId: string;

  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @IsString({ message: 'A mensagem deve ser uma string' })
  message: string;

  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  title?: string;

  @IsOptional()
  @IsUrl({}, { message: 'A URL de redirecionamento deve ser válida' })
  redirectUrl?: string;

  @IsOptional()
  @IsString({ message: 'O ícone deve ser uma string' })
  icon?: string;
}
