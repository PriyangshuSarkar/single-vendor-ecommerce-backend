import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

export class VerifyOtpBodyDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class VerifyOtpPayloadDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{10}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

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

export class VerifyOtpResponseDto {
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
