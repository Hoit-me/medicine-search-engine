import { INestiaConfig } from '@nestia/sdk';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    });
    return app;
  },
  output: 'src/api',
  swagger: {
    output: 'packages/api/swagger.json',
    beautify: true,
    security: {
      bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },

    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local Server',
      },
    ],
  },
  distribute: 'packages/api',
  simulate: true,
};
export default NESTIA_CONFIG;
