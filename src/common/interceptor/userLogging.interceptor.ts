import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, mergeMap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

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
 * - 유저로그의 경우 유저의 id가 필요하다.
 *    - 하지만, 로그인, 회원가입, 소셜 연결과 같은 과정에서는 유저의 id가 없을수있다.
 *    - 이러한 경우에는, 인터셉터가 아닌, 컨트롤러에서 로그를 저장하는것이 더 적합하다.
 *    - 따라서 해당 인터셉터의경우 guard와 함께 사용해야한다.
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
interface CreateUserLogDto {
  user_id: string;
  ip: string;
  user_agent: string;
  uri: string; /// real path /// ex: /api/v1/1234
  path: string; /// route path   /// ex: /api/v1/:id
  method: string;
  success: boolean;
  status_code: number;
  time: number;
  message: string;
}

@Injectable()
export class UserLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService, // 우선 prisma를 사용하여 로그를 저장
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();

    return (
      next
        .handle()
        // 요청을 처리한 후 로그 출력
        .pipe(
          mergeMap(async (data) => {
            const req = context.switchToHttp().getRequest();

            const user = req.user;
            if (!user.id) {
              return data;
            }
            const time = Date.now() - now;
            const uri = req.url;
            const route = req.route;
            const method = req.method;
            const ip = req.ip;
            const user_agent = req.headers['user-agent'];
            console.log(req.user);
            const payload: CreateUserLogDto = {
              user_id: '65e6a6f3847aa36939ccb96d',
              ip,
              user_agent,
              uri,
              path: route.path,
              method,
              success: data.is_success,
              status_code: data.status,
              message: data.message,
              time,
            };
            // 이벤트발급
            this.eventEmitter.emit('user.log', payload);

            // await this.prisma.user_log.create({
            //   data: payload,
            // });
            return data;
          }),
        )
    );
  }
}
