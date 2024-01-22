import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/lib/prisma.service';
import {
  ChangePasswordDto,
  ConfirmDTO,
  ForgetPasswordDto,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDto,
  UpdateDTO,
} from './dto/auth.dto';
import { Request } from 'express';
import EmailService from 'src/lib/mailer.service';
import verifyTemplate from 'src/lib/email-templates/verify-template';
import { TokenBlacklistService } from './middleware/token.blacklist.service';
import passwordResetTemplate from 'src/lib/email-templates/password-reset-template';
import { AdminLoginDTO, AdminRegisterDTO } from './dto/admin.auth.dto';
import { customAlphabet } from 'nanoid';
import { AdminTokenBlacklistService } from './middleware/adminToken.blacklist.service';
import { UserUpdateDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private Email: EmailService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly adminTokenBlacklistService: AdminTokenBlacklistService,
  ) {}

  private readonly nanoid = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyz',
    8,
  );

  private async generateUniqueUUID(): Promise<string> {
    const generatedLoginId = this.nanoid();

    const existingRecord = await this.prismaService.admin.findUnique({
      where: {
        login_id: generatedLoginId,
      },
    });

    if (existingRecord) {
      return this.generateUniqueUUID();
    }

    return generatedLoginId;
  }

  private async getTokens({ id }: { id: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
        },
        {
          secret: process.env.ACCESS_TOKEN,
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          id: id,
        },
        {
          secret: process.env.REFRESH_TOKEN,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken({
    id,
    token,
  }: {
    id: string;
    token: string;
  }) {
    const hashedRefreshToken = await hash(token);
    return this.prismaService.user.update({
      data: {
        refresh_token: hashedRefreshToken,
      },
      where: {
        user_id: id,
      },
    });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async sendEmail(email: string, subject: string, body: string) {
    try {
      return await this.Email.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: subject,
        html: body,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async validateMe(id: string) {
    const userData = await this.prismaService.user.findFirst({
      where: {
        user_id: id,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        user_type: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (userData.user_id) {
      return userData;
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User not found',
          status: 404,
        }),
      );
    }
  }

  async updateMe(id: string, data: UpdateDTO) {
    const userData = await this.prismaService.user.findFirst({
      where: {
        user_id: id,
      },
    });
    if (userData.user_id) {
      const updateData: { [key: string]: any } = {};

      if (
        data.email !== null &&
        data.email !== undefined &&
        data.email !== ''
      ) {
        updateData.email = data.email;
      }

      if (
        data.username !== null &&
        data.username !== undefined &&
        data.username !== ''
      ) {
        updateData.name = data.username;
      }

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await this.prismaService.user.update({
          where: {
            user_id: userData.user_id,
          },
          data: updateData,
        });

        return updatedUser;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'At least one of email or username should be provided',
            status: 400,
          }),
        );
      }
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User not found',
          status: 404,
        }),
      );
    }
  }

  async login(data: LoginDTO) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user) {
      const isPasswordMatch = await verify(user.password, data.password);
      if (user.status === 'NOT_VERIFY') {
        throw new Error(
          JSON.stringify({
            message: 'Your account is not verify yet',
            status: 401,
          }),
        );
      } else if (isPasswordMatch) {
        const tokens = await this.getTokens({ id: user.user_id });
        await this.updateRefreshToken({
          id: user.user_id,
          token: tokens.refreshToken,
        });

        return tokens;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Password not match',
            status: 401,
          }),
        );
      }
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User Not Found',
          status: 404,
        }),
      );
    }
  }

  async register(data: RegisterDTO) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user && user.status === 'VERIFIED') {
      throw new Error(
        JSON.stringify({
          message: `Your email is already used`,
          status: 401,
        }),
      );
    } else if (user && user.status === 'NOT_VERIFY') {
      throw new Error(
        JSON.stringify({
          message: `Your account is not activated, please request for verification code with your email`,
          status: 401,
        }),
      );
    } else if (user && user.status === 'SUSPENDED') {
      throw new Error(
        JSON.stringify({
          message: `Your account is not suspended, please contact to Customer support.`,
          status: 401,
        }),
      );
    } else {
      const code: number = Math.floor(100000 + Math.random() * 900000);

      await this.prismaService.user.create({
        data: {
          name: data.username,
          email: data.email,
          password: await hash(data.password),
          otp: code.toString(),
          user_type: data.type,
          status: 'NOT_VERIFY',
        },
      });

      try {
        const template = verifyTemplate(code.toString(), data.username);
        await this.sendEmail(data.email, 'Welcome to ShareBook', template);
        return `Verification code is sent to ${data.email}.`;
      } catch (err) {
        JSON.stringify({
          message: err,
          status: 500,
        });
      }
    }
  }

  async confirm(data: ConfirmDTO) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user) {
      if (user.otp === data.otp) {
        await this.prismaService.user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            status: 'VERIFIED',
          },
        });
        const tokens = await this.getTokens({ id: user.user_id });
        await this.updateRefreshToken({
          id: user.user_id,
          token: tokens.refreshToken,
        });

        return tokens;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'OTP not match',
            status: 401,
          }),
        );
      }
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User Not Found',
          status: 404,
        }),
      );
    }
  }

  async logout(id: string, req: Request) {
    const userData = await this.prismaService.user.findFirst({
      where: {
        user_id: id,
      },
      select: {
        user_id: true,
      },
    });
    if (userData.user_id) {
      await this.prismaService.user.update({
        where: {
          user_id: userData.user_id,
        },
        data: {
          token: '',
          refresh_token: '',
        },
      });
      const token = req.headers.authorization?.split(' ')[1];
      this.tokenBlacklistService.addToBlacklist(token);
      return 'Logout successful';
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User not found',
          status: 404,
        }),
      );
    }
  }

  async requestRefreshToken(req: Request) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new Error(
        JSON.stringify({
          message: 'Refresh token is not valid',
          status: 401,
        }),
      );
    } else {
      try {
        const decoded = await this.jwtService.verify(token, {
          secret: process.env.REFRESH_TOKEN,
        });
        if (decoded.id) {
          const existingUser = await this.prismaService.user.findFirst({
            where: {
              user_id: decoded.id,
            },
          });
          if (existingUser) {
            const refreshTokenMatches = await verify(
              existingUser.refresh_token,
              token,
            );

            if (refreshTokenMatches) {
              const tokens = await this.getTokens({
                id: existingUser.user_id,
              });
              await this.updateRefreshToken({
                id: existingUser.user_id,
                token: tokens.refreshToken,
              });

              return tokens;
            } else {
              throw new Error(
                JSON.stringify({
                  message: 'Refresh token is not valid',
                  status: 401,
                }),
              );
            }
          } else {
            throw new Error(
              JSON.stringify({
                message: 'User not found',
                status: 404,
              }),
            );
          }
        } else {
          throw new Error(
            JSON.stringify({
              message: 'Refresh token is not valid',
              status: 401,
            }),
          );
        }
      } catch (err) {
        throw new Error(
          JSON.stringify({
            message: 'Refresh token is not valid',
            status: 401,
          }),
        );
      }
    }
  }

  async userForgetPassword(data: ForgetPasswordDto) {
    try {
      const isUserExist = await this.prismaService.user.findFirst({
        where: {
          email: data.email,
        },
      });
      if (isUserExist.user_id) {
        const token = await this.jwtService.signAsync(
          {
            id: isUserExist.user_id,
          },
          {
            secret: process.env.MULTI_PURPOSE_TOKEN,
            expiresIn: '1h',
          },
        );
        const template = passwordResetTemplate(token, isUserExist.name);
        await this.sendEmail(data.email, 'Important', template);
        return `Password reset link is sent to ${data.email}.`;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'There is no user with provided email.',
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

  async userResetPassword(data: ResetPasswordDto, req: Request) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new Error(
        JSON.stringify({
          message: 'Refresh token is not valid',
          status: 401,
        }),
      );
    } else {
      try {
        const decoded = await this.jwtService.verify(token, {
          secret: process.env.MULTI_PURPOSE_TOKEN,
        });
        if (decoded.id) {
          const existingUser = await this.prismaService.user.findFirst({
            where: {
              user_id: decoded.id,
            },
          });
          if (existingUser) {
            await this.prismaService.user.update({
              where: {
                user_id: existingUser.user_id,
              },
              data: {
                password: await hash(data.password),
              },
            });

            return 'Password reset successfully';
          } else {
            throw new Error(
              JSON.stringify({
                message: 'User not found',
                status: 404,
              }),
            );
          }
        } else {
          throw new Error(
            JSON.stringify({
              message: 'Provided token is not valid',
              status: 401,
            }),
          );
        }
      } catch (err) {
        throw new Error(
          JSON.stringify({
            message: 'Provided token is not valid',
            status: 401,
          }),
        );
      }
    }
  }

  async updatePassword(id: string, data: ChangePasswordDto) {
    const userData = await this.prismaService.user.findFirst({
      where: {
        user_id: id,
      },
    });
    if (userData.user_id) {
      const isPasswordMatch = await verify(
        userData.password,
        data.currentPassword,
      );
      if (isPasswordMatch) {
        const updatedUser = await this.prismaService.user.update({
          where: {
            user_id: userData.user_id,
          },
          data: {
            password: await hash(data.newPassword),
          },
        });

        return updatedUser;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'User password not match',
            status: 401,
          }),
        );
      }
    } else {
      throw new Error(
        JSON.stringify({
          message: 'User not found',
          status: 404,
        }),
      );
    }
  }

  // * ----------------------------------------- Admin Handlers --------------------------------------------------
  async adminLogin(data: AdminLoginDTO) {
    const admin = await this.prismaService.admin.findFirst({
      where: {
        login_id: data.login_id,
      },
    });

    if (admin) {
      const isPasswordMatch = await verify(admin.password, data.password);
      if (isPasswordMatch) {
        const token = await this.jwtService.signAsync(
          {
            login_id: admin.login_id,
          },
          {
            secret: process.env.ADMIN_ACCESS_TOKEN,
            expiresIn: '1d',
          },
        );

        return token;
      } else {
        throw new Error(
          JSON.stringify({
            message: 'Password not match',
            status: 401,
          }),
        );
      }
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Admin Not Found',
          status: 404,
        }),
      );
    }
  }

  async adminRegister(data: AdminRegisterDTO) {
    const loginId = await this.generateUniqueUUID();

    if (loginId) {
      const createdAdminAccount = await this.prismaService.admin.create({
        data: {
          login_id: loginId,
          name: data.name,
          password: await hash(data.password),
        },
        select: {
          login_id: true,
          created_at: true,
        },
      });
      return { createdAdminAccount };
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }

  async adminLogout(id: string, req: Request) {
    const adminData = await this.prismaService.admin.findFirst({
      where: {
        login_id: id,
      },
      select: {
        login_id: true,
      },
    });
    if (adminData.login_id) {
      const token = req.headers.authorization?.split(' ')[1];
      this.adminTokenBlacklistService.addToBlacklist(token);
      return 'Logout successful';
    } else {
      throw new Error(
        JSON.stringify({
          message: 'Admin not found',
          status: 404,
        }),
      );
    }
  }

  async getUserList() {
    try {
      const userList = await this.prismaService.user.findMany();
      return userList;
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }

  async getUserInfoById(id: string) {
    try {
      const userInfo = await this.prismaService.user.findFirst({
        where: {
          user_id: id,
        },
      });
      return userInfo;
    } catch (err) {
      throw new Error(
        JSON.stringify({
          message: 'Internal server error',
          status: 500,
        }),
      );
    }
  }

  async updateUserStatusByAdmin(id: string, data: UserUpdateDto) {
    try {
      const userInfo = await this.prismaService.user.findFirst({
        where: {
          user_id: id,
        },
      });

      if (userInfo.user_id) {
        await this.prismaService.user.update({
          where: {
            user_id: id,
          },
          data: {
            user_type: data.user_type,
          },
        });
        return 'User deleted successfully';
      } else {
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

  async deleteUserById(id: string) {
    try {
      const userInfo = await this.prismaService.user.findFirst({
        where: {
          user_id: id,
        },
      });

      if (userInfo.user_id) {
        await this.prismaService.user.update({
          where: {
            user_id: id,
          },
          data: {
            status: 'DELETED',
          },
        });
        return 'User deleted successfully';
      } else {
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
