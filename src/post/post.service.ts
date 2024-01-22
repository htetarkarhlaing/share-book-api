import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { PostCreateDto } from './dto/post.dto';
import { PostReportCreateDto } from './dto/report.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
  async getPublicPosts() {
    const categoryList = await this.prismaService.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        updated_at: 'desc',
      },
      select: {
        post_id: true,
        title: true,
        content: true,
        status: true,
        created_by: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
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

  async getPostById(id: string) {
    const categoryList = await this.prismaService.post.findFirst({
      where: {
        post_id: id,
      },
      select: {
        post_id: true,
        title: true,
        content: true,
        status: true,
        created_by: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
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

  async getPostByPostAndUserId(id: string, user_id: string) {
    const postData = await this.prismaService.post.findFirst({
      where: {
        post_id: id,
      },
      select: {
        post_id: true,
        title: true,
        content: true,
        status: true,
        created_by: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
    if (postData.created_by.user_id === user_id) {
      return postData;
    } else if (postData) {
      throw new Error(
        JSON.stringify({
          message: 'User do not own this post',
          status: 401,
        }),
      );
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Something went wrong',
          status: 404,
        }),
      );
    }
  }

  async getPostByUserId(id: string) {
    const categoryList = await this.prismaService.post.findFirst({
      where: {
        created_by_id: id,
      },
      orderBy: {
        updated_at: 'desc',
      },
      select: {
        post_id: true,
        title: true,
        content: true,
        status: true,
        created_by: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
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

  async createPost(data: PostCreateDto, id: string) {
    try {
      const createdPost = await this.prismaService.post.create({
        data: {
          title: data.title,
          content: data.content,
          status: data.status,
          created_by: {
            connect: {
              user_id: id,
            },
          },
        },
      });

      return createdPost;
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }

  async updatePostById(data: PostCreateDto, post_id: string, id: string) {
    try {
      const existingPost = await this.prismaService.post.findFirstOrThrow({
        where: {
          post_id,
        },
      });
      if (existingPost.created_by_id === id) {
        const updatedPost = await this.prismaService.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            title: data.title || existingPost.title,
            content: data.content || existingPost.content,
            status: data.status || existingPost.status,
            updated_by: {
              connect: {
                user_id: id,
              },
            },
          },
        });

        return updatedPost;
      } else if (existingPost) {
        throw new Error(
          JSON.stringify({
            message: 'User not belong to this post',
            status: 401,
          }),
        );
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Post not found',
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

  async deletePostByUser(post_id: string, id: string) {
    try {
      const existingPost = await this.prismaService.post.findFirstOrThrow({
        where: {
          post_id,
        },
      });
      if (existingPost) {
        const deletedPost = await this.prismaService.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            status: 'DELETED',
            deleted_by: {
              connect: {
                user_id: id,
              },
            },
          },
        });

        return deletedPost;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Post not found',
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

  async updateStatus(post_id: string, id: string) {
    try {
      const existingPost = await this.prismaService.post.findFirstOrThrow({
        where: {
          post_id,
        },
      });
      if (existingPost) {
        const deletedPost = await this.prismaService.post.update({
          where: {
            post_id: post_id,
          },
          data: {
            status: 'REPORTED',
            deleted_by_admin: {
              connect: {
                login_id: id,
              },
            },
          },
        });

        return deletedPost;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Post not found',
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

  async reportPostByUser(
    data: PostReportCreateDto,
    post_id: string,
    id: string,
  ) {
    try {
      const existingPost = await this.prismaService.post.findFirstOrThrow({
        where: {
          post_id,
        },
      });
      if (existingPost) {
        await this.prismaService.report.create({
          data: {
            subject: data.subject,
            post: {
              connect: {
                post_id: post_id,
              },
            },
            reported_by: {
              connect: {
                user_id: id,
              },
            },
          },
        });
        return 'Post reported successfully';
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Post not found',
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
