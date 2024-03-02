import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AuthError } from '@src/constant/error/auth.error';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { isLeft, isRight, left, right } from 'fp-ts/lib/Either';
import { firstValueFrom, map } from 'rxjs';
import typia from 'typia';
import {
  BasicAuthJWTService,
  BasicAuthService,
  JwtPayload,
} from '../../auth.interface';
import {
  JWT_SERVICE,
  OAUTH_GOOGLE_GET_TOKEN_URL,
  OAUTH_GOOGLE_GET_USER_INFO_URL,
} from '../../constant';

@Injectable()
export class AuthGoogleService implements BasicAuthService {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly httpService: HttpService,

    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}

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

  async signup(dto: Auth.SignupDto) {
    if (dto.type !== 'google') {
      return left(AuthError.OAUTH.SOCIAL_AUTH_INFO_MISSING);
    }

    const accessTokenOrError = await this.getToken(dto);
    if (isLeft(accessTokenOrError)) {
      return accessTokenOrError;
    }

    const userInfoOrError = await this.getUserInfo(accessTokenOrError.right);
    if (isLeft(userInfoOrError)) {
      return userInfoOrError;
    }

    const { email, social_id } = userInfoOrError.right;
    const checkSocialIdExists = await this.checkSocialIdExists(social_id);
    if (isLeft(checkSocialIdExists)) {
      return checkSocialIdExists;
    }

    const userOrError = await this.processSignup(email, social_id);
    return userOrError;
  }

  //////////////////////////
  // Private
  //////////////////////////
  private async getToken({ redirect_uri, code }: Auth.Oauth) {
    try {
      const { access_token } = await firstValueFrom(
        this.httpService
          .post<Auth.Oauth.Google.GetTokenResponse>(
            OAUTH_GOOGLE_GET_TOKEN_URL,
            {
              grant_type: 'authorization_code',
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              redirect_uri,
              code: decodeURIComponent(code),
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(map((res) => res.data)),
      );
      return right(access_token);
    } catch (err) {
      return left(AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED);
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Auth.Oauth.Google.GetUserInfoResponse>(
          OAUTH_GOOGLE_GET_USER_INFO_URL,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );
      const { sub, email } = data;
      return right({ social_id: sub, email });
    } catch (err) {
      return left(AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED);
    }
  }

  private async checkSocialIdExists(social_id: string) {
    const checkSocialIdExists = await this.userService.checkSocialIdExists({
      social_id,
      provider: 'google',
    });
    return checkSocialIdExists;
  }

  private async processSignup(email: string, social_id: string) {
    const checkEmailExists = await this.userService.findUnique(email);
    if (isRight(checkEmailExists)) {
      // 기존 사용자 소셜 정보 추가
      await this.userService.createSocialInfo(checkEmailExists.right.id, {
        social_id,
        provider: 'google',
      });
      return checkEmailExists;
    }
    return this.createSocialuser(email, social_id);
  }

  private async createSocialuser(email: string, social_id: string) {
    const newUser = await this.userService.createSocialUser(
      {
        email,
        nickname: this.defaultNickname(email),
      },
      {
        social_id,
        provider: 'google',
      },
    );
    return right(newUser);
  }

  //////////////////////////
  // Util
  //////////////////////////
  private defaultNickname(email: string) {
    return email.split('@')[0];
  }
}
