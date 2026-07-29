import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'organizador@futbolya.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'clave-segura-123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  displayName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'organizador@futbolya.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'clave-segura-123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
