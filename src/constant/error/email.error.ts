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

  export type EMAIL_CERTIFICATION_CODE_NOT_MATCH = ERROR<
    '인증번호가 일치하지 않습니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_CODE_NOT_MATCH =
    typia.random<EMAIL_CERTIFICATION_CODE_NOT_MATCH>();

  export type EMAIL_CERTIFICATION_NOT_VERIFIED = ERROR<
    '이메일 인증이 되지 않았습니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_NOT_VERIFIED =
    typia.random<EMAIL_CERTIFICATION_NOT_VERIFIED>();
}
