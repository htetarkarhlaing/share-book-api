import { Request } from 'express';

export interface IAuthRequest extends Request {
  user: {
    id: string;
  };
}

export interface IAdminAuthRequest extends Request {
  admin: {
    login_id: string;
  };
}
