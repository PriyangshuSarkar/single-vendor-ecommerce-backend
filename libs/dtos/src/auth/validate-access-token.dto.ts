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
  message?: string;

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
