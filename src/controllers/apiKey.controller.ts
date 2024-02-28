import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JwtPayload } from '@src/auth/auth.interface';
import { AuthGuard } from '@src/auth/guard/auth.guard';
import { CurrentApiKey } from '@src/common/decorator/CurrentApiKey';
import { CurrentUser } from '@src/common/decorator/CurrentUser';
import { ApiKeyGuard } from '@src/common/guard/apiKey.guard';
import { ApiKeyIncreaseInterceptor } from '@src/common/interceptor/apikeyIncrease.interceptor';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { ApiKeyError } from '@src/constant/error/apiKey.error';
import { ApiKeyUsageCacheRepository } from '@src/repository/apiKeyUsageCache.repository';
import { ApiKeyService } from '@src/services/apiKey.service';
import { ApiKeyUsageService } from '@src/services/apiKeyUsage.service';
import { ApiKey } from '@src/type/apiKey.type';
import { SUCCESS } from '@src/type/success';

@Controller('api-key')
export class ApiKeyController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyUsageService: ApiKeyUsageService,
    private readonly apiKeyUsageCacheRepository: ApiKeyUsageCacheRepository,
  ) {}
  /**
   * create api key
   * API 키 발급
   * 사용량 측정 및 제한
   */
  @TypedRoute.Post('/')
  @UseGuards(AuthGuard)
  async createApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: ApiKey.CreateDto,
  ): Promise<SUCCESS<ApiKey>> {
    const result = await this.apiKeyService.createApiKey(user.id, body.name);
    return wrapResponse(result);
  }

  /**
   * get api key list
   * API 키 목록 조회
   * 사용량 측정 및 제한
   */
  @TypedRoute.Get('/')
  @UseGuards(AuthGuard)
  async getApiKeyList(
    @CurrentUser() user: JwtPayload,
  ): Promise<SUCCESS<ApiKey.GetListOutput>> {
    const result = await this.apiKeyService.getApiKeyList(user.id);
    return wrapResponse(result);
  }

  /**
   * delete api key
   * API 키 삭제 (soft delete) - 30일 후 완전 삭제
   */
  @TypedRoute.Delete('/')
  @UseGuards(AuthGuard)
  async deleteApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: ApiKey.DeleteDto,
  ): Promise<SUCCESS<true> | ApiKeyError.API_KEY_NOT_FOUND> {
    const result = await this.apiKeyService.softDeleteApiKey(user.id, body.key);
    return eitherToResponse(result);
  }

  /**
   * get api key detail
   * API 키 상세 조회
   */
  @TypedRoute.Get('/:key')
  @UseGuards(AuthGuard)
  async getApiKey(
    @CurrentUser() user: JwtPayload,
    @TypedBody() body: ApiKey.DeleteDto,
  ): Promise<SUCCESS<ApiKey.GetDetailOutput> | ApiKeyError.API_KEY_NOT_FOUND> {
    const result = await this.apiKeyService.getApiKeyDetail(user.id, body.key);
    return eitherToResponse(result);
  }

  @TypedRoute.Get('/increment/test')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(ApiKeyIncreaseInterceptor)
  async incrementTest() {
    return wrapResponse('result');
  }

  @TypedRoute.Get('/set/test')
  @UseGuards(ApiKeyGuard)
  async setTest(@CurrentApiKey() api_key: ApiKey.CurrentApiKey) {
    console.log(api_key);
    await this.apiKeyUsageCacheRepository.set({
      key: api_key.key,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      monthly_limit: 10,
      usage: 0,
    });

    return wrapResponse('result');
  }

  //
  @Cron('0 0 * * *')
  async batchUpdateApikeyUsage() {
    await this.apiKeyUsageService.batchUpdateApikeyUsage();
  }
}
