import { tags } from 'typia';

export namespace Auth {
  export type Type = 'local' | 'google' | 'kakao' | 'naver';

  export interface Oauth {
    /**
     * 로그인 타입
     * - local: 이메일, 비밀번호
     * - google: 구글 로그인
     * - kakao: 카카오 로그인
     */
    type: Oauth.Provider;
    /**
     * 인증 코드
     */
    code: string;
    /**
     * 리다이렉트 URI
     */
    redirect_uri: string;

    /**
     * state
     * ex:
     * naver
     */
    state?: string;
    /**
     * 자동 로그인 여부
     * @default false
     */
    auto_login?: boolean;
  }
  export namespace Oauth {
    export type Provider = Exclude<Type, 'local'>;
    export namespace Kakao {
      export interface GetTokenResponse {
        access_token: string;
        token_type: string;
        refresh_token: string;
        expires_in: number;
        scope: string;
        refresh_token_expires_in: number;
      }

      export interface GetUserInfoResponse {
        id: number;
        connected_at: string;
        kakao_account: {
          has_email: boolean;
          email_needs_agreement: boolean;
          is_email_valid: boolean;
          is_email_verified: boolean;
          email: string;
        };
      }
    }

    export namespace Naver {
      export interface GetTokenResponse {
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: string;
      }
      export interface GetUserInfoResponse {
        resultcode: string;
        message: string;
        response: {
          id: string;
          nickname: string;
          profile_image: string;
          age: string;
          email: string;
        };
      }
    }

    export namespace Google {
      export interface GetTokenResponse {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
        id_token: string;
      }
      export interface GetUserInfoResponse {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email: string;
        email_verified: boolean;
        locale: string;
      }
    }
  }

  export type Local = {
    /**
     * 로그인 타입
     * - local: 이메일, 비밀번호
     * - google: 구글 로그인
     * - kakao: 카카오 로그인
     */
    type: Extract<Type, 'local'>;
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
    type: 'SIGN_UP' | 'FIND_PASSWORD';
  };

  export type VerifyEmailCodeDto = {
    email: string & tags.Format<'email'>;
    code: string & tags.MinLength<6> & tags.MaxLength<6>;
    type: 'SIGN_UP' | 'FIND_PASSWORD';
  };

  export type PasswordChangeViaEmailVerificationDto = {
    email: string & tags.Format<'email'>;
    password: string;
    email_certification_id: string;
    type: 'FIND_PASSWORD';
  };
  export type PasswordChangeViaCurrentPasswordDto = {
    email: string & tags.Format<'email'>;
    password: string;
    current_password: string;
    type: 'PROFILE';
  };

  export type ChangePasswordDto =
    | PasswordChangeViaEmailVerificationDto
    | PasswordChangeViaCurrentPasswordDto;
}
