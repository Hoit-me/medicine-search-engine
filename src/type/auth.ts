import { tags } from 'typia';

export namespace Auth {
  export type LoginType = 'local' | 'google' | 'kakao';
  export interface Oauth {
    /**
     * 로그인 타입
     * - local: 이메일, 비밀번호
     * - google: 구글 로그인
     * - kakao: 카카오 로그인
     */
    type: Exclude<LoginType, 'local'>;
    /**
     * 인증 코드
     */
    code: string;
    /**
     * 리다이렉트 URI
     */
    redirect_uri: string;
  }

  export type Local = {
    /**
     * 로그인 타입
     * - local: 이메일, 비밀번호
     * - google: 구글 로그인
     * - kakao: 카카오 로그인
     */
    type: Extract<LoginType, 'local'>;
    /**
     * 이메일
     */
    email: string & tags.Format<'email'>;

    /**
     * 비밀번호
     * @minLength 8
     */
    password: string;
  };

  export type LoginDto = Oauth | Local;
  export type SignupDto =
    | Oauth
    | (Local & { nickname: string; email_certification_id: string });

  export type SendEmailVerificationCodeDto = {
    email: string & tags.Format<'email'>;
  };

  export type VerifyEmailCodeDto = {
    email: string & tags.Format<'email'>;
    code: string & tags.MinLength<6> & tags.MaxLength<6>;
  };
}
