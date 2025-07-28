import { Atm } from '@prisma/client';
import { UserEntity } from 'src/api/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class WalletEntity {
  @ApiProperty({
    description: 'ID da carteira',
    example: '12345678-1234-1234-1234-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da carteira',
    example: 'Carteira de teste',
  })
  name: string;
  
  @ApiProperty({
    description: 'Lista de usuários associados à carteira',
    type: [UserEntity],
    isArray: true,
  })
  @IsOptional()
  users: UserEntity[];

  @ApiProperty({
    description: 'Lista de despesas',
    type: Array<Atm>,
  })
  @IsOptional()
  atms: Atm[];

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<WalletEntity>) {
    Object.assign(this, partial);
  }
}
