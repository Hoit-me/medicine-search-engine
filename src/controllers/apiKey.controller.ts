import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@src/auth/auth.interface';
import { AuthGuard } from '@src/auth/guard/auth.guard';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { ApiKeyError } from '@src/constant/error/apiKey.error';
import { ApiKeyService } from '@src/services/apiKey.service';
import { ApiKey } from '@src/type/apiKey.type';
import { SUCCESS } from '@src/type/success';

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
    @TypedBody() body: ApiKey.CreateDto,
  ) {
    const result = await this.apiKeyService.createApiKey(user.id, body.name);
    return wrapResponse(result);
  }

  /**
   * get api key list
   * API 키 목록 조회
   * 사용량 측정 및 제한
   */
  @TypedRoute.Get('/api-key')
  @UseGuards(AuthGuard)
  async getApiKeyList(@CurrentUser() user: JwtPayload) {
    const result = await this.apiKeyService.getApiKeyList(user.id);
    return wrapResponse(result);
  }

  /**
   * delete api key
   * API 키 삭제 (soft delete) - 30일 후 완전 삭제
   */
  @TypedRoute.Delete('/api-key')
  @UseGuards(AuthGuard)
  async deleteApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: ApiKey.DeleteDto,
  ): Promise<SUCCESS<true> | ApiKeyError.API_KEY_NOT_FOUND> {
    const result = await this.apiKeyService.softDeleteApiKey(user.id, body.key);
    return eitherToResponse(result);
  }

  @TypedRoute.Get('/api-key/:key')
  @UseGuards(AuthGuard)
  async getApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: ApiKey.DeleteDto,
  ) {
    const result = await this.apiKeyService.getApiKeyDetail(user.id, body.key);
    return eitherToResponse(result);
  }
}
