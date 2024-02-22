import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Auth } from '@src/type/auth';
import { isLeft } from 'fp-ts/lib/Either';
import { assertPrune } from 'typia/lib/misc';
import {
  BasicAuthCacheService,
  BasicAuthJWTService,
  BasicAuthService,
  JwtPayload,
} from '../auth.interface';
import {
  AUTH_CACHE_SERVICE,
  AUTH_LOCAL_SERVICE,
  JWT_SERVICE,
} from '../constant';

@Injectable()
export class AuthService implements BasicAuthService {
  constructor(
    @Inject(AUTH_LOCAL_SERVICE)
    private readonly localAuthService: BasicAuthService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
    @Inject(AUTH_CACHE_SERVICE)
    private readonly cacheService: BasicAuthCacheService,
  ) {}
  async signup(dto: Auth.SignupDto) {
    switch (dto.type) {
      case 'local':
        return this.localAuthService.signup(dto);
      case 'google':
      case 'kakao':
        throw new HttpException('Not supported', HttpStatus.BAD_REQUEST);
    }
  }
  async login(dto: Auth.LoginDto) {
    switch (dto.type) {
      case 'local':
        return this.generateLogin(this.localAuthService.login)(dto);
      case 'google':
      case 'kakao':
        throw new HttpException('Not supported', HttpStatus.BAD_REQUEST);
    }
  }

  async refresh(payload: JwtPayload) {
    const _payload = assertPrune<JwtPayload>(payload);
    const access_token = this.jwtService.accessTokenSign(_payload);
    const refresh_token = this.jwtService.refreshTokenSign(_payload);
    await this.cacheService.setCache(_payload.id, refresh_token);
    return { access_token, refresh_token };
  }

  private generateLogin(fn: BasicAuthService['login']) {
    return async (dto: Auth.LoginDto) => {
      const result = await fn(dto);
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
}
