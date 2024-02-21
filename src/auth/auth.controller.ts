import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eitherToResponse } from '@src/common/res/success';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth';
import { SUCCESS } from '@src/type/success';
import { AuthService } from './provider/auth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailCertificationService: EmailCertificationService,
    private readonly authService: AuthService,
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

  // @TypedRoute.Post('/login')
  // async login(
  //   @TypedBody()
  //   body: Auth.LoginDto,
  // ) {
  //   const result = await this.authService.login(body);
  //   return eitherToResponse(result);
  // }

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
  @TypedRoute.Post('/signup')
  async signup(
    @TypedBody()
    body: Auth.SignupDto,
  ) {
    const result = await this.authService.signup(body);
    return eitherToResponse(result);
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
    | UserError.EMAIL_ALREADY_EXISTS
  > {
    // 이메일 인증번호 발송
    const result =
      await this.emailCertificationService.sendEmailVerificationCode(email);
    return eitherToResponse(result);
  }

  @TypedRoute.Post('/email/certification/verify')
  async verifyEmailCode(
    @TypedBody()
    { email, code }: Auth.VerifyEmailCodeDto,
  ): Promise<
    | SUCCESS<string>
    | UserError.EMAIL_ALREADY_EXISTS
    | EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH
  > {
    const result = await this.emailCertificationService.verifyEmailCode(
      email,
      code,
    );
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

  ///////////////////////////
  // batch
  ///////////////////////////
  /**
   * batch - delete expired email certification
   *
   * 매일 0시에 만료된 이메일 인증번호 삭제 (소프트 삭제)
   * - 1일 이상 지난 인증번호 삭제
   */
  @Cron('0 0 * * *')
  async deleteExpiredEmailCertification() {
    await this.emailCertificationService.deleteExpiredEmailCertification();
  }
}
