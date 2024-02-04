import { HttpException } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ERROR } from './../../type/error';

export const isError = (
  error: any,
): error is ERROR<string, ErrorHttpStatusCode> => {
  return error.is_success === false;
};

export const throwError = (err: ERROR<string, ErrorHttpStatusCode>) => {
  throw new HttpException(err, err.status);
};
