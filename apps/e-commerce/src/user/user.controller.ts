import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserParamDto,
  DeleteUserResponseDto,
  GetUserParamDto,
  GetUserResponseDto,
  UpdateUserBodyDto,
  UpdateUserParamDto,
  UpdateUserResponseDto,
  ValidateAccessTokenResponseDto,
} from '@app/dtos';
import { Auth } from '../auth/auth.decorator';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('{/:userId}')
  @UseInterceptors(new TransformInterceptor(GetUserResponseDto, false))
  async getUser(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Param() param?: GetUserParamDto, // `param` will be undefined if not provided
  ) {
    return await this.userService.getUser(user, param);
  }

  @Patch('{/:userId}')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    new TransformInterceptor(UpdateUserResponseDto, false),
  )
  async updateUser(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Body() body: UpdateUserBodyDto,
    @Param() param: UpdateUserParamDto,
    @UploadedFiles()
    files?: {
      avatar?: Express.Multer.File[];
    },
  ) {
    return await this.userService.updateUser(user, param, body, files);
  }

  @Delete('{/:userId}')
  @UseInterceptors(new TransformInterceptor(DeleteUserResponseDto))
  async deleteUser(
    @Auth() user: ValidateAccessTokenResponseDto,
    @Param() param: DeleteUserParamDto,
  ) {
    return await this.userService.deleteUser(user, param);
  }
}
