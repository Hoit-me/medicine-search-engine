import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SERVER_ERROR } from '@src/constant/error';
import { sendErrorReportToSlack } from '@src/utils/sendErrorReportToSlack';
import { Observable, catchError, of, tap } from 'rxjs';

/**
 * ServerErrorInterceptor
 *
 * 서버의 예상치못한에러 발생시, 알림을 보내는 인터셉터
 *
 * 1. 서버의 에러스택을 파악하여,에러를 해결할수있는 정보를 제공한다.
 *
 *
 */
@Injectable()
export class ServerErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('ServerErrorInterceptor');
    const req = context.switchToHttp().getRequest();
    const endpoint = req.url;
    const method = req.method;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'];

    return (
      next
        .handle()
        // 요청을 처리한 후 로그 출력
        .pipe(
          tap(() => console.log(`pipe:ServerErrorInterceptor`)),
          catchError((error) => {
            sendErrorReportToSlack({
              method,
              endpoint,
              ip,
              userAgent,
              referer,
              error,
            });
            return of(SERVER_ERROR);
          }),
        )
    );
  }
}
