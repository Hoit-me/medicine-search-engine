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
export class AuthGuard implements CanActivate {
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
    const token = request.headers?.authorization?.split(' ')[1];
    if (!token) return false;

    const user = this.jwtService.accessTokenVerify(token);
    if (!user || !typia.is<JwtPayload>(user)) return false;
    request.user = user;
    return true;
  }
}
