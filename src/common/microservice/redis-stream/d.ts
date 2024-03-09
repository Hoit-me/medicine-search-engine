import { MessagePattern } from '@nestjs/microservices';

export const RedisStreamHandler = (stream: string) => {
  console.log('stream', stream);
  return MessagePattern(stream);
};
