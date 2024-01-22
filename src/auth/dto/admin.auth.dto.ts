import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDTO {
  @ApiProperty()
  @IsNotEmpty()
  login_id: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class AdminRegisterDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
