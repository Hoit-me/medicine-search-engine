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
}
