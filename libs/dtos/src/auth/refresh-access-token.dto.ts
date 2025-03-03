import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RefreshAccessTokenBodyDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class RefreshAccessTokenPayloadDto {
  @IsString()
  token: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class RefreshAccessTokenResponseDto {
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
