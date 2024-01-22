import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostReportCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  subject: string;
}
