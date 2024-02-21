import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtOption } from '@src/config/interface/option.interface';
import { JWT_OPTIONS } from '../constant';
import { BasicAuthJWTService, JwtPayload } from './../auth.interface';

export class AuthJWTService implements BasicAuthJWTService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(JWT_OPTIONS)
    private option: JwtOption,
  ) {}

  accessTokenSign(payLoad: JwtPayload) {
    return this.jwtService.sign(payLoad, {
      secret: this.option.access_secret,
      expiresIn: this.option.access_expires_in,
    });
  }

  accessTokenVerify(token: string) {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.option.access_secret,
    });
  }

  refreshTokenSign(payLoad: JwtPayload) {
    return this.jwtService.sign(payLoad, {
      secret: this.option.refresh_secret,
      expiresIn: this.option.refresh_expires_in,
    });
  }

  refreshTokenVerify(token: string) {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.option.refresh_secret,
    });
  }
}
