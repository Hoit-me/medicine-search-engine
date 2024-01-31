import { HttpModule } from '@nestjs/axios';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';
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
  providers: [AppService],
})
export class AppModule {}
