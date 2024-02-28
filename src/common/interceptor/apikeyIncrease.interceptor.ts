import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiKeyUsageService } from '@src/services/apiKeyUsage.service';
import { ApiKey } from '@src/type/apiKey.type';
import { map } from 'rxjs/operators';
import { isError } from '../res/error';

@Injectable()
export class ApiKeyIncreaseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly apiKeyUsageService: ApiKeyUsageService) {}

  intercept(context: ExecutionContext, next: CallHandler<T>) {
    const req = context.switchToHttp().getRequest();
    const api_key = req.api_key as ApiKey.CurrentApiKey;

    return next.handle().pipe(
      map((data) => {
        if (isError(data)) {
          return data;
        }
        this.apiKeyUsageService.increment(api_key);
        return data;
      }),
    );
  }
}
