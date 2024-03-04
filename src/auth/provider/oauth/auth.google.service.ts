import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { BasicAuthJWTService } from '@src/auth/auth.interface';
import { AuthError } from '@src/constant/error/auth.error';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { left, right } from 'fp-ts/lib/Either';
import { firstValueFrom, map } from 'rxjs';
import {
  JWT_SERVICE,
  OAUTH_GOOGLE_GET_TOKEN_URL,
  OAUTH_GOOGLE_GET_USER_INFO_URL,
} from '../../constant';
import { AbstractAuthSocialService } from './auth.social.base.service';

@Injectable()
export class AuthGoogleService extends AbstractAuthSocialService {
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
    return 'google';
  }
  protected async getToken({ redirect_uri, code }: Auth.Oauth) {
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

  protected async getUserInfo(accessToken: string) {
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
}
