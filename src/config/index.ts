import { RedisModule } from '@liaoliaots/nestjs-redis';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisStreamClientModule } from '@src/common/microservice/redis-stream/redis-stream.client.module';
import { PrismaModule } from '@src/common/prisma/prisma.module';
import { redisStore } from 'cache-manager-redis-store';
import Joi from 'joi';

//// validate .env file
export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(8000),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  API_KEY: Joi.string().required(),
  API_KEY_DECODED: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  S3_AWS_ACCESS_KEY_ID: Joi.string().required(),
  S3_AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET: Joi.string().required(),
  MAIL_SERVICE: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_USER: Joi.string().required(),
});

//// load config
export const config = () => {
  const port = parseInt(process.env.PORT ?? '8000', 10);
  return { port };
};

//// export modules
///////// configModule
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  load: [config],
});

///////// httpModule
export const httpModule = {
  ...HttpModule.register({
    timeout: 100000,
    maxRedirects: 0,
  }),
  global: true,
};

///////// cacheModule
export const cacheModule = CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => {
    try {
      const url = process.env.CACHE_URL;
      const store = await redisStore({
        url,
      });
      return {
        ttl: 60 * 60 * 24,
        store: store,
      } as unknown as CacheStore;
    } catch (e) {
      return {};
    }
  },
});

///////// scheduleModule
export const scheduleModule = ScheduleModule.forRoot();

///////// eventEmitterModule
export const eventEmitterModule = EventEmitterModule.forRoot({});

///////// RedisModule
export const redisModule = RedisModule.forRoot(
  {
    readyLog: true,
    config: {
      url: process.env.REDIS_URL!,
    },
  },
  true,
);

///////// microserviceModule
export const clinetModule = RedisStreamClientModule.register({
  connection: { path: process.env.REDIS_URL! },
  streams: { consumer: 'api-1', block: 5000, consumerGroup: 'api' },
  responseStreams: ['user.log', 'users:created:copy'],
});
// export const clinetModule = ClientsModule.register({
//   clients: [
//     {
//       name: process.env.MICROSERVICE_NAME!,
//       transport: Transport.REDIS,
//       options: {
//         host: process.env.REDIS_HOST,
//         port: parseInt(process.env.REDIS_PORT!, 10),
//       },
//     },
//   ],
//   isGlobal: true,
// });

export const defaultModules = [
  configModule,
  httpModule,
  cacheModule,
  redisModule,
  scheduleModule,
  eventEmitterModule,
  PrismaModule,
  clinetModule,
];
