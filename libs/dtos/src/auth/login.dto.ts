import { Role } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginBodyDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class LoginPayloadDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class LoginResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  message?: string;

  @Expose()
  @IsString()
  @IsOptional()
  userId?: string;

  @Expose()
  @IsString()
  @IsOptional()
  userSlug?: string;

  @Expose()
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;

  @Expose()
  @IsString()
  @IsOptional()
  accessToken?: string;

  @Expose()
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @Expose()
  @IsString()
  @IsOptional()
  sessionId?: string;
}
