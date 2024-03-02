import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtOption, passwordOption } from '@src/config/option';
import { EmailCertificationModule } from '@src/modules/emailCertification.module';
import { UserModule } from '@src/modules/user.module';
import { AuthController } from './auth.controller';
import {
  AUTH_CACHE_SERVICE,
  AUTH_GOOGLE_SERVICE,
  AUTH_KAKAO_SERVICE,
  AUTH_LOCAL_SERVICE,
  AUTH_NAVER_SERVICE,
  JWT_OPTIONS,
  JWT_SERVICE,
  PASSWORD_OPTIONS,
  PASSWORD_SERVICE,
} from './constant';
import { AuthCacheService } from './provider/auth.cache.service';
import { AuthJWTService } from './provider/auth.jwt.service';
import { AuthLocalService } from './provider/auth.local.service';
import { AuthPasswordService } from './provider/auth.password.service';
import { AuthService } from './provider/auth.service';
import { AuthGoogleService } from './provider/oauth/auth.google.service';
import { AuthKakaoService } from './provider/oauth/auth.kakao.service';
import { AuthNaverService } from './provider/oauth/auth.naver.service';

const authServices: Provider[] = [
  AuthService,
  { provide: AUTH_LOCAL_SERVICE, useClass: AuthLocalService },
  { provide: AUTH_KAKAO_SERVICE, useClass: AuthKakaoService },
  { provide: AUTH_NAVER_SERVICE, useClass: AuthNaverService },
  { provide: AUTH_GOOGLE_SERVICE, useClass: AuthGoogleService },
  { provide: PASSWORD_SERVICE, useClass: AuthPasswordService },
  { provide: JWT_SERVICE, useClass: AuthJWTService },
  { provide: AUTH_CACHE_SERVICE, useClass: AuthCacheService },
];

const options: Provider[] = [
  { provide: JWT_OPTIONS, useValue: jwtOption },
  {
    provide: PASSWORD_OPTIONS,
    useValue: passwordOption,
  },
];

@Global()
@Module({
  imports: [JwtModule, EmailCertificationModule, UserModule],
  controllers: [AuthController],
  providers: [...options, ...authServices],
  exports: [AuthService, ...authServices],
})
export class AuthModule {}
