import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { isError, throwError } from '../res/error';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => {
        console.log('ResponseInterceptor', data);
        if (isError(data)) {
          return throwError(data);
        }
        return data;
      }),
    );
  }
}
