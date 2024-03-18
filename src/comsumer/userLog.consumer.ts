import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserLogService } from '@src/services/userLog.service';
import { Log } from '@src/type/log.type';
import typia from 'typia';

@Controller()
export class UserLogConsumer {
  constructor(private readonly userLogService: UserLogService) {}
  @MessagePattern('user.log')
  async handleUserLog(@Payload() log: Log.User) {
    typia.is<Log.User>(log) && (await this.userLogService.create(log));
    return true;
  }
}
