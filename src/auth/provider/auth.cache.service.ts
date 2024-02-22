import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { BasicAuthCacheService } from '../auth.interface';

@Injectable()
export class AuthCacheService implements BasicAuthCacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache & RedisStore) {}
  async setCache(id: string, token: string) {
    return this.cache.set(`refresh_${id}`, token, {
      // TODO: set ttl from config
      ttl: 60 * 60 * 24 * 30,
    } as any);
  }

  async deleteCache(id: string) {
    return this.cache.del(`refresh_${id}`);
  }

  async getCache(id: string) {
    return this.cache.get<string>(`refresh_${id}`);
  }

  async addBlacklist(token: string) {
    return this.cache.set(`blacklist_${token}`, 'true', {
      // TODO: set ttl from config
      ttl: 60 * 60 * 24 * 30,
    } as any);
  }

  async checkBlacklist(token: string) {
    return !!this.cache.get<string>(`blacklist_${token}`);
  }
}
