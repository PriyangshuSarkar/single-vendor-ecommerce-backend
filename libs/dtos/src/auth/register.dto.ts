import { Optional } from '@nestjs/common';
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

export class RegisterBodyDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class RegisterPayloadDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Must be of type ${JSON.stringify(Role)} or ${Role}`,
  })
  role: Role;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class RegisterResponseDto {
  @Expose()
  @IsString()
  @Optional()
  message?: string;
}
