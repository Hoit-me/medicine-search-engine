import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { RedisStreamHandler } from '@src/common/microservice/redis-stream/d';

@Controller()
export class UserLogConsumer {
  @RedisStreamHandler('user.log')
  async handleUserLog(@Payload() log: any) {
    console.log('UserLogConsumer', log);
  }
}
