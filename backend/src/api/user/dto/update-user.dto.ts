import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO para atualização de usuário
 * @property {string} email - ex: 'usuario@exemplo.com' - Email do usuário
 * @property {string} senha - ex: 'minhasenha123' - Senha do usuário
 * @property {string} name - ex: 'Usuario Exemplo' - Nome do usuário
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'ID da nova carteira',
    example: '12345678-1234-1234-1234-123456789012',
    type: String,
  })
  @IsString({ message: 'ID da nova carteira tem que ser do tipo texto' })
  @IsUUID('4', { message: 'ID da nova carteira tem que ser um UUID' })
  @IsOptional()
  NewWalletId?: string;
}
