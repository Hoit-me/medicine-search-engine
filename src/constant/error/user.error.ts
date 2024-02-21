import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace UserError {
  export type EMAIL_ALREADY_EXISTS = ERROR<
    '이미 가입된 이메일입니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_ALREADY_EXISTS = typia.random<EMAIL_ALREADY_EXISTS>();

  export type NICKNAME_ALREADY_EXISTS = ERROR<
    '이미 존재하는 닉네임입니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const NICKNAME_ALREADY_EXISTS =
    typia.random<NICKNAME_ALREADY_EXISTS>();

  export type NOT_FOUND_USER = ERROR<
    '존재하지 않는 유저입니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const NOT_FOUND_USER = typia.random<NOT_FOUND_USER>();

  export type INVALID_PASSWORD = ERROR<
    '비밀번호가 일치하지 않습니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const INVALID_PASSWORD = typia.random<INVALID_PASSWORD>();
}
