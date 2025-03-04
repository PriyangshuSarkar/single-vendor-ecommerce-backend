import { Expose } from 'class-transformer';
import { IsDefined, IsOptional, IsString, ValidateIf } from 'class-validator';

export class LogoutBodyDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class LogoutPayloadDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class LogoutResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  message?: string;
}
