import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { eitherToResponse } from '@src/common/res/success';
import { EmailError } from '@src/constant/error/email.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth';
import { SUCCESS } from '@src/type/success';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailCertificationService: EmailCertificationService,
  ) {}

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
   * 인증결과 ID
   *
   * flow
   * 1. 이메일 인증번호 발송
   *  {@link AuthController.emailCertification};
   * 2. 인증번호 확인
   *    - 인증번호와 이메일이 일치하면 회원가입
   *    - 인증번호가 이메일이 일치하지 않으면 에러
   * 3. 회원가입
   */
  async signup(
    @TypedBody()
    body: {
      email: string;
      password: string;
      certifictaion_id: string;
    },
  ) {
    body;
  }

  /**
   * local email certification
   *
   * 이메일 인증번호 발송
   *
   * 하루에 5번까지만 발송 가능
   * 이메일이 이미 가입되어있으면 에러
   *
   * flow
   * 1. 이메일 가입 여부 확인
   * 2. 이메일에대한 인증번호 발송 횟수 확인
   * 3. 인증번호 발송
   */
  @TypedRoute.Post('/email/certification')
  async sendEmailVerificationCode(
    @TypedBody() { email }: Auth.SendEmailVerificationCodeDto,
  ): Promise<
    | SUCCESS<true>
    | EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED
    | EmailError.EMAIL_ALREADY_EXISTS
  > {
    // 이메일 인증번호 발송
    const result =
      await this.emailCertificationService.sendEmailVerificationCode(email);
    return eitherToResponse(result);
  }

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
