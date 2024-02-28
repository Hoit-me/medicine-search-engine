import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyService } from '@src/services/apiKey.service';
import { ApiKeyUsageService } from '@src/services/apiKeyUsage.service';
import { ApiKey } from '@src/type/apiKey.type';
import { isLeft } from 'fp-ts/lib/Either';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly apiKeyUsageService: ApiKeyUsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateApiKey(request);
  }
  async validateApiKey(request: any): Promise<boolean> {
    const requestedApiKey = request.query.api_key;
    if (!requestedApiKey) return false;

    const cacheCheckResult = await this.checkCachedApiKeyInfo(
      requestedApiKey,
      request,
    );
    if (cacheCheckResult) {
      return cacheCheckResult.monthly_limit > cacheCheckResult.usage;
    }

    return this.validateAndSetApiKeyUsage(requestedApiKey, request);
  }

  async checkCachedApiKeyInfo(
    requestedApiKey: string,
    request: any,
  ): Promise<ApiKey.UsageCache | null> {
    const cachedApiKeyInfo =
      await this.apiKeyUsageService.findCache(requestedApiKey);
    if (cachedApiKeyInfo) {
      const apiKey = { ...cachedApiKeyInfo, key: requestedApiKey };
      request.api_key = apiKey;
      return apiKey;
    }
    return null;
  }

  async validateAndSetApiKeyUsage(
    requestedApiKey: string,
    request: any,
  ): Promise<boolean> {
    const apiKeyValidationResult =
      await this.apiKeyService.checkApiKey(requestedApiKey);
    if (isLeft(apiKeyValidationResult)) {
      return false;
    }
    const updatedApiKeyInfo = apiKeyValidationResult.right;
    const input = {
      key: requestedApiKey,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      monthly_limit: updatedApiKeyInfo.default_limit,
    };
    const apiUsageSetResult = await this.apiKeyUsageService.set(input);
    if (apiUsageSetResult.monthly_limit <= apiUsageSetResult.usage)
      return false;
    request.api_key = { ...apiUsageSetResult, key: requestedApiKey };
    return true;
  }
}
