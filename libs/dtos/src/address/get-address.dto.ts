import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetAddressBodyDto {}

export class GetAddressParamDto {
  @IsOptional()
  @IsString()
  addressId?: string;
}

export class GetAddressResponseDto {}
