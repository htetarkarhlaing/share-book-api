import { Response } from 'express';

type responseInterface = {
  statusCode: number;
  message: string;
  body: any;
  res: Response;
};

export const Responser = ({
  statusCode,
  message,
  body,
  res,
}: responseInterface) => {
  return res.status(statusCode).json({
    meta: {
      success: statusCode >= 200 && statusCode <= 300 ? true : false,
      message: message,
    },
    body: body,
  });
};
