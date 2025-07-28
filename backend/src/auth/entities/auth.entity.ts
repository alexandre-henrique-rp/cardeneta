import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { Payload } from './payload.entity';

/**
 * Entidade de autenticação
 * contém as informações do usuário autenticado
 * @property {string} token - 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI.....' -Token de autenticação
 * @property {number} expiresAt - 1695481023 - Data de expiração do token
 * @property {number} expire - 3600 - Tempo de expiração do token
 * @property {Payload} user - {id: string, email: string, name: string, status: boolean} - Usuário autenticado
 */
export class AuthEntity {
  @ApiProperty({
    description: 'Token de autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI.....',
  })
  @IsString()
  @Type(() => String)
  token: string;

  @ApiProperty({
    description: 'Data de expiração do token',
    type: Date,
    example: '1695481023',
  })
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiProperty({
    description: 'Usuário autenticado',
    type: Payload,
  })
  @Type(() => Payload)
  user: Payload;
}
