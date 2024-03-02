import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth.type';
import { SUCCESS } from '@src/type/success';
import { Response } from 'express';
import { JwtPayload } from './auth.interface';
import { AuthGuard } from './guard/auth.guard';
import { RefreshGuard } from './guard/refresh.guard';
import { AuthService } from './provider/auth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailCertificationService: EmailCertificationService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 로그인 여부 확인
   */
  @TypedRoute.Get('/')
  @UseGuards(AuthGuard)
  async checkLogin(
    @CurrentUser() user: JwtPayload,
  ): Promise<SUCCESS<{ is_login: boolean; user?: JwtPayload }>> {
    if (user) {
      return wrapResponse({ is_login: true, user: user });
    }
    return wrapResponse({ is_login: false });
  }

  /**
   * refresh token
   *
   */
  @TypedRoute.Get('/token')
  @UseGuards(RefreshGuard)
  async refreshToken(
    @Request() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<
    SUCCESS<
      { access_token: string; refresh_token: string } | { access_token: string }
    >
  > {
    const { access_token, refresh_token } =
      await this.authService.refresh(user);

    if (
      !req.headers['x-client-type'] ||
      req.headers['x-client-type'] !== process.env.CLIENT_TYPE
    ) {
      res.cookie('_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS를 사용하는 경우에만 쿠키 전송
        sameSite: 'strict', // CSRF 공격 방지
      });
      return wrapResponse({ access_token });
    }

    return wrapResponse({ access_token, refresh_token });
  }

  /**
   * Login
   *  - 리프레시토큰 전략에 대한 설명
   *  @link https://git-blog-alpha.vercel.app/ko/post/17
   *
   * # oauth 연동관련
   * local 로그인과, oauth 로그인의 이메일이 중복되는 경우가 생김.
   *
   * ## 이메일을 이용하여 해결하는 방법
   * > oauth관련 처리를 할때, email을 이용하여 유저를 판단하는 것을 좋지않은 방법이라고합니다.
   * > 예를 들어, 카카오나 구굴의 이메일이 변경될수도있고, 유저의 설정에 의해 이메일에 접근할수 없을 수도 있기 때문입니다.
   * > 각 상황에 알맞게 처리할 수 있는 방법을 찾아 적용하시길 바랍니다.
   *
   * 생길수 있는 상황
   * 1. 로컬 계정은 있지만, oauth 계정 연동을 하지 않은경우
   * 2. oauth 계정은 있지만, 로컬 계정이 없는경우
   *
   * 해결방법.
   * 문제 1.
   * 로컬계정 로그인 -> oauth 연동 -> 소셜 회원가입절차 -> 로컬계정과 연동
   *
   * 문제 2.
   * oauth 로그인 -> 로컬 회원가입 절차 (이메일인증 및 비밀번호 입력) -> 로컬계정과 연동
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
      (!req.headers['x-client-type'] ||
        req.headers['x-client-type'] !== process.env.CLIENT_TYPE)
    ) {
      body.auto_login ??
        res.cookie('_refresh_token', result.right.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS를 사용하는 경우에만 쿠키 전송
          sameSite: 'strict', // CSRF 공격 방지
        });
      // 리프레시 토큰은 쿠키로 전달되므로 응답 바디에서 제외
      return wrapResponse({ access_token: result.right.access_token });
    }

    // 클라이언트 유형이 앱이 아니거나 로그인 실패한 경우
    return eitherToResponse(result);
  }

  /**
   * Signup
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
   *
   * 고려해야할것
   */
  @TypedRoute.Post('/signup')
  async signup(
    @TypedBody()
    body: Auth.SignupDto,
  ) {
    const result = await this.authService.signup(body);
    return eitherToResponse(result);
  }

  @Post('/getKaKaoUserInfo')
  async getKaKaoUserInfo(
    @TypedBody() { accessToken }: { accessToken: string },
  ) {
    const result = await this.authService.getKaKaoUserInfo(accessToken);
    return result;
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
  @TypedRoute.Post('/logout')
  @UseGuards(RefreshGuard)
  async logout(
    @Request() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
  ) {
    if (
      !req.headers['x-client-type'] ||
      req.headers['x-client-type'] !== process.env.CLIENT_TYPE
    ) {
      res.clearCookie('_refresh_token');
    }
    await this.authService.logout(user);
    return wrapResponse({ is_login: false });
  }

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
