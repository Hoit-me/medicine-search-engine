import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ERROR } from '@src/type/error';
import { SUCCESS } from '@src/type/success';
import { from, map } from 'rxjs';
import { isError } from './error';

export const generateResponse = <T>(
  result: T,
  message: string = 'SUCCESS',
): SUCCESS<T> => ({
  is_success: true,
  message,
  result,
});

export const wrapResponse = <T>(
  result: Promise<T | ERROR<string, ErrorHttpStatusCode>>,
) =>
  from(result).pipe(
    map((data) => {
      console.log('wrapResponse', data);
      if (isError(data)) {
        return data;
      }
      return generateResponse(data);
    }),
    map((data) => {
      console.log('wrapResponse', data);
      if (isError(data)) {
        return data;
      }
      return data;
    }),
  );
