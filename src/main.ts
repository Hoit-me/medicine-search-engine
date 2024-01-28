import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(process.memoryUsage());

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  await app.listen(8000);
}
bootstrap();
