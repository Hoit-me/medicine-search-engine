import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Auth } from '@src/type/auth';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { isLeft } from 'fp-ts/lib/Either';
import { assertPrune } from 'typia/lib/misc';
import {
  BasicAuthJWTService,
  BasicAuthService,
  JwtPayload,
} from '../auth.interface';
import { AUTH_LOCAL_SERVICE, JWT_SERVICE } from '../constant';

@Injectable()
export class AuthService implements BasicAuthService {
  constructor(
    @Inject(AUTH_LOCAL_SERVICE)
    private readonly localAuthService: BasicAuthService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache & RedisStore,
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
      await this.setCache(id, refresh_token);
      return result;
    };
  }

  async refresh(payload: JwtPayload) {
    const _payload = assertPrune<JwtPayload>(payload);
    const access_token = this.jwtService.accessTokenSign(_payload);
    const refresh_token = this.jwtService.refreshTokenSign(_payload);
    await this.setCache(_payload.id, refresh_token);
    return { access_token, refresh_token };
  }

  async setCache(id: string, token: string) {
    this.cache.set(`refresh_${id}`, token, {
      // TODO: set ttl from config
      ttl: 60 * 60 * 24 * 30,
    } as any);
  }
}
