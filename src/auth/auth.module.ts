import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserAuthController } from './user.auth.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/lib/prisma.service';
import { AdminAuthController } from './admin.auth.controller';
import EmailService from 'src/lib/mailer.service';
import { CategoryService } from 'src/category/category.service';
import { PostService } from 'src/post/post.service';
import { JwtBlacklistMiddleware } from './middleware/token.blacklist.middleware';
import { TokenBlacklistService } from './middleware/token.blacklist.service';
import { AdminJwtBlacklistMiddleware } from './middleware/adminToken.blacklist.middleware';
import { AdminTokenBlacklistService } from './middleware/adminToken.blacklist.service';

@Module({
  controllers: [UserAuthController, AdminAuthController],
  providers: [
    AuthService,
    CategoryService,
    JwtService,
    PrismaService,
    EmailService,
    PostService,
    TokenBlacklistService,
    AdminTokenBlacklistService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtBlacklistMiddleware).forRoutes('*');
    consumer.apply(AdminJwtBlacklistMiddleware).forRoutes('*');
  }
}
