import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SERVER_ERROR } from '@src/constant/error';
import { sendErrorReportToSlack } from '@src/utils/sendErrorReportToSlack';
import { Observable, catchError, of } from 'rxjs';

/**
 * ServerErrorInterceptor
 *
 * 서버의 예상치못한에러 발생시, 알림을 보내는 인터셉터
 *
 *
 * 1. 예상치 못한 에러 (500)이 발생했을때, 슬랙으로 에러를 알림을 보낸다.
 *
 *
 */
@Injectable()
export class ServerErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const type = context.getType();
    if (type !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const endpoint = req.url;
    const method = req.method;
    const ip = req.ip;
    const userAgent = req?.headers?.['user-agent'];
    const referer = req?.headers?.['referer'];
    return (
      next
        .handle()
        // 요청을 처리한 후 로그 출력
        .pipe(
          catchError((error) => {
            process.env.NODE_ENV === 'production' &&
              sendErrorReportToSlack({
                method,
                endpoint,
                ip,
                userAgent,
                referer,
                error,
              });
            return of(error.response || SERVER_ERROR);
          }),
        )
    );
  }
}
