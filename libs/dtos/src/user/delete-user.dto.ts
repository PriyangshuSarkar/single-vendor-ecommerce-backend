import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class DeleteUserBodyDto {
  //   @IsOptional()
  //   @IsString()
  //   userId?: string;
}

export class DeleteUserParamDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class DeleteUserResponseDto {
  @Expose()
  @IsString()
  @IsOptional()
  message?: string;
}
