import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetUserBodyDto {
  //   @IsOptional()
  //   @IsString()
  //   userId?: string;
}

export class GetUserParamDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class GetUserResponseDto {
  @Exclude() // This will remove the field from the transformed response
  @IsString()
  @IsOptional()
  password?: string;
}
