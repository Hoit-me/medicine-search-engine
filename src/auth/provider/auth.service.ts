import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuthError } from '@src/constant/error/auth.error';
import { Auth } from '@src/type/auth.type';
import { isLeft, left } from 'fp-ts/lib/Either';
import { assertPrune } from 'typia/lib/misc';
import {
  BasicAuthCacheService,
  BasicAuthJWTService,
  BasicAuthPasswordService,
  BasicAuthService,
  BasicAuthServiceAdapter,
  JwtPayload,
} from '../auth.interface';
import {
  AUTH_CACHE_SERVICE,
  AUTH_GOOGLE_SERVICE,
  AUTH_KAKAO_SERVICE,
  AUTH_LOCAL_SERVICE,
  AUTH_NAVER_SERVICE,
  JWT_SERVICE,
  PASSWORD_SERVICE,
} from '../constant';

/**
 * AuthService
 * 유지보수가 용이한 코드작성 관련 글
 * @link https://git-blog-alpha.vercel.app/ko/post/16
 */
@Injectable()
export class AuthService implements BasicAuthServiceAdapter {
  constructor(
    @Inject(AUTH_LOCAL_SERVICE)
    private readonly localAuthService: BasicAuthService,
    @Inject(AUTH_KAKAO_SERVICE)
    private readonly kakaoAuthService: BasicAuthService,
    @Inject(AUTH_NAVER_SERVICE)
    private readonly naverAuthService: BasicAuthService,
    @Inject(AUTH_GOOGLE_SERVICE)
    private readonly googleAuthService: BasicAuthService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
    @Inject(AUTH_CACHE_SERVICE)
    private readonly cacheService: BasicAuthCacheService,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: BasicAuthPasswordService,
  ) {}

  async signup(dto: Auth.SignupDto) {
    switch (dto.type) {
      case 'local':
        return this.localAuthService.signup(dto);
      case 'google':
        return this.googleAuthService.signup(dto);
      case 'kakao':
        return this.kakaoAuthService.signup(dto);
      case 'naver':
        return this.naverAuthService.signup(dto);
      default:
        throw new HttpException('Not supported', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * this bind 문제관련 글
   * @link https://git-blog-alpha.vercel.app/ko/post/18
   */
  async login(dto: Auth.LoginDto) {
    switch (dto.type) {
      case 'local':
        return await this.generateLogin(
          this.localAuthService.login.bind(this.localAuthService),
        )(dto);
      case 'google':
        return await this.generateLogin(
          this.googleAuthService.login.bind(this.googleAuthService),
        )(dto);
      case 'kakao':
        return await this.generateLogin(
          this.kakaoAuthService.login.bind(this.kakaoAuthService),
        )(dto);
      case 'naver':
        return await this.generateLogin(
          this.naverAuthService.login.bind(this.naverAuthService),
        )(dto);
      default:
        throw new HttpException('Not supported', HttpStatus.BAD_REQUEST);
    }
  }

  async logout(payload: JwtPayload) {
    const _payload = assertPrune<JwtPayload>(payload);
    await this.cacheService.addBlacklist(_payload.id);
  }

  async refresh(payload: JwtPayload) {
    const _payload = assertPrune<JwtPayload>(payload);
    const access_token = this.jwtService.accessTokenSign(_payload);
    const refresh_token = this.jwtService.refreshTokenSign(_payload);
    await this.cacheService.setCache(_payload.id, refresh_token);
    return { access_token, refresh_token };
  }

  async changePassword(dto: Auth.ChangePasswordDto) {
    switch (dto.type) {
      case 'FIND_PASSWORD':
      case 'PROFILE':
        return await this.generateChangePassword(
          this.passwordService.changePassword.bind(this.passwordService),
        )(dto);
      default:
        return left(AuthError.Authentication.INVALID_TYPE);
    }
  }

  private generateLogin(login: BasicAuthService['login']) {
    return async (dto: Auth.LoginDto) => {
      const result = await login(dto);
      if (isLeft(result)) return result;
      const {
        right: {
          payload: { id },
          refresh_token,
        },
      } = result;
      await this.cacheService.setCache(id, refresh_token);
      return result;
    };
  }

  //변경 성공시 토큰무효화
  private generateChangePassword(
    changePassword: BasicAuthPasswordService['changePassword'],
  ) {
    return async (dto: Auth.ChangePasswordDto) => {
      const result = await changePassword(dto);
      if (isLeft(result)) return result;
      await this.cacheService.addBlacklist(result.right.id);
      return result;
    };
  }
}
