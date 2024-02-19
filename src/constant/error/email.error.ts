import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace EmailError {
  export type EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED = ERROR<
    '인증번호 발송 횟수를 초과하였습니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED =
    typia.random<EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED>();

  export type EMAIL_ALREADY_EXISTS = ERROR<
    '이미 가입된 이메일입니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_ALREADY_EXISTS = typia.random<EMAIL_ALREADY_EXISTS>();
}
