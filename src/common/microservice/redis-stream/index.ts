import { ConstructorOptions } from './interface';
import { RedisStreamServer } from './redis-stream.server';

export const createResdiStreamOptions = (options: ConstructorOptions) => {
  return {
    strategy: new RedisStreamServer(options),
  };
};
