import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-store';
import { AppService } from './app.service';
import { AwsModule } from './common/aws/aws.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppController } from './controllers/app.controller';
import { MedicineModule } from './modules/medicine.module';
@Module({
  imports: [
    PrismaModule,
    // MedicineBatchModule,
    MedicineModule,
    {
      ...HttpModule.register({
        timeout: 100000,
        maxRedirects: 0,
      }),
      global: true,
    },
    CacheModule.registerAsync({
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
    }),
    AwsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
