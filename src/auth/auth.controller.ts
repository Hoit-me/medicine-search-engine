import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Google Login
   */

  /**
   * Kakao Login
   */

  /**
   * local Login
   */

  /**
   * local Signup
   *
   * 이메일,
   * 비밀번호,
   * 이메일 인증
   */

  /**
   * logout
   */

  /**
   * find password
   */

  /**
   * change password
   */

  /**
   * verify email
   */

  /**
   * get api key
   *
   * API 키 발급
   * 사용량 측정 및 제한
   */

  /**
   * get api key list
   */

  /**
   * delete api key
   */

  /**
   * get api key detail
   */
}
