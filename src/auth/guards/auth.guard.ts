import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(
        { message: 'Unauthorized', devMessage: 'no-token-available' },
        401,
      );
    }
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN,
      });
      request['user'] = decoded;
    } catch (err) {
      throw new HttpException(
        { message: 'Unauthorized', devMessage: err },
        401,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
