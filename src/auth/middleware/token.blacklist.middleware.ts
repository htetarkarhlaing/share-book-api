import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenBlacklistService } from '../middleware/token.blacklist.service';

@Injectable()
export class JwtBlacklistMiddleware implements NestMiddleware {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    const excludedRoutes = [
      '/api/user/login',
      '/api/user/register',
      '/api/user/confirm',
      '/api/admin/login',
      '/api/admin/register',
      '/docs',
    ];

    if (excludedRoutes.includes(req.path)) {
      return next();
    }

    if (token && this.tokenBlacklistService.isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    next();
  }
}
