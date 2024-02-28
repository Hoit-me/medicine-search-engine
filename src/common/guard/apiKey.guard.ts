import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyService } from '@src/services/apiKey.service';
import { isLeft } from 'fp-ts/lib/Either';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const api_key = request.query.api_key;
    request.api_key = api_key;
    return this.validateApiKey(api_key);
  }

  async validateApiKey(api_key?: string) {
    if (!api_key) return false;

    const result = await this.apiKeyService.checkApiKey(api_key);
    if (isLeft(result)) {
      return false;
    }
    const exist_api_key = result.right;
    await this.apiKeyService.setMonthlyUsage(exist_api_key);
    return true;
  }
}
