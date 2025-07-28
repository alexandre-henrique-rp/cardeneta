import { PartialType } from '@nestjs/swagger';
import { UserEntity } from 'src/api/user/entities/user.entity';

/**
 * Entidade do payload
 * contém as informações do usuário autenticado
 * @property {string} id - ex: '12345678-1234-1234-1234-123456789012' - ID do usuário
 * @property {string} email - ex: 'usuario@exemplo.com' - Email do usuário
 * @property {string} name - ex: 'Usuario Exemplo' - Nome do usuário
 * @property {boolean} status - ex: true - Status do usuário
 */
export class Payload extends PartialType(UserEntity) {
  constructor(partial: Partial<Payload>) {
    super(partial);
  }
}
