import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    example: 'Carteira de teste',
    description: 'Nome da carteira',
    required: false,
  })
  @IsString({ message: 'Nome da carteira deve ser uma string' })
  @IsOptional()
  name: string;
}
