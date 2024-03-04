import { HttpService } from '@nestjs/axios';
import {
  BasicAuthJWTService,
  BasicAuthService,
} from '@src/auth/auth.interface';
import { AuthError } from '@src/constant/error/auth.error';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { Either, isLeft, isRight, left, right } from 'fp-ts/lib/Either';
import typia from 'typia';

export abstract class AbstractAuthSocialService implements BasicAuthService {
  constructor(
    protected readonly userService: UserService,
    protected readonly httpservice: HttpService,
    protected readonly jwtService: BasicAuthJWTService,
  ) {}

  async login(dto: Auth.LoginDto) {
    // 구현

    dto;
    return typia.random<BasicAuthService['login']>();
  }

  async signup(dto: Auth.SignupDto) {
    if (dto.type === 'local') {
      return left(AuthError.OAUTH.SOCIAL_AUTH_INFO_MISSING);
    }
    const isProviderValid = this.validateProvider(dto);
    if (isLeft(isProviderValid)) {
      return isProviderValid;
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

  private validateProvider(dto: Auth.SignupDto) {
    if (dto.type !== this.getProvider()) {
      return left(AuthError.OAUTH.SOCIAL_AUTH_INFO_MISSING);
    }
    return right(true);
  }

  protected async checkSocialIdExists(social_id: string) {
    const checkSocialIdExists = await this.userService.checkSocialIdExists({
      social_id,
      provider: this.getProvider(),
    });
    return checkSocialIdExists;
  }
  protected async processSignup(email: string, social_id: string) {
    const checkEmailExists = await this.userService.findUnique(email);
    if (isRight(checkEmailExists)) {
      // 기존 사용자 소셜 정보 추가
      await this.userService.createSocialInfo(checkEmailExists.right.id, {
        social_id,
        provider: this.getProvider(),
      });
      return checkEmailExists;
    }
    return this.createSocialuser(email, social_id);
  }
  protected async createSocialuser(email: string, social_id: string) {
    const newUser = await this.userService.createSocialUser(
      {
        email,
        nickname: this.defaultNickname(email),
      },
      {
        social_id,
        provider: this.getProvider(),
      },
    );
    return right(newUser);
  }

  protected abstract getProvider(): Auth.Oauth.Provider;
  protected abstract getToken(
    dto: Auth.Oauth,
  ): Promise<Either<AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED, string>>;
  protected abstract getUserInfo(accessToken: string): Promise<
    Either<
      AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED,
      {
        social_id: string;
        email: string;
      }
    >
  >;

  // 기타 필요한 추상 메소드 정의...

  // SIGNUP

  // UTIL
  protected defaultNickname(email: string): string {
    return email.split('@')[0];
  }
}
