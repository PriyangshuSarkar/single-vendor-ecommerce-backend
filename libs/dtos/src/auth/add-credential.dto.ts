import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class AddCredentialBodyDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{7,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class AddCredentialPayloadDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3}\d{7,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ValidateIf((o) => !o.email && !o.phone)
  @IsDefined({ message: 'Either email or phone must be provided' })
  _validateContactExists?: never;

  @ValidateIf((o) => o.email && o.phone)
  @IsDefined({ message: 'Provide either email or phone, but not both' })
  _validateContactMutuallyExclusive?: never;
}

export class AddCredentialResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  message?: string;
}
