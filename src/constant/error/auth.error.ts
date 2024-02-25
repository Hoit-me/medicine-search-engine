import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace AuthError {
  // 이메일 인증이 되지 않은 경우
  export type AUTH_NOT_VERIFIED = ERROR<
    'AUTH_NOT_VERIFIED',
    HttpStatus.UNAUTHORIZED
  >;
  export const AUTH_NOT_VERIFIED = typia.random<AUTH_NOT_VERIFIED>();

  // 비밀번호가 일치하지 않은 경우
  export type INVALID_PASSWORD = ERROR<
    'INVALID_PASSWORD.',
    HttpStatus.UNAUTHORIZED
  >;
  export const INVALID_PASSWORD = typia.random<INVALID_PASSWORD>();

  // 토큰이 유효하지 않은 경우
  export type TOKEN_INVALID = ERROR<'TOKEN_INVALID', HttpStatus.UNAUTHORIZED>;
  export const TOKEN_INVALID = typia.random<TOKEN_INVALID>();

  // 토큰이 만료된 경우
  export type TOKEN_EXPIRED = ERROR<'TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED>;
  export const TOKEN_EXPIRED = typia.random<TOKEN_EXPIRED>();

  // 사용자가 존재하지 않는 경우
  export type USER_NOT_FOUND = ERROR<'USER_NOT_FOUND', HttpStatus.NOT_FOUND>;
  export const USER_NOT_FOUND = typia.random<USER_NOT_FOUND>();

  // 계정이 잠긴 경우
  export type ACCOUNT_LOCKED = ERROR<'ACCOUNT_LOCKED', HttpStatus.FORBIDDEN>;
  export const ACCOUNT_LOCKED = typia.random<ACCOUNT_LOCKED>();

  // 토큰이 없는 경우
  export type TOKEN_MISSING = ERROR<'TOKEN_MISSING', HttpStatus.BAD_REQUEST>;
  export const TOKEN_MISSING = typia.random<TOKEN_MISSING>();

  // 권한이 없는 경우
  export type PERMISSION_DENIED = ERROR<
    'PERMISSION_DENIED',
    HttpStatus.FORBIDDEN
  >;
  export const PERMISSION_DENIED = typia.random<PERMISSION_DENIED>();
}
