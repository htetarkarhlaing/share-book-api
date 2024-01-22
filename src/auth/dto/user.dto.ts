import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum UserType {
  NORMAL = 'NORMAL',
  PREMIUM = 'PREMIUM',
}

export class UserUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  user_type: UserType;
}
