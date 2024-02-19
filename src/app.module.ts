import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './common/aws/aws.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { PrismaModule } from './common/prisma/prisma.module';
import { defaultModules } from './config';
import { AppController } from './controllers/app.controller';
import { MedicineModule } from './modules/medicine.module';
@Module({
  imports: [
    ...defaultModules,
    PrismaModule,
    MedicineModule,
    // MedicineBatchModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: '.env',
    //   load: [config],
    // }),
    // {
    //   ...HttpModule.register({
    //     timeout: 100000,
    //     maxRedirects: 0,
    //   }),
    //   global: true,
    // },
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => {
    //     try {
    //       const url = process.env.REDIS_URL;
    //       const store = await redisStore({
    //         url,
    //       });
    //       return {
    //         ttl: 60 * 60 * 24,
    //         store: store,
    //       } as unknown as CacheStore;
    //     } catch (e) {
    //       return {};
    //     }
    //   },
    // }),
    AwsModule,
    AuthModule,
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
