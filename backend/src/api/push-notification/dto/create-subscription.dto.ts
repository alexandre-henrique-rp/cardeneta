import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Endpoint da subscrição push',
    example: 'https://fcm.googleapis.com/fcm/send/...',
  })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({
    description: 'Chave pública P256DH',
    example: 'BEl62iUYgUivxIkv69yViEuiBIa...',
  })
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty({
    description: 'Chave de autenticação',
    example: 'R9sidzkcdf7h53v8ui9nkf==',
  })
  @IsString()
  @IsNotEmpty()
  auth: string;

  @ApiProperty({
    description: 'User Agent do navegador',
    example: 'Mozilla/5.0...',
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
