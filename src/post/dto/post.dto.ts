import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REPORTED = 'REPORTED',
  DELETED = 'DELETED',
}

export class PostCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    enum: PostStatus,
  })
  @IsNotEmpty()
  status: PostStatus;
}
