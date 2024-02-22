import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import typia from 'typia';
import { BasicAuthJWTService, JwtPayload } from '../auth.interface';
import { JWT_SERVICE } from '../constant';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any) {
    const isAPP =
      request.headers['x-client-type'] &&
      request.headers['x-client-type'] === process.env.CLIENT_TYPE;
    const token = isAPP
      ? request.headers?.authorization?.split(' ')[1]
      : request.cookies['_refresh_token'];
    if (!token) return false;

    const user = this.jwtService.refreshTokenVerify(token);
    if (!user || !typia.is<JwtPayload>(user)) return false;
    request.user = user;
    return true;
  }
}
