import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateAddressParamDto {}

export class CreateAddressBodyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsString()
  street: string;

  @IsString()
  zipCode: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateAddressResponseDto {}
