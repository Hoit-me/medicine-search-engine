import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/index';
import typia from 'typia';

export namespace Error {
  export namespace Auth {
    export type MEMBER_NOT_EXIST = ERROR<
      'MEMBER_NOT_EXIST',
      HttpStatus.BAD_REQUEST
    >;
    export const MEMBER_NOT_EXIST = typia.random<MEMBER_NOT_EXIST>();
    export type EMAIL_ALREADY_EXIST = ERROR<
      'EMAIL_ALREADY_EXIST',
      HttpStatus.BAD_REQUEST
    >;
    export const EMAIL_ALREADY_EXIST = typia.random<EMAIL_ALREADY_EXIST>();

    export type EMAIL_NOT_EXIST = ERROR<
      'EMAIL_NOT_EXIST',
      HttpStatus.BAD_REQUEST
    >;
    export const EMAIL_NOT_EXIST = typia.random<EMAIL_NOT_EXIST>();

    export type EMAIL_ALREADY_VERIFIED = ERROR<
      'EMAIL_ALREADY_VERIFIED',
      HttpStatus.BAD_REQUEST
    >;
    export const EMAIL_ALREADY_VERIFIED =
      typia.random<EMAIL_ALREADY_VERIFIED>();

    export type EMAIL_NOT_VERIFIED = ERROR<
      'EMAIL_NOT_VERIFIED',
      HttpStatus.BAD_REQUEST
    >;
    export const EMAIL_NOT_VERIFIED = typia.random<EMAIL_NOT_VERIFIED>();

    export type INVALID_PASSWORD = ERROR<
      'INVALID_PASSWORD',
      HttpStatus.BAD_REQUEST
    >;
    export const INVALID_PASSWORD = typia.random<INVALID_PASSWORD>();

    export type INVALID_CODE = ERROR<'INVALID_CODE', HttpStatus.BAD_REQUEST>;
    export const INVALID_CODE = typia.random<INVALID_CODE>();

    export type VERIFICATION_CODE_ALREADY_VERIFIED = ERROR<
      'VERIFICATION_CODE_ALREADY_VERIFIED',
      HttpStatus.BAD_REQUEST
    >;
    export const VERIFICATION_CODE_ALREADY_VERIFIED =
      typia.random<VERIFICATION_CODE_ALREADY_VERIFIED>();
  }
}
