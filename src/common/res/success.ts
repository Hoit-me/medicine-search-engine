import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ERROR } from '@src/type/error';
import { SUCCESS } from '@src/type/success';
import { isError } from './error';

export const generateResponse = <T>(
  result: T,
  message: string = 'SUCCESS',
): SUCCESS<T> => ({
  is_success: true,
  message,
  result,
});

type WrapResponse<T> =
  T extends ERROR<string, ErrorHttpStatusCode> ? T : SUCCESS<T>;
export const wrapResponse = <T>(result: T): WrapResponse<T> => {
  if (isError(result)) {
    return result as WrapResponse<T>;
  }
  return generateResponse(result) as WrapResponse<T>;
};
