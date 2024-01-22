import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  controllers: [],
  providers: [PostService, PrismaService],
})
export class PostModule {}
