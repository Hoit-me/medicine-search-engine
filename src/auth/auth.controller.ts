import {
  TypedBody,
  TypedException,
  TypedHeaders,
  TypedRoute,
} from '@nestia/core';
import {
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { UserLoggingInterceptor } from '@src/common/interceptor/userLogging.interceptor';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { AuthError } from '@src/constant/error/auth.error';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { Auth } from '@src/type/auth.type';
import { ClientHeader } from '@src/type/header.type';
import { SUCCESS } from '@src/type/success';
import { Response } from 'express';
import { isRight } from 'fp-ts/lib/Either';
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
   *
   * 로그인 여부를 확인하는 API 입니다.
   *
   * ## Error Case
   * - TOKEN_INVALID: 토큰이 유효하지 않음
   * - TOKEN_MISSING: 토큰이 없음
   *
   * @author de-novo
   * @tag Auth
   * @summary 로그인 여부 확인 API
   *
   * @security access_token
   */
  @TypedRoute.Get('/')
  @UseGuards(AuthGuard)
  @TypedException<AuthError.Authentication.TOKEN_INVALID>(
    AuthError.Authentication.TOKEN_MISSING.status,
    '토큰이 유효하지 않음',
  )
  @TypedException<AuthError.Authentication.TOKEN_MISSING>(
    AuthError.Authentication.TOKEN_MISSING.status,
    '토큰이 없음',
  )
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
   * 리프레시 토큰을 이용하여 액세스 토큰을 재발급합니다.
   * 리프레시 토큰이 없거나 유효하지 않으면 에러를 반환합니다.
   *
   * **주의**
   * 앱의경우 헤더로, 웹의 경우 쿠키로 리프레시 토큰을 전달해야합니다.
   *
   * 한번 사용된 리프레시 토큰은 더이상 사용할 수 없습니다.
   * 만약 리프레시 토큰을 재사용하면 해당 유저의 리프레시 토큰은 모두 만료됩니다.
   *
   *
   * ## Error Case
   * - TOKEN_INVALID: 토큰이 유효하지 않음
   * - TOKEN_MISSING: 토큰이 없음
   *
   *
   * @author de-novo
   * @tag Auth
   * @summary refresh token api
   * @security refresh_token
   * @security web_refresh_token
   */
  @TypedRoute.Get('/token')
  @UseGuards(RefreshGuard)
  @TypedException<AuthError.Authentication.TOKEN_INVALID>(
    AuthError.Authentication.TOKEN_INVALID.status,
    '토큰이 유효하지 않음',
  )
  @TypedException<AuthError.Authentication.TOKEN_MISSING>(
    AuthError.Authentication.TOKEN_MISSING.status,
    '토큰이 없음',
  )
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
    @TypedHeaders() headers: ClientHeader,
  ): Promise<
    SUCCESS<
      { access_token: string; refresh_token: string } | { access_token: string }
    >
  > {
    const { access_token, refresh_token } =
      await this.authService.refresh(user);
    if (
      !headers['X-Client-Type'] ||
      headers['X-Client-Type'] !== process.env.CLIENT_TYPE
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
   *
   *
   * 소셜로그인과 로컬로그인을 모두 지원합니다.
   * 각 로그인방식에따라 body에 필요한 정보가 다릅니다.
   *
   * **주의**
   * 앱의 경우 헤더에 x-client-type을 명시 해야합니다.
   * x-client-type이 명시되지 않으면 웹으로 간주합니다.
   *
   * 리프레시 토큰 전달:
   * - 웹의 경우 쿠키로 전달됩니다.
   * - 앱의 경우 바디로 전달됩니다.
   *
   * @link https://git-blog-alpha.vercel.app/ko/post/17
   * @author de-novo
   * @tag Auth
   * @summary 로그인 API
   */
  @Post('/login')
  @UseInterceptors(UserLoggingInterceptor)
  @TypedException<AuthError.User.USER_NOT_FOUND>(
    AuthError.User.USER_NOT_FOUND.status,
    '이메일이 존재하지 않습니다.',
  )
  @TypedException<AuthError.Authentication.INVALID_TYPE>(
    AuthError.Authentication.INVALID_TYPE.status,
    'type이 유효하지 않습니다.',
  )
  @TypedException<AuthError.Authentication.INVALID_PASSWORD>(
    AuthError.Authentication.INVALID_PASSWORD.status,
    '비밀번호가 일치하지 않습니다.',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_AUTH_FAILED>(
    AuthError.SocialAuth.SOCIAL_AUTH_FAILED.status,
    '소셜로그인 실패',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING>(
    AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING.status,
    '소셜로그인 정보가 없음',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED>(
    AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED.status,
    '소셜로그인 서비스 접근 거부',
  )
  async login(
    @TypedBody()
    body: Auth.LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any,
    @TypedHeaders() headers: ClientHeader,
  ): Promise<
    | SUCCESS<{
        access_token: string;
        refresh_token: string;
      }>
    | SUCCESS<{ access_token: string }>
    | AuthError.User.USER_NOT_FOUND
    | AuthError.Authentication.INVALID_TYPE
    | AuthError.Authentication.INVALID_PASSWORD
    | AuthError.SocialAuth.SOCIAL_AUTH_FAILED
    | AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING
    | AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED
  > {
    const result = await this.authService.login(body);
    // 로그인 성공 및 클라이언트 유형이 웹일 경우 리프레시 토큰을 쿠키로 설정
    req.user = isRight(result) ? result.right.payload : undefined;
    if (
      result._tag === 'Right' &&
      headers['X-Client-Type'] !== process.env.CLIENT_TYPE
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
   * 회원가입 API
   *
   * 소셜과 로컬을 모두 지원합니다.
   * 각 회원가입방식에따라 body에 필요한 정보가 다릅니다.
   *
   * 로컬 회원가입시, 이메일 인증이 필요합니다.
   * 이메일 인증후, 이메일 인증ID를 body에 포함하여 회원가입을 진행합니다.
   *
   * 회원가입을 할때, email을 기준으로 유저를 구분합니다.
   * 다만 소셜회원가입 이후, 특별한 이유로 인하여 Provider(로그인 제공업체)의 이메일이 변경될경우, 해당 이메일로 로그인시에도 기존의 유저정보를 사용합니다.
   * 이는 소셜로그인의 특성상, 이메일이 변경될수 있기 때문입니다.
   *
   * **주의**
   * 로컬회원가입 후 소셜회원가입을 할시 자동으로 소셜계정과 연동됩니다.
   * 하지만, 소셜회원가입 후 로컬회원가입을 할시, 이미 가입된 이메일이라는 에러가 발생합니다.
   * 해당 문제는 비밀번호 찾기 flow를 통해 해결할 수 있습니다.
   *
   * @author de-novo
   * @tag Auth
   * @summary 회원가입 API
   */
  @TypedRoute.Post('/signup')
  @TypedException<AuthError.User.EMAIL_ALREADY_EXISTS>(
    AuthError.User.EMAIL_ALREADY_EXISTS.status,
    '이메일이 이미 존재합니다.',
  )
  @TypedException<AuthError.User.NICKNAME_ALREADY_EXISTS>(
    AuthError.User.NICKNAME_ALREADY_EXISTS.status,
    '닉네임이 이미 존재합니다.',
  )
  @TypedException<AuthError.Authentication.INVALID_TYPE>(
    AuthError.Authentication.INVALID_TYPE.status,
    'type이 유효하지 않습니다.',
  )
  @TypedException<AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED>(
    AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED.status,
    '이메일 인증번호가 일치하지 않습니다.',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_ACCOUNT_LINKING_FAILED>(
    AuthError.SocialAuth.SOCIAL_ACCOUNT_LINKING_FAILED.status,
    '소셜계정 연동 실패',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_AUTH_FAILED>(
    AuthError.SocialAuth.SOCIAL_AUTH_FAILED.status,
    '소셜로그인 실패',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING>(
    AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING.status,
    '소셜로그인 정보가 없음',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED>(
    AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED.status,
    '소셜로그인 서비스 접근 거부',
  )
  @TypedException<AuthError.SocialAuth.SOCIAL_ACCOUNT_ALREADY_LINKED>(
    AuthError.SocialAuth.SOCIAL_ACCOUNT_ALREADY_LINKED.status,
    '소셜계정이 이미 연동되어있습니다.',
  )
  async signup(
    @TypedBody()
    body: Auth.SignupDto,
    @Req() req: any,
  ): Promise<
    | SUCCESS<{ email: string; id: string }>
    | AuthError.User.EMAIL_ALREADY_EXISTS
    | AuthError.User.NICKNAME_ALREADY_EXISTS
    | AuthError.Authentication.INVALID_TYPE
    | AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED
    | AuthError.SocialAuth.SOCIAL_ACCOUNT_LINKING_FAILED
    | AuthError.SocialAuth.SOCIAL_AUTH_FAILED
    | AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING
    | AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED
    | AuthError.SocialAuth.SOCIAL_SERVICE_RESPONSE_ERROR
    | AuthError.SocialAuth.SOCIAL_ACCOUNT_ALREADY_LINKED
  > {
    const result = await this.authService.signup(body);
    isRight(result) && (req.user = result.right);
    return eitherToResponse(result);
  }

  /**
   * 이메일 인증번호 발송 API
   *
   * 로컬 회원가입을 위한 이메일 인증번호를 발송합니다.
   * 이미 가입된 이메일인 경우 에러를 반환합니다.
   *
   * 하루에 5회까지만 인증번호를 발송할 수 있습니다.
   * 인증번호는 15분간 유효합니다.
   *
   * 15분이 지난 인증번호는 자동 만료됩니다.
   *
   * @author de-novo
   * @tag Auth
   * @summary 이메일 인증번호 발송 API
   */
  @TypedRoute.Post('/email/certification')
  @TypedException<EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED>(
    EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED.status,
    '이메일 인증번호 발송 제한 초과',
  )
  @TypedException<AuthError.User.EMAIL_ALREADY_EXISTS>(
    AuthError.User.EMAIL_ALREADY_EXISTS.status,
    '이메일이 이미 존재합니다.',
  )
  async sendEmailVerificationCode(
    @TypedBody() { email, type }: Auth.SendEmailVerificationCodeDto,
  ): Promise<
    | SUCCESS<true>
    | EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED
    | UserError.EMAIL_ALREADY_EXISTS
  > {
    // 이메일 인증번호 발송
    const result =
      await this.emailCertificationService.sendEmailVerificationCode(
        email,
        type,
      );
    return eitherToResponse(result);
  }

  /**
   * 이메일 인증번호 확인 API
   *
   * 로컬 회원가입을 위한 이메일 인증번호를 확인합니다.
   * 인증번호가 일치하지 않으면 에러를 반환합니다.
   * 이미 가입된 이메일인 경우 에러를 반환합니다.
   * 인증번호는 15분간 유효합니다.
   *
   * 인증완료시 인증번호ID를 반환합니다.
   * 해당 ID는 회원가입시 사용됩니다.
   *
   * @author de-novo
   * @tag Auth
   * @summary 이메일 인증번호 확인 API
   */
  @TypedRoute.Post('/email/certification/verify')
  @TypedException<EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH>(
    EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH.status,
    '이메일 인증번호가 일치하지 않습니다.',
  )
  async verifyEmailCode(
    @TypedBody()
    { email, code, type }: Auth.VerifyEmailCodeDto,
  ): Promise<
    SUCCESS<{ id: string }> | EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH
  > {
    const result = await this.emailCertificationService.verifyEmailCode(
      email,
      code,
      type,
    );
    return eitherToResponse(result);
  }

  /**
   * 로그아웃 API
   *
   * 로그아웃시, 리프레시 토큰을 만료시킵니다.
   *
   * **주의**
   * 현재 access_token에대한 blacklist를 사용하지 않습니다. (추후 변경될수 있습니다.)
   * - access_token까지 redis로 관리할시, 세션과 사용하는 것과 같다 생각하여 사용하지 않습니다.
   *
   * 따라서, 각 클라이언트는 로그아웃시 access_token을 삭제해야합니다.
   * 웹의 경우 access_token을 삭제해야하며,
   * 앱의 경우 access_token과 refresh_token을 삭제해야합니다.
   *
   * @author de-novo
   * @tag Auth
   * @summary 로그아웃 API
   */
  @TypedRoute.Post('/logout')
  @UseGuards(RefreshGuard)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
    @TypedHeaders() headers: ClientHeader,
  ): Promise<SUCCESS<{ is_login: boolean }>> {
    if (headers['X-Client-Type'] !== process.env.CLIENT_TYPE) {
      res.clearCookie('_refresh_token');
    }

    await this.authService.logout(user);
    return wrapResponse({ is_login: false });
  }

  /**
   * 비밀번호 변경 API
   *
   * 비밀번호 api는 두가지 방식으로 사용될 수 있습니다.
   * - 현재 비밀번호를 사용하여 변경
   *     비밀번호는 단방향 암호화되어 저장되므로, 비밀번호를 변경할때는 현재 비밀번호를 입력해야합니다
   *     현재 비밀번호가 일치하지 않으면 에러를 반환합니다.
   *
   *
   * - 비밀번호 찾기를 통해 변경(이메일 인증번호를 사용하여 변경)
   *      비밀번호 찾기를 통해 변경할때는 이메일 인증번호를 사용하여 변경합니다.
   *
   *
   * **주의**
   * 비밀번호 변경시,해당 유저의 모든 리프레시 토큰을 만료시킵니다.
   * 따라서, 비밀번호 변경후에는 로그인을 다시 해야합니다.
   */
  @TypedRoute.Post('/password')
  async changePassword(
    @TypedBody()
    body: Auth.ChangePasswordDto,
  ): Promise<
    | SUCCESS<{ email: string }>
    | AuthError.User.USER_NOT_FOUND
    | AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED
    | AuthError.Authentication.INVALID_PASSWORD
    | AuthError.Authentication.INVALID_TYPE
  > {
    const result = await this.authService.changePassword(body);

    return eitherToResponse(result);
  }

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
