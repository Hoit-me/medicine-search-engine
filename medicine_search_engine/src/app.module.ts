import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicineBatchModule } from './batch/medicine/medicineBatch.module';
import { AwsModule } from './common/aws/aws.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MedicineBatchModule,
    {
      ...HttpModule.register({
        timeout: 100000,
        maxRedirects: 0,
      }),
      global: true,
    },
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
