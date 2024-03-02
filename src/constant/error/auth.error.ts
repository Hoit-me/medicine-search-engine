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

  export namespace OAUTH {
    // 소셜 계정 연동에 실패한 경우
    export type SOCIAL_ACCOUNT_LINKING_FAILED = ERROR<
      'SOCIAL_ACCOUNT_LINKING_FAILED',
      HttpStatus.INTERNAL_SERVER_ERROR
    >;
    export const SOCIAL_ACCOUNT_LINKING_FAILED =
      typia.random<SOCIAL_ACCOUNT_LINKING_FAILED>();

    // 소셜 서비스로부터 응답을 받지 못한 경우
    export type SOCIAL_SERVICE_RESPONSE_ERROR = ERROR<
      'SOCIAL_SERVICE_RESPONSE_ERROR',
      HttpStatus.BAD_GATEWAY
    >;
    export const SOCIAL_SERVICE_RESPONSE_ERROR =
      typia.random<SOCIAL_SERVICE_RESPONSE_ERROR>();

    // 소셜 인증 정보 누락
    export type SOCIAL_AUTH_INFO_MISSING = ERROR<
      'SOCIAL_AUTH_INFO_MISSING',
      HttpStatus.BAD_REQUEST
    >;
    export const SOCIAL_AUTH_INFO_MISSING =
      typia.random<SOCIAL_AUTH_INFO_MISSING>();

    // 소셜 인증 실패
    export type SOCIAL_AUTH_FAILED = ERROR<
      'SOCIAL_AUTH_FAILED',
      HttpStatus.UNAUTHORIZED
    >;
    export const SOCIAL_AUTH_FAILED = typia.random<SOCIAL_AUTH_FAILED>();

    // 소셜 서비스 접근 거부
    export type SOCIAL_SERVICE_ACCESS_DENIED = ERROR<
      'SOCIAL_SERVICE_ACCESS_DENIED',
      HttpStatus.FORBIDDEN
    >;
    export const SOCIAL_SERVICE_ACCESS_DENIED =
      typia.random<SOCIAL_SERVICE_ACCESS_DENIED>();

    // 이미 연동된 소셜 계정
    export type SOCIAL_ACCOUNT_ALREADY_LINKED = ERROR<
      'SOCIAL_ACCOUNT_ALREADY_LINKED',
      HttpStatus.BAD_REQUEST
    >;
    export const SOCIAL_ACCOUNT_ALREADY_LINKED =
      typia.random<SOCIAL_ACCOUNT_ALREADY_LINKED>();
  }
}
