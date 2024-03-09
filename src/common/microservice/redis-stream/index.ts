import { ServerConstructorOptions } from './interface';
import { RedisStreamServer } from './redis-stream.server.refac';

export const createResdiStreamOptions = (options: ServerConstructorOptions) => {
  return {
    strategy: new RedisStreamServer(options),
  };
};
