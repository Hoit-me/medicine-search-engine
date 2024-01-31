import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AwsModule } from './common/aws/aws.module';
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
    CacheModule.register({
      isGlobal: true,
    }),
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
