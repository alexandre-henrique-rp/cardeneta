import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para criação de usuário
 * @property {string} email - ex: 'usuario@exemplo.com' - Email do usuário
 * @property {string} senha - ex: 'minhasenha123' - Senha do usuário
 * @property {string} name - ex: 'Usuario Exemplo' - Nome do usuário
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
    type: String,
  })
  @IsEmail({}, { message: 'Email tem que ser do tipo email' })
  @IsNotEmpty({ message: 'Email obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'minhasenha123',
    type: String,
  })
  @IsString({ message: 'Senha tem que ser do tipo texto' })
  @IsNotEmpty({ message: 'Senha obrigatória' })
  senha: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Usuario Exemplo',
    type: String,
  })
  @IsString({ message: 'Nome tem que ser do tipo texto' })
  @IsNotEmpty({ message: 'Nome obrigatório' })
  name: string;
}
