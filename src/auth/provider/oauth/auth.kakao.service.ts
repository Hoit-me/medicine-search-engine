import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AuthError } from '@src/constant/error/auth.error';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { left, right } from 'fp-ts/lib/Either';
import { firstValueFrom, map } from 'rxjs';
import { BasicAuthJWTService } from '../../auth.interface';
import {
  JWT_SERVICE,
  OAUTH_KAKAO_GET_TOKEN_URL,
  OAUTH_KAKAO_GET_USER_INFO_URL,
} from '../../constant';
import { AbstractAuthSocialService } from './auth.social.base.service';

@Injectable()
export class AuthKakaoService extends AbstractAuthSocialService {
  constructor(
    @Inject(UserService)
    protected readonly userService: UserService,
    protected readonly httpService: HttpService,

    @Inject(JWT_SERVICE)
    protected readonly jwtService: BasicAuthJWTService,
  ) {
    super(userService, httpService, jwtService);
  }

  protected getProvider(): Auth.Oauth.Provider {
    return 'kakao';
  }
  //////////////////////////
  // Private
  //////////////////////////
  protected async getToken(dto: Auth.Oauth) {
    try {
      const { access_token } = await firstValueFrom(
        this.httpService
          .post<Auth.Oauth.Kakao.GetTokenResponse>(
            OAUTH_KAKAO_GET_TOKEN_URL,
            this.createTokenRequestBody(dto),
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
        this.httpService.get<Auth.Oauth.Kakao.GetUserInfoResponse>(
          OAUTH_KAKAO_GET_USER_INFO_URL,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );
      const {
        id,
        kakao_account: { email },
      } = data;
      return right({ social_id: id.toString(), email });
    } catch (err) {
      return left(AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED);
    }
  }

  private createTokenRequestBody(dto: Auth.Oauth) {
    const { code, redirect_uri } = dto;
    return {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri,
      code,
    };
  }
}
