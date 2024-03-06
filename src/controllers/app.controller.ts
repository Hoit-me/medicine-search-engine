import { TypedRoute } from '@nestia/core';
import { Controller, Param, UseInterceptors } from '@nestjs/common';
import { UserLoggingInterceptor } from '@src/common/interceptor/userLogging.interceptor';
import { wrapResponse } from '@src/common/res/success';
import { AppService } from '../app.service';

@Controller({ path: '/' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * health-check
   *
   *
   * @author de-novo
   * @tag health-check
   * @summary health-check
   *
   * @return 200 - OK
   */
  @TypedRoute.Get('/health-check')
  async healthCheck(): Promise<string> {
    return await this.appService.healthCheck();
  }

  /**
   * 현재 메모리사용량 측정 API 입니다.
   */
  @TypedRoute.Get('/performance')
  async performance() {
    return this.appService.performance();
  }

  /**
   * 인터셉터 테스트
   */
  @TypedRoute.Get('/interceptor/:test')
  @UseInterceptors(UserLoggingInterceptor)
  async interceptor(@Param('test') test: string) {
    if (test === 'error') {
      console.log('interceptor test', test);
      throw new Error('interceptor test error');
    }
    return wrapResponse('interceptor test');
  }
}
