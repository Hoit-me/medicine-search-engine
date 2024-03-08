import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '@src/app.service';
import { defaultModules } from '@src/config';
import { AppController } from '@src/controllers/app.controller';
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ...defaultModules,
        RedisModule.forRoot(
          {
            readyLog: true,
            config: {
              url: process.env.REDIS_URL!,
            },
          },
          true,
        ),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('성공시 OK를 반환한다.', async () => {
      const result = await appController.healthCheck();
      expect(result).toBe('OK');
    });
  });
});
