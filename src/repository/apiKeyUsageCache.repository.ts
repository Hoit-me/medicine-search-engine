import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
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
    year,
    month,
  }: {
    key: string;
    year: number;
    month: number;
  }): Promise<number> {
    const api_key = this.keyName(key, year, month);
    const currentUsage = (await this.cache.get<number>(api_key)) || 0;
    const newUsage = currentUsage + 1;
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
  }): Promise<number | undefined> {
    const api_key = this.keyName(key, year, month);
    return await this.cache.get<number>(api_key);
  }

  async set({
    key,
    year,
    month,
    usage,
  }: {
    key: string;
    year: number;
    month: number;
    usage: number;
  }) {
    const api_key = this.keyName(key, year, month);
    await this.cache.set(api_key, usage, { ttl: this.getTtl() } as any);
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
