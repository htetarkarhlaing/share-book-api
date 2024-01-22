import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IAdminAuthRequest } from 'src/@types/IRequest';
import { Responser } from 'src/lib/responser';
import { Response } from 'express';
import { CategoryService } from 'src/category/category.service';
import { PostService } from 'src/post/post.service';
import { AdminAuthGuard } from './guards/admin.auth.guard';
import { CategoryCreateDto } from 'src/category/dto/category.dto';
import { AdminLoginDTO, AdminRegisterDTO } from './dto/admin.auth.dto';
import { UserUpdateDto } from './dto/user.dto';

@Controller('admin')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly categoryService: CategoryService,
    private readonly postService: PostService,
  ) {}

  @ApiTags('Admin Auth')
  @Get('me')
  @ApiOperation({ summary: 'Admin Validate Me (whoami)' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminValidateMe(
    @Req() req: IAdminAuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const adminData = await this.authService.adminMe(req.admin.login_id);
      Responser({
        statusCode: 200,
        message: 'Admin info fetched successfully',
        body: adminData,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Auth')
  @Post('register')
  @ApiOperation({ summary: 'Admin account register' })
  @ApiBody({
    type: AdminRegisterDTO,
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminRegister(
    @Body() data: AdminRegisterDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const createdAdmin = await this.authService.adminRegister(data);
      Responser({
        statusCode: 200,
        message: 'Admin account created successfully',
        body: createdAdmin,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Auth')
  @Post('login')
  @ApiOperation({ summary: 'Admin account login' })
  @ApiBody({
    type: AdminLoginDTO,
  })
  async adminLogin(
    @Body() data: AdminLoginDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const tokens = await this.authService.adminLogin(data);
      return Responser({
        statusCode: 200,
        message: 'Admin account logged in successfully',
        body: tokens,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Auth')
  @Post('logout')
  @ApiOperation({ summary: 'Admin logout' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async userLogout(
    @Req() req: IAdminAuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.authService.adminLogout(
        req.admin.login_id,
        req,
      );
      Responser({
        statusCode: 200,
        message: 'Admin token destroyed',
        body: message,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }
  // * ----------------------------  Users ---------------------------------------------------
  @ApiTags('Admin Manage Users')
  @Get('users')
  @ApiOperation({ summary: 'Fetch user list by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminFetchUserList(@Res() res: Response): Promise<any> {
    try {
      const userList = await this.authService.getUserList();
      Responser({
        statusCode: 200,
        message: 'User list fetched successfully',
        body: userList,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Manage Users')
  @Get('users/:user_id')
  @ApiOperation({ summary: 'Fetch user info by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminFetchUserInfo(
    @Res() res: Response,
    @Param('user_id') id: string,
  ): Promise<any> {
    try {
      const userInfo = await this.authService.getUserInfoById(id);
      Responser({
        statusCode: 200,
        message: 'User info fetched successfully',
        body: userInfo,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Manage Users')
  @Put('users/:user_id/status')
  @ApiOperation({ summary: 'Update user status by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiBody({
    type: UserUpdateDto,
  })
  async updateUserStatusByAdmin(
    @Res() res: Response,
    @Param('user_id') id: string,
    @Body() data: UserUpdateDto,
  ): Promise<any> {
    try {
      const userInfo = await this.authService.updateUserStatusByAdmin(id, data);
      Responser({
        statusCode: 200,
        message: 'User info updated successfully',
        body: userInfo,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Manage Users')
  @Delete('users/:user_id')
  @ApiOperation({ summary: 'Delete user by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async deleteUserByAdmin(
    @Res() res: Response,
    @Param('user_id') id: string,
  ): Promise<any> {
    try {
      const userInfo = await this.authService.getUserInfoById(id);
      Responser({
        statusCode: 200,
        message: 'User account deleted successfully',
        body: userInfo,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  // * ----------------------------  Posts ---------------------------------------------------
  @ApiTags('Admin Posts')
  @Get('user/:user_id/posts')
  @ApiOperation({ summary: 'Fetch post of user by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminFetchPostList(
    @Res() res: Response,
    @Param('user_id') id: string,
  ): Promise<any> {
    try {
      const postList = await this.postService.getPostByUserId(id);
      Responser({
        statusCode: 200,
        message: 'Post list fetched successfully',
        body: postList,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Posts')
  @Get('user/:user_id/posts/:post_id')
  @ApiOperation({ summary: 'Fetch post of user with post id by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminFetchPostByPostId(
    @Res() res: Response,
    @Param('user_id') userId: string,
    @Param('post_id') postId: string,
  ): Promise<any> {
    try {
      const postList = await this.postService.getPostByPostAndUserId(
        postId,
        userId,
      );
      Responser({
        statusCode: 200,
        message: 'Post fetched successfully',
        body: postList,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Posts')
  @Get('posts/:post_id/status')
  @ApiOperation({ summary: 'Fetch post of user by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminChangePostStatus(
    @Res() res: Response,
    @Param('post_id') id: string,
    @Req() req: IAdminAuthRequest,
  ): Promise<any> {
    try {
      const postData = await this.postService.updateStatus(
        id,
        req.admin.login_id,
      );
      Responser({
        statusCode: 200,
        message: 'Post deleted changed successfully',
        body: postData,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }
  // * ----------------------------  Category ---------------------------------------------------
  @ApiTags('Admin Category')
  @Get('categories/:id')
  @ApiOperation({ summary: 'Fetch category by admin with category id' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminFetchCategoryById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const categoryList = await this.categoryService.getCategoryById(id);
      Responser({
        statusCode: 200,
        message: 'Category info fetched successfully',
        body: categoryList,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Category')
  @Get('categories')
  @ApiOperation({ summary: 'Fetch category by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminCategories(@Res() res: Response): Promise<any> {
    try {
      const categoryList = await this.categoryService.getCategoryList();
      Responser({
        statusCode: 200,
        message: 'Category list fetched successfully',
        body: categoryList,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Category')
  @Post('categories')
  @ApiOperation({ summary: 'create category by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiBody({
    type: CategoryCreateDto,
  })
  async adminCategoryCreate(
    @Res() res: Response,
    @Body() data: CategoryCreateDto,
    @Req() req: IAdminAuthRequest,
  ): Promise<any> {
    try {
      const createdCategory = await this.categoryService.createCategory(
        data,
        req.admin.login_id,
      );
      Responser({
        statusCode: 200,
        message: 'Category created successfully',
        body: createdCategory,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Category')
  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiBody({
    type: CategoryCreateDto,
  })
  async adminCategoryUpdate(
    @Res() res: Response,
    @Body() data: CategoryCreateDto,
    @Req() req: IAdminAuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const createdCategory = await this.categoryService.updateCategory(
        data,
        id,
        req.admin.login_id,
      );
      Responser({
        statusCode: 200,
        message: 'Category updated successfully',
        body: createdCategory,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }

  @ApiTags('Admin Category')
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category by admin' })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  async adminDeleteCategory(
    @Res() res: Response,
    @Req() req: IAdminAuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const createdCategory = await this.categoryService.deleteCategory(
        id,
        req.admin.login_id,
      );
      Responser({
        statusCode: 200,
        message: 'Category deleted successfully',
        body: createdCategory,
        res,
      });
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }
}
