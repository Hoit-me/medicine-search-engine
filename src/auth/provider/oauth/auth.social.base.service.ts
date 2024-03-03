import { HttpService } from '@nestjs/axios';
import {
  BasicAuthJWTService,
  BasicAuthService,
} from '@src/auth/auth.interface';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import { Either } from 'fp-ts/lib/Either';
import typia from 'typia';

export abstract class AbstractAuthService implements BasicAuthService {
  constructor(
    protected readonly userService: UserService,
    protected readonly httpService: HttpService,
    protected readonly jwtService: BasicAuthJWTService,
  ) {}

  async login(dto: Auth.LoginDto) {
    // 구현
    dto;
    return typia.random<BasicAuthService['login']>();
  }

  async signup(dto: Auth.SignupDto) {
    // 공통 로직 구현
    // 서비스별 특성 처리는 아래 추상 메소드를 통해 구현
    dto;
    return typia.random<BasicAuthService['signup']>();
  }

  protected abstract getToken(dto: Auth.Oauth): Promise<Either<Error, string>>;
  protected abstract getUserInfo(
    accessToken: string,
  ): Promise<Either<Error, any>>;
  // 기타 필요한 추상 메소드 정의...

  // 공통으로 사용할 수 있는 유틸리티 메소드
  protected defaultNickname(email: string): string {
    return email.split('@')[0];
  }
}
