import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import dayjs from 'dayjs';

/**
 * API 키 사용량 서비스
 *
 */
@Injectable()
export class ApiKeyUsageService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache & RedisStore,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * createMonthlyUsage
   */
  // async createMonthlyUsage(apiKey: string): Promise<void> {}

  // API 사용량을 증가시키고, 현재 사용량을 반환합니다.
  async incrementUsage(apiKey: string): Promise<number> {
    const key = this.generateKey(apiKey);
    const currentUsage = (await this.cache.get<number>(key)) || 0;
    const newUsage = currentUsage + 1;
    await this.cache.set(key, newUsage, { ttl: this.getTtl() } as any);
    return newUsage;
  }

  // 현재 달의 API 사용량을 조회합니다.
  async getCurrentUsage(apiKey: string): Promise<number> {
    const key = this.generateKey(apiKey);
    return (await this.cache.get<number>(key)) || 0;
  }

  // API 키와 현재 연도 및 월을 기반으로 레디스 키를 생성합니다.
  private generateKey(apiKey: string): string {
    const now = dayjs().format('YYYY-MM');
    return `api_key:${now}:${apiKey}`;
  }

  // 달의 남은 시간에 따른 TTL(초 단위)을 계산합니다.
  private getTtl(): number {
    const endOfMonth = dayjs().endOf('month').unix();
    const now = dayjs().unix();
    return endOfMonth - now;
  }
}
