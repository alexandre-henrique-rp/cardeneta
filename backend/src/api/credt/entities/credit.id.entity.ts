import { UserEntity } from 'src/api/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

/**
 * Entidade de crédito por ID
 * @property {string} id - '12345678-1234-1234-1234-123456789012' - ID do crédito
 * @property {number} value - 100 - Valor do crédito
 * @property {'Credito' | 'Debito'} type - 'Credito' - Tipo do crédito
 * @property {string} userId - '12345678-1234-1234-1234-123456789012' - ID do usuário
 * @property {Date} updatedAt - '2025-01-01' - Data de atualização
 * @property {UserEntity<{id: string, name: string, email: string, status: boolean, createdAt: Date, updatedAt: Date}>} user - Informações do usuário
 */
export class CreditIdEntity {
  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do crédito',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'R$ 100,00',
    description: 'Valor do crédito',
  })
  @IsNumber()
  @Transform(({ value }) =>
    Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  )
  value: number;

  @ApiProperty({
    example: 'Credito',
    description: 'Tipo do crédito',
  })
  @IsString()
  type: 'Credito' | 'Debito';

  @ApiProperty({
    example: '12345678-1234-1234-1234-123456789012',
    description: 'ID do usuário',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Data de atualização',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value).toISOString())
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    type: UserEntity,
    description: 'Informações do usuário',
  })
  @Type(() => UserEntity)
  user: UserEntity;

  constructor(partial: Partial<CreditIdEntity>) {
    Object.assign(this, partial);
  }
}
