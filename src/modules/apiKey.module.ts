import { Module } from '@nestjs/common';
import { ApiKeyController } from '@src/controllers/apiKey.controller';
import { ApiKeyRepository } from '@src/repository/apiKey.repository';
import { ApiKeyUsageRepository } from '@src/repository/apiKeyUsage.repository';
import { ApiKeyUsageCacheRepository } from '@src/repository/apiKeyUsageCache.repository';
import { ApiKeyService } from '@src/services/apiKey.service';
import { ApiKeyUsageService } from '@src/services/apiKeyUsage.service';

@Module({
  providers: [
    ApiKeyService,
    ApiKeyRepository,
    ApiKeyUsageService,
    ApiKeyUsageRepository,
    ApiKeyUsageCacheRepository,
  ],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, ApiKeyRepository],
})
export class ApiKeyModule {}
