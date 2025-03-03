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

export class UpdateUserParamDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateUserBodyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: `Must be of type ${JSON.stringify(Role) || Role}`,
  })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((o) => !o.name && !o.role && !o.isActive)
  @IsDefined({
    message: 'At least one filed must be provided of name, role or isActive',
  })
  _validateContactExists?: never;
}

export class UpdateUserResponseDto {
  @Exclude() // This will remove the field from the transformed response
  @IsString()
  @IsOptional()
  password?: string;
}
