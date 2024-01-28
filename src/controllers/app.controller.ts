import { TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
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
}
