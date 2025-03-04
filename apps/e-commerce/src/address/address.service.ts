import { PrismaService } from '@app/prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorUtil, FileUtil } from '../utils';
import {
  CreateAddressBodyDto,
  DeleteAddressParamDto,
  GetAddressParamDto,
  UpdateAddressBodyDto,
  UpdateAddressParamDto,
  ValidateAccessTokenResponseDto,
} from '@app/dtos';
import { UserService } from '../user/user.service';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
  ) {}

  async getAddress(
    user: ValidateAccessTokenResponseDto,
    param: GetAddressParamDto,
  ) {
    try {
      const address = await this.prisma.address.findMany({
        where: {
          id: param.addressId,
          userId: user.id,
          deletedAt: null,
        },
      });

      return address;
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async createAddress(
    user: ValidateAccessTokenResponseDto,
    body: CreateAddressBodyDto,
  ) {
    try {
      const address = await this.prisma.address.create({
        data: {
          name: body.name,
          phone: body.phone,
          street: body.street,
          apartment: body.apartment,
          zipCode: body.zipCode,
          city: body.city,
          state: body.state,
          country: body.country,
          isDefault: body.isDefault,
          instructions: body.instructions,
          userId: user.id,
        },
      });

      return { ...address, message: 'Address created successfully' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async updateAddress(
    user: ValidateAccessTokenResponseDto,
    param: UpdateAddressParamDto,
    body: UpdateAddressBodyDto,
  ) {
    try {
      const address = await this.prisma.address.update({
        where: {
          id: param.addressId,
          userId: user.id,
          deletedAt: null,
        },
        data: {
          name: body.name,
          phone: body.phone,
          apartment: body.apartment,
          street: body.street,
          zipCode: body.zipCode,
          city: body.city,
          state: body.state,
          country: body.country,
          instructions: body.instructions,
          isDefault: body.isDefault,
        },
      });

      return { ...address, message: 'Address updated successfully' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async deleteAddress(
    user: ValidateAccessTokenResponseDto,
    param: DeleteAddressParamDto,
  ) {
    try {
      const address = await this.prisma.address.updateMany({
        where: {
          id: param.addressId,
          userId: user.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: `${address.count} address deleted successfully` };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}
