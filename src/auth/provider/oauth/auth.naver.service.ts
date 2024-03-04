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
  OAUTH_NAVER_GET_TOKEN_URL,
  OAUTH_NAVER_GET_USER_INFO_URL,
} from '../../constant';
import { AbstractAuthSocialService } from './auth.social.base.service';

@Injectable()
export class AuthNaverService extends AbstractAuthSocialService {
  constructor(
    @Inject(UserService)
    protected readonly userService: UserService,
    protected readonly httpService: HttpService,

    @Inject(JWT_SERVICE)
    protected readonly jwtService: BasicAuthJWTService,
  ) {
    super(userService, httpService, jwtService);
  }
  // TODO: Implement login

  protected getProvider(): Auth.Oauth.Provider {
    return 'naver';
  }
  //////////////////////////
  // Private
  //////////////////////////
  protected async getToken({ state, code }: Auth.Oauth) {
    try {
      const { access_token } = await firstValueFrom(
        this.httpService
          .get<Auth.Oauth.Naver.GetTokenResponse>(OAUTH_NAVER_GET_TOKEN_URL, {
            params: {
              grant_type: 'authorization_code',
              client_id: process.env.NAVER_CLIENT_ID,
              client_secret: process.env.NAVER_CLIENT_SECRET,
              state,
              code,
            },
          })
          .pipe(map((res) => res.data)),
      );

      return right(access_token);
    } catch (err) {
      return left(AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED);
    }
  }

  protected async getUserInfo(accessToken: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<Auth.Oauth.Naver.GetUserInfoResponse>(
          OAUTH_NAVER_GET_USER_INFO_URL,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );
      const {
        response: { id, email },
      } = data;
      return right({ social_id: id.toString(), email });
    } catch (err) {
      return left(AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED);
    }
  }
}
