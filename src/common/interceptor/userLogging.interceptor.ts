import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * logging.interceptor.ts
 *
 * 로그를 인터셉터로 관리?
 *
 * 1. 응답까지 걸리는 시간계산 필요
 * 2. 성공, 실패 여부기록 필요
 *
 * 한계.
 * - 인터셉터에서 에러가 발생 할 경우, api 사용자는 응답을 받지 못하게 된다.
 * - 로그데이터를 저장하는시간만큼 응답시간이 길어진다.
 *
 * 한계극복
 * - 인터셉터에서 로그데이터를 적합한 형태로 가공하여, 이벤트 버스를 통해 로그를 전송한다.
 * - 이벤트 버스를 통해 로그를 전송하면, 로그데이터를 저장하는 시간이 응답시간에 영향을 미치지 않는다.
 *
 * 추가고민
 * - 이벤트 버스를 사용했을때, 저장하는단계에서 에러가 발생할경우 어떻게 처리할것인가?
 *      - 슬랙등과 같은 채널을 통해 에러정보를 전송하여, 빠르게 대응할수있도록 한다.
 * - 이벤트 버스를 사용했을때, 로그데이터를 저장하는 시간이 길어지는 문제를 어떻게 해결할것인가?
 *      - 로그데이터를 저장하는 시간이 길어지는 문제를 해결하기 위해서는,
 *        배치작업을 통해 로그데이터를 저장하는 시간을 최소화하거나,
 *        로그데이터를 저장하는 서버를 확장하여, 로그데이터를 저장하는 시간을 최소화한다.
 *
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();

    return (
      next
        .handle()
        // 요청을 처리한 후 로그 출력
        .pipe(tap(() => console.log(`After log... ${Date.now() - now} ms`)))
    );
  }
}
