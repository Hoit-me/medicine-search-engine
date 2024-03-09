import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { UserLogService } from '@src/services/userLog.service';
import { Log } from '@src/type/log.type';

@Controller()
export class UserLogConsumer {
  constructor(private readonly userLogService: UserLogService) {}
  @MessagePattern('user.log')
  async handleUserLog(@Payload() log: Log.User.Paylaod, @Ctx() ctx: any) {
    console.log('user log', log, ctx);
    // console.log('user log ', ctx, log);
    // console.log(typia.assert<Log.User.Paylaod>(log));
    // await this.userLogService.create(log.data);
    return true;
  }

  // @MessagePattern('user.log.test')
  // async handleUserLogTest(@Payload() log: Log.User.Paylaod, @Ctx() ctx: any) {
  //   console.log('user log test', ctx, log);
  //   return true;
  // }
}
