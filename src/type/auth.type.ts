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

    /**
     * 자동 로그인 여부
     * @default false
     */
    auto_login?: boolean;
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
    /**
     * 자동 로그인 여부
     * @default false
     */
    auto_login?: boolean;
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

  export namespace ApiKey {
    export interface CreateDto {
      /**
       * API 키 이름
       * @default 'default'
       */
      name?: string;

      /**
       * API 키 과금 플랜 ID
       *
       * 해당 요소는 과금 정책에 따라 선택적으로 사용됩니다.
       * 현재는 사용되지 않습니다.
       * - 결제기능이 추가되면 사용될 예정입니다.
       */
      // plan_id?: string;
    }
  }
}
