import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace EmailError {
  // 이메일 인증요청 횟수 초과
  export type EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED = ERROR<
    'EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED =
    typia.random<EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED>();

  // 이메일 인증번호가 일치하지 않은 경우
  export type EMAIL_CERTIFICATION_CODE_NOT_MATCH = ERROR<
    'EMAIL_CERTIFICATION_CODE_NOT_MATCH',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_CODE_NOT_MATCH =
    typia.random<EMAIL_CERTIFICATION_CODE_NOT_MATCH>();

  // 이메일 인증이 되지 않은 경우
  export type EMAIL_CERTIFICATION_NOT_VERIFIED = ERROR<
    'EMAIL_CERTIFICATION_NOT_VERIFIED',
    HttpStatus.BAD_REQUEST
  >;
  export const EMAIL_CERTIFICATION_NOT_VERIFIED =
    typia.random<EMAIL_CERTIFICATION_NOT_VERIFIED>();
}
