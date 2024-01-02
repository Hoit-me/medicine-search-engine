import { TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
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
  @TypedRoute.Get('health-check')
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
