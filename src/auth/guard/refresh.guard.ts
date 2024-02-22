import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import typia from 'typia';
import {
  BasicAuthCacheService,
  BasicAuthJWTService,
  JwtPayload,
} from '../auth.interface';
import { AUTH_CACHE_SERVICE, JWT_SERVICE } from '../constant';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
    @Inject(AUTH_CACHE_SERVICE)
    private readonly cacheService: BasicAuthCacheService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private async validateRequest(request: any) {
    const token = this.extractToken(request);
    if (!token) return false;

    const user = this.jwtService.refreshTokenVerify(token);
    if (!user || !this.isValidPayload(user)) return false;

    if (!(await this.isTokenValid(user.id, token))) return false;

    request.user = user;
    return true;
  }

  private async isTokenValid(id: string, token: string) {
    const cacheToken = await this.cacheService.getCache(id);
    if (cacheToken !== token) {
      await this.addToBlacklist(token);
      cacheToken && (await this.addToBlacklist(cacheToken));
      return false;
    }

    return !(await this.cacheService.checkBlacklist(token));
  }

  private async addToBlacklist(token: string | null) {
    if (!token) return;
    await this.cacheService.addBlacklist(token);
  }

  private extractToken(request: any) {
    const isAPP =
      request.headers['x-client-type'] &&
      request.headers['x-client-type'] === process.env.CLIENT_TYPE;
    return isAPP
      ? request.headers?.authorization?.split(' ')[1]
      : request.cookies['_refresh_token'];
  }

  private isValidPayload(payload: any): payload is JwtPayload {
    return typia.is<JwtPayload>(payload);
  }
}
