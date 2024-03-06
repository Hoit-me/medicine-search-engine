import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-store';
import Joi from 'joi';
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

export const config = () => {
  const port = parseInt(process.env.PORT ?? '8000', 10);
  return { port };
};

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  load: [config],
});

export const httpModule = {
  ...HttpModule.register({
    timeout: 100000,
    maxRedirects: 0,
  }),
  global: true,
};

export const cacheModule = CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => {
    try {
      const url = process.env.REDIS_URL;
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

export const scheduleModule = ScheduleModule.forRoot();

export const eventEmitterModule = EventEmitterModule.forRoot({});

export const defaultModules = [
  configModule,
  httpModule,
  cacheModule,
  scheduleModule,
  eventEmitterModule,
];
