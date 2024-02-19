import { tags } from 'typia';

export namespace Auth {
  export type SendEmailVerificationCodeDto = {
    email: string & tags.Format<'email'>;
  };

  export type VerifyEmailCodeDto = {
    email: string & tags.Format<'email'>;
    code: string & tags.MinLength<6> & tags.MaxLength<6>;
  };

  export type SignUpDto = {
    email: string;
    password: string;
    name: string;
  };
}
