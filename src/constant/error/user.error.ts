import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace UserError {
  // 이미 가입된 이메일인 경우
  export type EMAIL_ALREADY_EXISTS = ERROR<
    'EMAIL_ALREADY_EXISTS',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_ALREADY_EXISTS = typia.random<EMAIL_ALREADY_EXISTS>();

  // 이미 가입된 닉네임인 경우
  export type NICKNAME_ALREADY_EXISTS = ERROR<
    'NICKNAME_ALREADY_EXISTS',
    HttpStatus.BAD_REQUEST
  >;
  export const NICKNAME_ALREADY_EXISTS =
    typia.random<NICKNAME_ALREADY_EXISTS>();

  // 존재하지 않는 사용자인 경우
  export type NOT_FOUND_USER = ERROR<'NOT_FOUND_USER', HttpStatus.BAD_REQUEST>;
  export const NOT_FOUND_USER = typia.random<NOT_FOUND_USER>();

  // 비밀번호가 일치하지 않는 경우
  export type INVALID_PASSWORD = ERROR<
    'INVALID_PASSWORD',
    HttpStatus.BAD_REQUEST
  >;
  export const INVALID_PASSWORD = typia.random<INVALID_PASSWORD>();

  // 소셜 계정이 연동되어있지 않은 경우
  export type NOT_FOUND_USER_SOCIAL_INFO = ERROR<
    'NOT_FOUND_USER_SOCIAL_INFO',
    HttpStatus.BAD_REQUEST
  >;
  export const NOT_FOUND_USER_SOCIAL_INFO =
    typia.random<NOT_FOUND_USER_SOCIAL_INFO>();
}
