import { Injectable } from '@nestjs/common';
import { ApiKey } from '@src/type/apiKey.type';
import { ApiKeyUsageRepository } from './../repository/apiKeyUsage.repository';
import { ApiKeyUsageCacheRepository } from './../repository/apiKeyUsageCache.repository';

/**
 * API 키 사용량 서비스
 *
 */
@Injectable()
export class ApiKeyUsageService {
  constructor(
    private readonly apiKeyUsageRepository: ApiKeyUsageRepository,
    private readonly apiKeyUsageCacheRepository: ApiKeyUsageCacheRepository,
  ) {}

  // TODO: API 달 사용량에대한 정보를 어느시점에서 저장할지에 대한 고민이 필요
  /**
   * 매달, 첫 사용시점에 사용량 정보(달) 생성
   * 1.해당 달 API 키 사용량 정보가 없을경우 생성
   * 2.해당 달 API 키 사용량 정보가 캐시에 없을경우 생성
   *    - DB정보가 존재할시 해당, 사용량을 캐시에 저장
   */
  async set(dto: {
    key: string;
    year: number;
    month: number;
    monthly_limit: number;
  }) {
    const exist = await this.apiKeyUsageRepository.find({
      key: dto.key,
      year: dto.year,
      month: dto.month,
    });
    if (!exist) {
      await this.apiKeyUsageRepository.create(dto);
    }

    const usage = await this.apiKeyUsageCacheRepository.find({
      key: dto.key,
      year: dto.year,
      month: dto.month,
    });
    if (!usage && usage !== 0) {
      return await this.apiKeyUsageCacheRepository.set({
        key: dto.key,
        year: dto.year,
        month: dto.month,
        usage: exist?.usage || 0,
        monthly_limit: exist?.monthly_limit || 0,
      });
    }
    return usage;
  }

  async increment(dto: ApiKey.CurrentApiKey) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const usage = await this.apiKeyUsageCacheRepository.increment({
      ...dto,
      year,
      month,
    });
    return usage;
  }

  async batchUpdateApikeyUsage() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const keys = await this.apiKeyUsageCacheRepository.getkeys(year, month);
    // TODO: batch size 설정
    // api key가 많아 질 경우 적절한 batch size를 설정해야함
    Promise.all(
      keys.map(async (key) => {
        const api_key = this.parseKey(key, year, month);
        const usage = await this.apiKeyUsageCacheRepository.find({
          key: api_key,
          year,
          month,
        });
        if (usage) {
          this.apiKeyUsageRepository.update(
            { key: api_key, year, month },
            { usage: usage.usage },
          );
        }
      }),
    );
  }

  async findCache(key: string) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    return await this.apiKeyUsageCacheRepository.find({
      key,
      year,
      month,
    });
  }

  private parseKey(key: string, year: number, month: number) {
    return key.replace(`api_key:${year}-${month}:`, '');
  }
}
