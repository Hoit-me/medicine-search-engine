import { Inject, Injectable } from '@nestjs/common';
import { Auth } from '@src/type/auth';
import { BasicAuthService } from '../auth.interface';
import { AUTH_LOCAL_SERVICE } from '../constant';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_LOCAL_SERVICE)
    private readonly localAuthService: BasicAuthService,
  ) {}
  async signup(dto: Auth.SignupDto) {
    switch (dto.type) {
      case 'local':
        return this.localAuthService.signup(dto);
      case 'google':
      case 'kakao':
        throw new Error('Not supported');
    }
  }
  async login() {}
}
