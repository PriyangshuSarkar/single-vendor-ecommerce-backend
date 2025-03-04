import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

const Role = {
  USER: 'USER',
  VENDOR: 'VENDOR',
} as const;
type Role = (typeof Role)[keyof typeof Role];

export class UpdateAddressParamDto {
  @IsString()
  addressId: string;
}

export class UpdateAddressBodyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressResponseDto {}
