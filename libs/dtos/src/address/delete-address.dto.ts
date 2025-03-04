import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class DeleteAddressBodyDto {}

export class DeleteAddressParamDto {
  @IsOptional()
  @IsString()
  addressId?: string;
}

export class DeleteAddressResponseDto {}
