import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Request, Res } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth';
import { SUCCESS } from '@src/type/success';
import { Response } from 'express';
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
   *
   * ## 해당내용은 이슈로 이동할 예정입니다.
   * 본 프로젝트에서는 앱과 웹의 구분이 필요없지만, 연습하고자 클라이언트 유형을 구분하여 처리
   *
   * - 웹
   *   - http only 쿠키를 이용하여 안전하게 토큰을 저장
   *   - HTTP only 쿠키를 사용하여 XSS 공격을 방지
   *   - cookie의 smaeSite 속성을 strict로 설정하여 CSRF 공격 방지
   *
   * - 앱 (안드로이드, IOS)
   *   - HTTP only 쿠키를 사용할 수 없음
   *   - 따라서 리프레시 토큰을 쿠키로 전달할 수 없음
   *   - 리프레시 토큰을 바디에 담아 전달
   *   - 각 플랫폼에서 제공하는 저장소를 사용하여 토큰을 저장
   *
   * ### refresh token 탈취 당했을 경우 대응
   * - refresh token을 탈취당했을 경우, 해당 토큰을 무효화하고 새로운 토큰을 발급
   *   - 해당 사항을 처리하기 위해서는 사용자는 재로그인을 해야함
   *
   * - refresh token을 서버측 (DB, Redis)에 저장하여 관리
   *   - 이때,key:value / user_id(unique 값): refresh_token 으로 저장
   *
   * 보안성 향상을 위한 추가적인 방법
   * RTR (Refresh Token Rotation) : 리프레시 토큰을 주기적으로 갱신하여 탈취당했을 때의 피해를 최소화
   * - 리프레시 토큰을 사용할 때마다 새로운 리프레시 토큰을 발급
   *  - 즉, 리프레시토큰 사용가능횟수 1회
   *
   * 하지만 refresh token을 사용자보다 먼저 사용할경우 막을수 없음
   *
   * 해당 보안이슈를 해결하기위해서 적용할수 있는 방법
   *
   * - refresh할때 redis에 user_id로 조회후 refresh_token이 일치하는지 확인
   * - 일치하지 않는다면 현재 해당 유저의 토큰 전체를 블랙리스트에 추가후 무효화
   * - 유저 재로그인 요청 (리프레시토큰을 탈취한 사용자는 재로그인을 하지못하기때문에)
   *
   * - 하지만 이는 다중 로그인을 허용하지 않는 경우에만 적용가능
   *
   * ### 다중 로그인 (기기별 로그인)을 허용할 경우
   * user_id_user_agent: refresh_token 형태로 저장하여 관리
   * - user_agent가 다르다면 다른 기기로 판단
   * - 같은 기기라면 refresh_token을 갱신
   * - 다른 기기라면 해당 기기의 refresh_token을 무효화
   *
   * 만약 새로운 지역(혹은 기기)에서 로그인을 시도할 경우, 사용자에게 알림을 보내고 로그인을 할지 말지 알림을 보낼수도 있음.
   *  - 이메일, SMS, 푸시 알림 등을 통해 알림을 보낼 수 있음
   *  - 이때, 사용자가 로그인을 허용하면 해당 기기의 refresh_token을 갱신
   *  - 사용자가 로그인을 거부하면 해당 기기의 refresh_token을 무효화
   */
  @TypedRoute.Post('/login')
  async login(
    @TypedBody()
    body: Auth.LoginDto,
    @Request() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    | SUCCESS<{
        access_token: string;
        refresh_token: string;
      }>
    | SUCCESS<{ access_token: string }>
    | UserError.NOT_FOUND_USER
    | UserError.INVALID_PASSWORD
  > {
    const result = await this.authService.login(body);

    // 로그인 성공 및 클라이언트 유형이 웹일 경우 리프레시 토큰을 쿠키로 설정
    if (
      result._tag === 'Right' &&
      req.headers['x-client-type'] !== process.env.CLIENT_TYPE
    ) {
      res.cookie('_refresh_token', result.right.refresh_token, {
        httpOnly: true,
        secure: true, // HTTPS를 사용하는 경우에만 쿠키 전송
        sameSite: 'strict', // CSRF 공격 방지
      });
      // 리프레시 토큰은 쿠키로 전달되므로 응답 바디에서 제외
      return wrapResponse({ access_token: result.right.access_token });
    }

    // 클라이언트 유형이 앱이 아니거나 로그인 실패한 경우
    return eitherToResponse(result);
  }

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
