import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace ApiKeyError {
  // API 키가 존재하지 않는 경우
  export type API_KEY_NOT_FOUND = ERROR<
    'API_KEY_NOT_FOUND',
    HttpStatus.BAD_REQUEST
  >;
  export const API_KEY_NOT_FOUND = typia.random<API_KEY_NOT_FOUND>();
}
