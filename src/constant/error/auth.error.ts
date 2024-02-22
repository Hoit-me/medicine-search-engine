import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace AuthError {
  export type AUTH_NOT_VERIFIED = ERROR<
    '인증되지 않은 사용자입니다.',
    HttpStatus.UNAUTHORIZED
  >;
  export const AUTH_NOT_VERIFIED = typia.random<AUTH_NOT_VERIFIED>();

  export type INVALID_PASSWORD = ERROR<
    '비밀번호가 일치하지 않습니다.',
    HttpStatus.UNAUTHORIZED
  >;
  export const INVALID_PASSWORD = typia.random<INVALID_PASSWORD>();

  export type TOKEN_INVALID = ERROR<
    '토큰이 유효하지 않습니다.',
    HttpStatus.UNAUTHORIZED
  >;
  export const TOKEN_INVALID = typia.random<TOKEN_INVALID>();

  export type TOKEN_EXPIRED = ERROR<
    '토큰이 만료되었습니다.',
    HttpStatus.UNAUTHORIZED
  >;
  export const TOKEN_EXPIRED = typia.random<TOKEN_EXPIRED>();

  export type USER_NOT_FOUND = ERROR<
    '사용자를 찾을 수 없습니다.',
    HttpStatus.NOT_FOUND
  >;
  export const USER_NOT_FOUND = typia.random<USER_NOT_FOUND>();

  export type ACCOUNT_LOCKED = ERROR<
    '계정이 잠겼습니다.',
    HttpStatus.FORBIDDEN
  >;
  export const ACCOUNT_LOCKED = typia.random<ACCOUNT_LOCKED>();

  export type TOKEN_MISSING = ERROR<
    '토큰이 제공되지 않았습니다.',
    HttpStatus.BAD_REQUEST
  >;
  export const TOKEN_MISSING = typia.random<TOKEN_MISSING>();

  export type PERMISSION_DENIED = ERROR<
    '권한이 거부되었습니다.',
    HttpStatus.FORBIDDEN
  >;
  export const PERMISSION_DENIED = typia.random<PERMISSION_DENIED>();
}
