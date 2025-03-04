import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AddressService } from './address.service';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';
import {
  CreateAddressBodyDto,
  CreateAddressResponseDto,
  DeleteAddressParamDto,
  DeleteAddressResponseDto,
  GetAddressParamDto,
  GetAddressResponseDto,
  UpdateAddressBodyDto,
  UpdateAddressParamDto,
  UpdateAddressResponseDto,
  ValidateAccessTokenResponseDto,
} from '@app/dtos';
import { Auth } from '../auth/auth.decorator';

@Controller('address')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('{/:addressId}')
  @UseInterceptors(new TransformInterceptor(GetAddressResponseDto, false))
  async getAddress(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Param() param: GetAddressParamDto,
  ) {
    return await this.addressService.getAddress(user, param);
  }

  @Post()
  @UseInterceptors(new TransformInterceptor(CreateAddressResponseDto, false))
  async createAddress(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Body() body: CreateAddressBodyDto,
  ) {
    return await this.addressService.createAddress(user, body);
  }

  @Patch(':addressId')
  @UseInterceptors(new TransformInterceptor(UpdateAddressResponseDto, false))
  async updateAddress(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Param() param: UpdateAddressParamDto,
    @Body() body: UpdateAddressBodyDto,
  ) {
    return await this.addressService.updateAddress(user, param, body);
  }

  @Delete('{/:addressId}')
  @UseInterceptors(new TransformInterceptor(DeleteAddressResponseDto, false))
  async deleteAddress(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Param() param: DeleteAddressParamDto,
  ) {
    return await this.addressService.deleteAddress(user, param);
  }
}
