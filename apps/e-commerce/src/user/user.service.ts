import { PrismaService } from '@app/prisma';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorUtil, FileUtil } from '../utils';
import {
  DeleteUserParamDto,
  GetUserParamDto,
  UpdateUserBodyDto,
  UpdateUserParamDto,
  ValidateAccessTokenResponseDto,
} from '@app/dtos';
import { Prisma, Role } from '@prisma/client';
import { SlugUtil } from './utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtil: ErrorUtil,
    private readonly fileUtil: FileUtil,
    private readonly slugUtil: SlugUtil,
  ) {}

  async getUser(user: ValidateAccessTokenResponseDto, param: GetUserParamDto) {
    try {
      if (
        param.userId &&
        param.userId !== user.id &&
        param.userId !== user.slug
      )
        throw new UnauthorizedException('Unauthorized user');

      const id = param.userId || user.id || user.slug;

      let where: Prisma.UserWhereInput;
      let queryOptions: {
        include?: Prisma.UserInclude;
        select?: Prisma.UserSelect;
      };

      if (id == user.id || id == user.slug) {
        where = { OR: [{ id }, { slug: id }], deletedAt: null };
        queryOptions = {
          include: {
            credentials: { where: { deletedAt: null } },
          },
        };
      } else {
        where = {
          OR: [{ id }, { slug: id }],
          isBlocked: false,
          deletedAt: null,
        };
        queryOptions = {
          select: {
            id: true,
            slug: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        };
      }
      const response = await this.prisma.user.findFirst({
        where,
        ...queryOptions,
      });

      if (!response) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async updateUser(
    user: ValidateAccessTokenResponseDto,
    param: UpdateUserParamDto,
    body: UpdateUserBodyDto,
    file: {
      avatar?: Express.Multer.File[];
    },
  ) {
    try {
      if (
        param.userId &&
        param.userId !== user.id &&
        param.userId !== user.slug
      )
        throw new UnauthorizedException('Unauthorized user');

      const id = param.userId || user.id || user.slug;

      const userExists = await this.userExists(id);

      let avatar = undefined;

      if (file.avatar) {
        avatar = await this.fileUtil.uploadToCloudinary(
          file.avatar[0],
          'users/avatars',
          userExists.avatar,
        );
      }

      let slug = undefined;

      if (body.name !== userExists.name) {
        slug = await this.slugUtil.createUserSlug(body.name, userExists.id);
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          name: body.name,
          avatar: avatar,
          slug: slug,
          role: body.role as Role,
        },
      });

      return { ...updatedUser, message: 'User updated successfully' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  async deleteUser(
    user: ValidateAccessTokenResponseDto,
    param: DeleteUserParamDto,
  ) {
    try {
      if (
        param.userId &&
        param.userId !== user.id &&
        param.userId !== user.slug
      )
        throw new UnauthorizedException('Unauthorized user');

      const id = param.userId || user.id || user.slug;

      const userExists = await this.userExists(id);

      await this.prisma.user.update({
        where: {
          id: userExists.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }

  private async userExists(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (!user) throw new NotFoundException(`User ${id} not found`);
      return user;
    } catch (error) {
      this.errorUtil.handleError(error);
    }
  }
}
