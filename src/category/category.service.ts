import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { CategoryCreateDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCategoryById(id: string) {
    const categoryList = await this.prismaService.category.findMany({
      where: {
        category_id: id,
      },
      select: {
        category_id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (categoryList) {
      return categoryList;
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Something went wrong',
          status: 404,
        }),
      );
    }
  }

  async getCategoryList() {
    const categoryList = await this.prismaService.category.findMany({
      where: {
        NOT: {
          status: 'DELETED',
        },
      },
      select: {
        category_id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (categoryList) {
      return categoryList;
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Something went wrong',
          status: 404,
        }),
      );
    }
  }

  async createCategory(data: CategoryCreateDto, id: string) {
    try {
      const createdCategory = await this.prismaService.category.create({
        data: {
          name: data.name,
          created_by: {
            connect: {
              login_id: id,
            },
          },
        },
      });
      return createdCategory;
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Something went wrong',
          status: 404,
        }),
      );
    }
  }

  async updateCategory(data: CategoryCreateDto, cate_id: string, id: string) {
    try {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          category_id: cate_id,
        },
      });
      if (existingCategory.category_id) {
        const createdCategory = await this.prismaService.category.update({
          where: {
            category_id: cate_id,
          },
          data: {
            name: data.name,
            updated_by: {
              connect: {
                login_id: id,
              },
            },
          },
        });
        return createdCategory;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Category not found',
            status: 404,
          }),
        );
      }
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }

  async deleteCategory(cate_id: string, id: string) {
    try {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          category_id: cate_id,
        },
      });
      if (existingCategory.category_id) {
        const createdCategory = await this.prismaService.category.update({
          where: {
            category_id: cate_id,
          },
          data: {
            status: 'DELETED',
            deleted_by: {
              connect: {
                login_id: id,
              },
            },
          },
        });
        return createdCategory;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Category not found',
            status: 404,
          }),
        );
      }
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }
}
