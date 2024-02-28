import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ApiKey } from '@src/type/apiKey.type';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import dayjs from 'dayjs';

@Injectable()
export class ApiKeyUsageCacheRepository {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache & RedisStore,
  ) {}

  async increment({
    key,
    usage,
    monthly_limit,
    year,
    month,
  }: {
    key: string;
    usage: number;
    monthly_limit: number;
    year: number;
    month: number;
  }): Promise<ApiKey.UsageCache> {
    const api_key = this.keyName(key, year, month);
    const newUsage = {
      monthly_limit: monthly_limit,
      usage: usage + 1,
    };
    await this.cache.set(api_key, newUsage, { ttl: this.getTtl() } as any);
    return newUsage;
  }

  async find({
    key,
    year,
    month,
  }: {
    key: string;
    year: number;
    month: number;
  }): Promise<ApiKey.UsageCache | undefined> {
    const api_key = this.keyName(key, year, month);
    return await this.cache.get<ApiKey.UsageCache>(api_key);
  }

  async set({
    key,
    year,
    month,
    usage,
    monthly_limit,
  }: {
    key: string;
    year: number;
    month: number;
    usage: number;
    monthly_limit: number;
  }) {
    const api_key = this.keyName(key, year, month);
    const usageData = { monthly_limit, usage };
    await this.cache.set(api_key, usageData, { ttl: this.getTtl() } as any);
    return usageData;
  }

  async getkeys(year: number, month: number): Promise<string[]> {
    const pattern = `api_key:${year}-${month}:*`;
    return await this.cache.store.keys(pattern);
  }

  private getTtl(day: number = 1): number {
    const endOfMonth = dayjs().endOf('month').unix();
    const now = dayjs().unix();
    const remaining = endOfMonth - now;
    const margin = 60 * 60 * 24 * day; // 배치와 같은 작업을 위한 여유 시간
    return remaining + margin;
  }

  private keyName(key: string, year: number, month: number) {
    return `api_key:${year}-${month}:${key}`;
  }
}
