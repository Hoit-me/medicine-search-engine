import { Inject, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { right } from 'fp-ts/lib/Either';
import typia from 'typia';
import {
  BasicAuthJWTService,
  BasicAuthPasswordService,
  BasicAuthService,
  JwtPayload,
} from '../../auth.interface';
import { JWT_SERVICE, PASSWORD_SERVICE } from '../../constant';

@Injectable()
export class AuthLocalService implements BasicAuthService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly emailCertificationService: EmailCertificationService,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: BasicAuthPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}

  // TODO: Implement signup
  async signup(dto: Auth.SignupDto) {
    dto;
    return right(typia.random<Pick<user, 'email'>>());
  }
  // TODO: Implement login
  async login(dto: Auth.LoginDto) {
    dto;
    return right(
      typia.random<{
        access_token: string;
        refresh_token: string;
        payload: JwtPayload;
      }>(),
    );
  }

  // TODO: Implement checkConde
  private async checkCode(dto: Auth.LoginDto) {
    dto;
    return true;
  }

  private async checkUserSocialInfo(dto: Auth.LoginDto) {
    dto;
    return true;
  }
}
