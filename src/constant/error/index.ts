import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export type SERVER_ERROR = ERROR<
  'SERVER_ERROR',
  HttpStatus.INTERNAL_SERVER_ERROR
>;
export const SERVER_ERROR = typia.random<SERVER_ERROR>();
