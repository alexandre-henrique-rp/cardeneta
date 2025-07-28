import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de autenticação de usuário
 * Contém validações para email e senha obrigatórios
 * @property {string} email - ex: 'usuario@exemplo.com' - Email do usuário para autenticação
 * @property {string} senha - ex: 'minhasenha123' - Senha do usuário para autenticação
 */
export class CreateAuthDto {
  @ApiProperty({
    description: 'Email do usuário para autenticação',
    example: 'usuario@exemplo.com',
    type: String,
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email obrigatório' })
  readonly email: string;

  @ApiProperty({
    description: 'Senha do usuário para autenticação',
    example: 'minhasenha123',
    type: String,
  })
  @IsString({ message: 'Senha inválida' })
  @IsNotEmpty({ message: 'Senha obrigatória' })
  readonly senha: string; // Padronizado para inglês conforme clean code
}
