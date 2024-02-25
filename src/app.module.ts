import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './common/aws/aws.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { PrismaModule } from './common/prisma/prisma.module';
import { defaultModules } from './config';
import { AppController } from './controllers/app.controller';
import { ApiKeyModule } from './modules/apiKey.module';
import { MedicineModule } from './modules/medicine.module';
@Module({
  imports: [
    ...defaultModules,
    PrismaModule,
    MedicineModule,
    ApiKeyModule,
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
