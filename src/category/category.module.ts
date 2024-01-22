import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  controllers: [],
  providers: [CategoryService, PrismaService],
})
export class CategoryModule {}
