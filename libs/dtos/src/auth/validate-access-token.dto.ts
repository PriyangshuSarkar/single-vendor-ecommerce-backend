import { Role } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ValidateAccessTokenBodyDto {
  // No fields required, so this is an empty DTO
}

export class ValidateAccessTokenPayloadDto {
  @IsString()
  token: string;
}

export class ValidateAccessTokenResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @Expose()
  @IsString()
  @IsOptional()
  slug?: string;

  @Expose()
  @IsString()
  @IsOptional()
  role?: Role;
}
