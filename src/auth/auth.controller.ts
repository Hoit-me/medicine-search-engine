import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Request, Res, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth';
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
    console.log('user', user);
    if (user) {
      return wrapResponse({ is_login: true, user: user });
    }
    return wrapResponse({ is_login: false });
  }

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
   * user_id: user_agent/token 형태로 저장하여 관리
   * - user_agent가 다르다면 다른 기기로 판단
   * - 같은 기기라면 refresh_token을 갱신
   * - 다른 기기라면 해당 기기의 refresh_token을 무효화
   *
   * 만약 새로운 지역(혹은 기기)에서 로그인을 시도할 경우, 사용자에게 알림을 보내고 로그인을 할지 말지 알림을 보낼수도 있음.
   *  - 이메일, SMS, 푸시 알림 등을 통해 알림을 보낼 수 있음
   *  - 이때, 사용자가 로그인을 허용하면 해당 기기의 refresh_token을 갱신
   *  - 사용자가 로그인을 거부하면 해당 기기의 refresh_token을 무효화
   *
   *
   *
   * #### 추가적인 방법
   * - 기기지문(device fingerprint) or IP 주소를 사용하여 보안성 향상시킬수 있음
   *   - 기기지문: 사용자의 기기를 식별하는 정보
   *   - IP 주소: 사용자의 IP 주소를 식별하는 정보
   *
   * ##기기지문이란? (device fingerprint / browser fingerprint)
   * - 사용자의 브라우저에서 수집되는 여러 속성들을 조합하여 사용자의 기기를 식별하는 정보
   *
   * ### 관련 라이브러리
   * - FingerPrintJS
   *
   * ### 어떻게 동작하나?
   * - 설치 폰트정보 : 특정 문자열을 렌더링 후, 글자의 너비/높이 차이를 비교하여 특정폰트의 존재여부를 확인
   *
   * - 스크린 정보: 해상도, 터치지원여부, 색상깊이 등을 확인
   *    - screen.width, screen.height, screen.colorDepth, screen.pixelDepth 등을 사용하여 가져올수있음
   *
   * - canvas 정보:
   *   - 그래픽카드, 드라이버, 브라우저, 운영체제등에 따라 픽셀값이 민감하게 달라짐을 이용하여 사용자의 기기를 식별
   *   - toDataURL을 사용하여 canvas에 그림을 그린후, 그림을 base64로 인코딩하여 가져옴
   *
   * ### 기기지문의 문제점
   * - 같은 기기라도 브라우저를 업데이트하거나, 브라우저의 설정을 변경하면 기기지문이 변경될수 있음
   * - 듀얼 모니터 사용시, 두 모니터의 정보가 다르게 나올수 있음
   * - 모바일기기의 경우 종류가 많지않아, 기기지문이 중복될수 있음
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
   * 
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
