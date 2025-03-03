import { Expose } from 'class-transformer';
import { IsDefined, IsOptional, IsString, ValidateIf } from 'class-validator';

export class LogoutBodyDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @ValidateIf((o) => !o.sessionId && !o.userId)
  @IsDefined({ message: 'Either sessionId or userId must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.sessionId && o.userId)
  @IsDefined({ message: 'Provide either sessionId or userId, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class LogoutPayloadDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @ValidateIf((o) => !o.sessionId && !o.userId)
  @IsDefined({ message: 'Either sessionId or userId must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.sessionId && o.userId)
  @IsDefined({ message: 'Provide either sessionId or userId, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class LogoutResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  message?: string;
}
