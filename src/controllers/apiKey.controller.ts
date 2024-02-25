import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@src/auth/auth.interface';
import { AuthGuard } from '@src/auth/guard/auth.guard';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { wrapResponse } from '@src/common/res/success';
import { ApiKeyService } from '@src/services/apiKey.service';
import { Auth } from '@src/type/auth.type';

@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  /**
   * create api key
   * API 키 발급
   * 사용량 측정 및 제한
   */
  @TypedRoute.Post('/api-key')
  @UseGuards(AuthGuard)
  async createApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: Auth.ApiKey.CreateDto,
  ) {
    const result = await this.apiKeyService.createApiKey(user.id, body.name);
    return wrapResponse(result);
  }
}
