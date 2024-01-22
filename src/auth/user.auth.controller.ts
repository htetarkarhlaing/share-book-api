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
import { IAuthRequest } from 'src/@types/IRequest';
import { UserAuthGuard } from './guards/auth.guard';
import { Responser } from 'src/lib/responser';
import { Request, Response } from 'express';
import {
  ChangePasswordDto,
  ConfirmDTO,
  ForgetPasswordDto,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDto,
  UpdateDTO,
} from './dto/auth.dto';
import { CategoryService } from 'src/category/category.service';
import { PostService } from 'src/post/post.service';
import { PostCreateDto } from 'src/post/dto/post.dto';
import { PostReportCreateDto } from 'src/post/dto/report.dto';

@Controller('user')
export class UserAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly categoryService: CategoryService,
    private readonly postService: PostService,
  ) {}

  @ApiTags('User Auth')
  @Get('me')
  @ApiOperation({ summary: 'User validate me (whoami)' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userValidateMe(
    @Req() req: IAuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const userData = await this.authService.validateMe(req.user.id);
      Responser({
        statusCode: 200,
        message: 'User info fetched successfully',
        body: userData,
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

  @ApiTags('User Auth')
  @Put('me')
  @ApiOperation({ summary: 'User update info' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  @ApiBody({
    type: UpdateDTO,
  })
  async userUpdateSelf(
    @Req() req: IAuthRequest,
    @Body() data: UpdateDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const userData = await this.authService.updateMe(req.user.id, data);
      Responser({
        statusCode: 200,
        message: 'User info updated successfully',
        body: userData,
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

  @ApiTags('User Auth')
  @Put('change-password')
  @ApiOperation({ summary: 'User update password' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  @ApiBody({
    type: ChangePasswordDto,
  })
  async userUpdatePassword(
    @Req() req: IAuthRequest,
    @Body() data: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const userData = await this.authService.updatePassword(req.user.id, data);
      Responser({
        statusCode: 200,
        message: 'User password updated successfully',
        body: userData,
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

  @ApiTags('User Auth')
  @Get('refresh-token')
  @ApiOperation({ summary: 'User request refresh token' })
  @ApiBearerAuth()
  async userRefreshToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const tokens = await this.authService.requestRefreshToken(req);
      Responser({
        statusCode: 200,
        message: 'User token refreshed successfully',
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

  @ApiTags('User Auth')
  @Post('register')
  @ApiOperation({ summary: 'User account register' })
  @ApiBody({
    type: RegisterDTO,
  })
  async userRegister(
    @Body() data: RegisterDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.authService.register(data);
      Responser({
        statusCode: 200,
        message: 'User account invitation mail sent successfully',
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

  @ApiTags('User Auth')
  @Post('confirm')
  @ApiOperation({ summary: 'User account confirm' })
  @ApiBody({
    type: ConfirmDTO,
  })
  async userAccountConfirm(
    @Body() data: ConfirmDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const tokens = await this.authService.confirm(data);
      Responser({
        statusCode: 200,
        message: 'User account verified successfully',
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

  @ApiTags('User Auth')
  @Post('forget-password')
  @ApiOperation({ summary: 'User account forget password' })
  @ApiBody({
    type: ForgetPasswordDto,
  })
  async userRequestPasswordReset(
    @Body() data: ForgetPasswordDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.authService.userForgetPassword(data);
      Responser({
        statusCode: 200,
        message: 'User account password reset link sent successfully',
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

  @ApiTags('User Auth')
  @Post('reset-password')
  @ApiOperation({ summary: 'User account reset password' })
  @ApiBearerAuth()
  @ApiBody({
    type: ResetPasswordDto,
  })
  async userResetPassword(
    @Body() data: ResetPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const tokens = await this.authService.userResetPassword(data, req);
      Responser({
        statusCode: 200,
        message: 'User account password reset successfully',
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

  @ApiTags('User Auth')
  @Post('login')
  @ApiOperation({ summary: 'User account login' })
  @ApiBody({
    type: LoginDTO,
  })
  async userLogin(@Body() data: LoginDTO, @Res() res: Response): Promise<any> {
    try {
      const tokens = await this.authService.login(data);
      return Responser({
        statusCode: 200,
        message: 'User account logged in successfully',
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

  @ApiTags('User Auth')
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userLogout(
    @Req() req: IAuthRequest,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const message = await this.authService.logout(req.user.id, req);
      Responser({
        statusCode: 200,
        message: 'User token destroyed',
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

  // * ----------------------------   Category ---------------------------------------------------
  @ApiTags('User Category')
  @Get('categories')
  @ApiOperation({ summary: 'Fetch category from user' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userCategories(@Res() res: Response): Promise<any> {
    try {
      const categoryList = await this.categoryService.getCategoryList();
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

  // * ----------------------------   Post ---------------------------------------------------
  @ApiTags('User Post')
  @Get('posts')
  @ApiOperation({ summary: 'Fetch post by user (Public posts)' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userPublicPost(@Res() res: Response): Promise<any> {
    try {
      const postList = await this.postService.getPublicPosts();
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

  @ApiTags('User Post')
  @Get('posts/:id')
  @ApiOperation({
    summary: 'Fetch post by user with post id (any post with id)',
  })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userFetchPostById(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const post = await this.postService.getPostById(id);
      Responser({
        statusCode: 200,
        message: 'Post fetched successfully',
        body: post,
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

  @ApiTags('User Post')
  @Get('me/posts')
  @ApiOperation({ summary: 'Fetch post from user (Public posts)' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async fetchUserPosts(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Param('id') id: string,
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

  @ApiTags('User Post')
  @Get('me/posts/:id')
  @ApiOperation({ summary: 'Fetch user owned post by id' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async fetchUserPostById(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const post = await this.postService.getPostByPostAndUserId(
        id,
        req.user.id,
      );
      Responser({
        statusCode: 200,
        message: 'Post fetched successfully',
        body: post,
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

  @ApiTags('User Post')
  @Put('me/posts/:id')
  @ApiOperation({ summary: 'Update post by user with post id' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  @ApiBody({
    type: PostCreateDto,
  })
  async updateUserPostById(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Body() data: PostCreateDto,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      const post = await this.postService.updatePostById(data, id, req.user.id);
      Responser({
        statusCode: 200,
        message: 'Post updated successfully',
        body: post,
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

  @ApiTags('User Post')
  @Delete('me/posts/:id')
  @ApiOperation({ summary: 'Delete post from user with post id' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async deletePostByUser(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<any> {
    try {
      await this.postService.deletePostByUser(id, req.user.id);
      Responser({
        statusCode: 200,
        message: 'Post deleted successfully',
        body: null,
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

  @ApiTags('User Post')
  @Post('post')
  @ApiOperation({ summary: 'Create post' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async userCreatePost(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Body() data: PostCreateDto,
  ): Promise<any> {
    try {
      const message = await this.postService.createPost(data, req.user.id);
      Responser({
        statusCode: 201,
        message: 'Post created successfully',
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

  @ApiTags('User Post')
  @Post('posts/:id/report')
  @ApiOperation({ summary: 'Report post by user' })
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  async reportPostById(
    @Req() req: IAuthRequest,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: PostReportCreateDto,
  ): Promise<any> {
    try {
      const message = await this.postService.reportPostByUser(
        data,
        id,
        req.user.id,
      );
      Responser({
        statusCode: 200,
        message: 'Post reported successfully',
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
}
