import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MedicineBatchModule } from './batch/medicine/medicineBatch.module';
import { AwsModule } from './common/aws/aws.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ServerErrorInterceptor } from './common/interceptor/serverError.interceptor';
import { UserLogConsumer } from './comsumer/userLog.consumer';
import { defaultModules } from './config';
import { AppController } from './controllers/app.controller';
import { ApiKeyModule } from './modules/apiKey.module';
import { MedicineModule } from './modules/medicine.module';
@Module({
  imports: [
    ...defaultModules,

    MedicineModule,
    MedicineBatchModule,
    ApiKeyModule,
    AwsModule,
    AuthModule,
  ],
  controllers: [AppController, UserLogConsumer],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ServerErrorInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: UserLoggingInterceptor,
    // },
  ],
})
export class AppModule {}
