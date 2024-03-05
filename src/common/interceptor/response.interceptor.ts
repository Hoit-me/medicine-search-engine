import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { isError, throwError } from '../res/error';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_, next: CallHandler<T>) {
    console.log('ResponseInterceptor-----------------');
    return next.handle().pipe(
      map((data) => {
        console.log('pipe:ResponseInterceptor-----');
        if (isError(data)) {
          return throwError(data);
        }
        return data;
      }),
    );
  }
}
