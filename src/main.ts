import { RedisStreamServer } from '@de-novo/nestjs-redis-streams';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
async function bootstrap() {
  console.log(process.memoryUsage());

  const app = await NestFactory.create(AppModule);
  // const micro = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.REDIS,
  //     options: {
  //       host: 'localhost',
  //       port: 6379,
  //       name: 'medicine-search',
  //     },
  //   },
  // );
  // micro.listen();
  const micro = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new RedisStreamServer({
        connection: {
          path: process.env.REDIS_URL!,
        },
        streams: {
          consumer: process.env.CONSUMER!,
          consumerGroup: process.env.CONSUMER_GROUP!,
        },
      }),
    },
  );
  micro.listen();

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.REDIS,
  //   options: {
  //     host: 'localhost',
  //     port: 6379,
  //     name: 'user-log',
  //   },
  // });
  // app.startAllMicroservices();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  app.use(cookieParser());

  const docs = await import('../packages/api/swagger.json' as any);
  SwaggerModule.setup('docs', app, docs, {
    swaggerOptions: {},
  });

  await app.listen(8000);
}
bootstrap();
