import { Module } from '@nestjs/common';
import { ApiKeyController } from '@src/controllers/apiKey.controller';
import { ApiKeyRepository } from '@src/repository/apiKey.repository';
import { ApiKeyService } from '@src/services/apiKey.service';

@Module({
  imports: [ApiKeyService, ApiKeyRepository],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, ApiKeyRepository],
})
export class ApiKeyModule {}
