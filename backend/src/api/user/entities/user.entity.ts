import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { WalletEntity } from 'src/api/wallet/entities/wallet.entity';

/**
 * Entidade do usuário
 * @property {string} id - ex: '12345678-1234-1234-1234-123456789012' - ID do usuário
 * @property {string} email - ex: 'usuario@exemplo.com' - Email do usuário
 * @property {string} name - ex: 'Usuario Exemplo' - Nome do usuário
 * @property {boolean} status - ex: true - Status do usuário
 */
export class UserEntity {
  @ApiProperty({
    description: 'ID do usuário',
    example: '12345678-1234-1234-1234-123456789012',
  })
  @IsString()
  @IsUUID()
  @Type(() => String)
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Usuario Exemplo',
  })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Status do usuário',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  status: boolean;

  @ApiProperty({
    description: 'Carteiras do usuário',
    example: ['12345678-1234-1234-1234-123456789012'],
    type: Array,
    isArray: true,
  })
  @IsOptional()
  Wallets: Array<string>;

  // @IsString()
  // @Type(() => String)
  // @Exclude()
  // senhaHash: string;

  // @IsString()
  // @Type(() => String)
  // @Exclude()
  // senha: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
