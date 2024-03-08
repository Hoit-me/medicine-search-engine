import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { RedisStreamHandler } from '@src/common/microservice/redis-stream/d';
import { UserLogService } from '@src/services/userLog.service';
import { Log } from '@src/type/log.type';
import typia from 'typia';

@Controller()
export class UserLogConsumer {
  constructor(private readonly userLogService: UserLogService) {}
  @RedisStreamHandler('user.log')
  async handleUserLog(@Payload() log: Log.User.Paylaod) {
    console.log('user log', log);
    console.log(typia.assert<Log.User.Paylaod>(log));
    await this.userLogService.create(log.data);
    return true;
  }
}
